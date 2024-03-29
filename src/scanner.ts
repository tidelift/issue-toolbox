import {notBlank, unique} from './utils'
import {Configuration} from './configuration'
import {Issue} from './issue'
import {
  createRecommendationsCommentIfNeeded,
  createDuplicatesCommentIfNeeded
} from './comment'
import {TideliftClient} from './tidelift_client'
import {GithubClient} from './github_client'
import {warning} from '@actions/core'
import {Vulnerability} from './vulnerability'

export type VulnerabilityId = string
export type VulnerabilityIdSet = Set<VulnerabilityId>
export type Mentions = Map<VulnerabilityId, number>

export class Scanner {
  config: Configuration
  github: GithubClient
  tidelift?: TideliftClient

  constructor(
    options: Partial<Configuration> & {
      tidelift?: TideliftClient
      github?: GithubClient
    } = {}
  ) {
    this.config = new Configuration(options)
    this.github =
      options['github'] || new GithubClient(this.config.github_token)

    this.tidelift = options['tidelift']
    if (this.config.tidelift_api_key) {
      this.tidelift ||= new TideliftClient(this.config.tidelift_api_key)
    }
  }

  static statuses = {
    no_issue_data: context => `Could not get issue data for ${context}`,
    ignored_assigned: () =>
      `No action being taken. Ignoring because one or more assignees have been added to the issue`,
    no_vulnerabilities: () => 'Did not find any vulnerabilities mentioned',
    success: vulns =>
      `Detected mentions of: ${[...vulns.map(v => v.vuln_id)]}
       With recommendations on: ${vulns
         .filter(v => v.recommendation)
         .map(v => v.vuln_id)}`
  }

  async perform(issue: Issue): Promise<string> {
    try {
      issue.data = await this.github.get_issue(issue)
    } catch {
      return Scanner.statuses.no_issue_data(issue.context)
    }

    if (this.config.ignore_if_assigned && issue.has_assignees) {
      return Scanner.statuses.ignored_assigned()
    }

    const vuln_ids = await this.find_all(issue.searchable_text)
    const vulnerabilities = await this.find_vulnerabilities(vuln_ids)
    const vulnerabilities_with_recs = vulnerabilities.filter(
      v => v.recommendation
    )
    const duplicates = await this.check_duplicates(issue, vuln_ids)

    if (vulnerabilities.length === 0) {
      return Scanner.statuses.no_vulnerabilities()
    }
    const labels_to_add = [...vulnerabilities.values()].map(vuln =>
      this.config.templates.vuln_label(vuln.vuln_id)
    )

    if (vulnerabilities_with_recs.length > 0) {
      labels_to_add.push(this.config.templates.has_recommendation_label())

      createRecommendationsCommentIfNeeded(
        issue,
        vulnerabilities_with_recs,
        this.github,
        this.config.templates.recommendation_comment
      )
    }

    if (duplicates.size > 0) {
      labels_to_add.push(this.config.templates.possible_duplicate_label())

      createDuplicatesCommentIfNeeded(
        issue,
        duplicates,
        this.github,
        this.config.templates.possible_duplicate_comment
      )
    }

    await this.apply_labels(issue, labels_to_add)

    return Scanner.statuses.success(vulnerabilities)
  }

  async find_all(fields: string[]): Promise<VulnerabilityIdSet> {
    return new Set([
      ...this.find_cves(fields),
      ...(await this.find_ghsas(fields))
    ])
  }

  find_cves(fields: string[]): VulnerabilityIdSet {
    return new Set(fields.flatMap(scanCve))
  }

  async find_ghsas(fields: string[]): Promise<VulnerabilityIdSet> {
    if (!this.github) {
      warning('No github client for lookup')
      return new Set()
    }

    const vulnerabilities = new Set<VulnerabilityId>()

    for await (const ghsa_id of fields.flatMap(scanGhsa).filter(unique)) {
      const possible_cve = await this.github.translate_ghsa_to_cve(ghsa_id)

      if (possible_cve) {
        vulnerabilities.add(possible_cve)
      }
    }

    return vulnerabilities
  }

  async find_vulnerabilities(
    vulnerabilities: VulnerabilityIdSet
  ): Promise<Vulnerability[]> {
    if (this.config.disable_recommendations) {
      return []
    }

    if (!this.tidelift) {
      warning('No Tidelift client for lookup')
      return []
    }

    return await this.tidelift.fetch_vulnerabilities([
      ...vulnerabilities.values()
    ])
  }

  async check_duplicates(
    {repo, owner}: Pick<Issue, 'repo' | 'owner'>,
    vulnerabilities: VulnerabilityIdSet
  ): Promise<Mentions> {
    if (!this.github) {
      warning('No github client for lookup')
      return new Map()
    }

    const issues_data = await this.github?.list_issues({
      repo,
      owner,
      sort: 'created',
      direction: 'asc'
    })

    if (!issues_data) {
      warning('Could not check other issues on repository')
      return new Map()
    }

    const mentions = new Map()

    for (const vuln of vulnerabilities) {
      const issue_number = issues_data.find(async ({title, body}) => {
        const issue_vulns = await this.find_all([title, String(body)])
        return issue_vulns.has(vuln)
      })?.number

      if (issue_number) mentions.set(vuln, issue_number)
    }

    return mentions
  }

  async apply_labels(issue: Issue, labels: string[]): Promise<void | {}> {
    if (!this.config.disable_labels) {
      return this.github?.add_labels(issue, labels)
    }
  }
}

export function scanGhsa(text: string): VulnerabilityId[] {
  const regex = /GHSA-\w{4}-\w{4}-\w{4}/gi

  return (String(text).match(regex) || []).filter(notBlank)
}

export function scanCve(text: string): VulnerabilityId[] {
  const regex = /CVE-\d{4}-\d+/gi

  return (String(text).match(regex) || [])
    .filter(notBlank)
    .map(str => str.toUpperCase())
}
