import {getInput} from '@actions/core'
import {Vulnerability} from './vulnerability'
import * as dotenv from 'dotenv'
import {PossibleIssueNumber} from './issue'
import {VulnerabilityId} from './scanner'
dotenv.config()

type TemplateSet = {
  vuln_label: (vuln_id: string) => string
  recommendation_comment: (vuln: Vulnerability) => string
  has_recommendation_label: () => string
  possible_duplicate_label: () => string
  possible_duplicate_comment: (
    vuln_id: VulnerabilityId,
    issue_number: string | number
  ) => string
}

export class Configuration {
  issue_number: PossibleIssueNumber
  tidelift_api_key?: string
  github_token: string
  ignore_if_assigned: boolean
  disable_recommendations: boolean
  disable_labels: boolean
  templates: TemplateSet

  constructor(options: Partial<Configuration> = {}) {
    const defaults = Configuration.defaults()

    this.issue_number = options['issue_number'] || defaults['issue_number']
    this.github_token = options['github_token'] || defaults['github_token']
    this.tidelift_api_key =
      options['tidelift_api_key'] || defaults['tidelift_api_key']
    this.ignore_if_assigned =
      options['ignore_if_assigned'] || defaults['ignore_if_assigned']
    this.disable_recommendations =
      options['disable_recommendations'] || defaults['disable_recommendations']
    this.disable_labels =
      options['disable_labels'] || defaults['disable_labels']
    this.templates = options['templates'] || defaults['templates']
  }

  static defaults(): Configuration {
    const github_token = getInput('repo-token') || process.env.GITHUB_TOKEN
    if (!github_token) {
      throw new Error('Could not initialize github client from env')
    }

    return {
      issue_number: getInput('issue-number'),
      ignore_if_assigned: isTruthy(getInput('ignore-if-assigned')),
      disable_recommendations: isTruthy(getInput('disable-recommendations')),
      disable_labels: isTruthy(getInput('disable-labels')),
      tidelift_api_key:
        getInput('tidelift-api-key') || process.env.TIDELIFT_API_KEY,
      github_token,
      templates: {
        vuln_label: formatVulnerabilityLabel,
        recommendation_comment: formatRecommendationComment,
        has_recommendation_label: formatHasRecommenationLabel,
        possible_duplicate_label: formatPossibleDuplicateLabel,
        possible_duplicate_comment: formatPossibleDuplicateComment
      }
    }
  }
}

function formatVulnerabilityLabel(vuln_id: string): string {
  return `:yellow_circle: ${vuln_id}`
}

function formatHasRecommenationLabel(): string {
  return `:green_circle: has-recommendation`
}

function formatPossibleDuplicateLabel(): string {
  return `:large_blue_circle: possible-duplicate`
}

//TODO: Add unaffected releases when available from API
function formatRecommendationComment(vulnerability: Vulnerability): string {
  return `:wave: It looks like you are talking about *${vulnerability.vuln_id}*.  The maintainer has provided more information to help you handle this CVE.

> Is this a real issue with this project? *${vulnerability.recommendation?.real_issue}*

${vulnerability.recommendation?.false_positive_reason}

> How likely are you impacted (out of 10)? *${vulnerability.recommendation?.impact_score}*

${vulnerability.recommendation?.impact_description}

> Is there a workaround available? *${vulnerability.recommendation?.workaround_available}*

${vulnerability.recommendation?.workaround_description}

Data provided by [Tidelift](https://tidelift.com), in partnership with the maintainer of this project`
}

function formatPossibleDuplicateComment(
  vuln_id: string,
  issue_number: string | number
): string {
  return `An issue referencing *${vuln_id}* was first filed in #${issue_number}. If your issue is different from this, please let us know.`
}

function isTruthy(val): boolean {
  return ['true', 't', 'yes'].includes(String(val).toLowerCase())
}
