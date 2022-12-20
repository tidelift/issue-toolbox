import {getOctokit} from '@actions/github'
import {IssueContext} from './issue'

import type {GitHub} from '@actions/github/lib/utils'
import type {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods'
import type {GraphQlQueryResponseData} from '@octokit/graphql'

export type IssueData =
  RestEndpointMethodTypes['issues']['get']['response']['data']
export type CommentData =
  RestEndpointMethodTypes['issues']['getComment']['response']['data']

export class GithubClient {
  octokit: InstanceType<typeof GitHub>

  constructor(token: string) {
    this.octokit = getOctokit(token)
  }

  async graphql({query, ...options}): Promise<GraphQlQueryResponseData> {
    return this.octokit.graphql({query, ...options})
  }

  async translate_ghsa_to_cve(ghsa_id: string): Promise<string | undefined> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const {securityAdvisory} = await this.graphql({
      query: `query advisoryIds($ghsa_id:String!) {
        securityAdvisory(ghsaId: $ghsa_id) {
           identifiers{
             type
             value
           }
         }        
       }`,
      ghsa_id
    })

    return securityAdvisory.identifiers.find(i => i['type'] === 'CVE')?.value
  }

  async get_issue({
    repo,
    owner,
    issue_number
  }: IssueContext): Promise<IssueData> {
    const {data} = await this.octokit.rest.issues.get({
      repo,
      owner,
      issue_number
    })

    return data
  }

  async list_issues({
    repo,
    owner,
    state = 'all',
    sort = 'created',
    direction = 'desc'
  }: {
    repo: string
    owner: string
    state?: 'all' | 'open' | 'closed'
    sort?: 'created' | 'updated' | 'comments'
    direction?: 'asc' | 'desc'
  }): Promise<IssueData[]> {
    const {data} = await this.octokit.rest.issues.listForRepo({
      repo,
      owner,
      state,
      sort,
      direction
    })

    return data
  }

  async list_comments({
    repo,
    owner,
    issue_number
  }: IssueContext): Promise<CommentData[]> {
    const {data} = await this.octokit.rest.issues.listComments({
      repo,
      owner,
      issue_number
    })

    return data
  }

  async add_comment(
    {repo, owner, issue_number}: IssueContext,
    body: string
  ): Promise<
    RestEndpointMethodTypes['issues']['createComment']['response']['data']
  > {
    const {data} = await this.octokit.rest.issues.createComment({
      repo,
      owner,
      issue_number,
      body
    })

    return data
  }

  async add_labels(
    {repo, owner, issue_number}: IssueContext,
    labels: string[]
  ): Promise<
    RestEndpointMethodTypes['issues']['addLabels']['response']['data']
  > {
    const {data} = await this.octokit.rest.issues.addLabels({
      repo,
      owner,
      issue_number,
      labels
    })

    return data
  }
}
