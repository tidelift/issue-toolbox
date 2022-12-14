import {getOctokit} from '@actions/github'
import {issueContext} from './issue'

import type {GitHub} from '@actions/github/lib/utils'
import type {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods'
import type {GraphQlQueryResponseData} from '@octokit/graphql'

export type issueData =
  RestEndpointMethodTypes['issues']['get']['response']['data']
export type commentData =
  RestEndpointMethodTypes['issues']['getComment']['response']['data']
export type commentsData =
  RestEndpointMethodTypes['issues']['listComments']['response']['data']

export class GithubClient {
  octokit: InstanceType<typeof GitHub>

  constructor(token: string) {
    this.octokit = getOctokit(token)
  }

  async graphql({query, ...options}): Promise<GraphQlQueryResponseData> {
    return this.octokit.graphql({query, ...options})
  }

  async getCveForGhsa(ghsa_id: string): Promise<string | undefined> {
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

  async getIssue({
    repo,
    owner,
    issue_number
  }: issueContext): Promise<issueData> {
    const {data} = await this.octokit.rest.issues.get({
      repo,
      owner,
      issue_number
    })

    return data
  }

  async listIssues({
    repo,
    owner
  }: {
    repo: string
    owner: string
  }): Promise<issueData[]> {
    const {data} = await this.octokit.rest.issues.listForRepo({
      repo,
      owner,
      state: 'all'
    })

    return data
  }

  async listComments({
    repo,
    owner,
    issue_number
  }: issueContext): Promise<commentsData> {
    const {data} = await this.octokit.rest.issues.listComments({
      repo,
      owner,
      issue_number
    })

    return data
  }

  async addComment(
    {repo, owner, issue_number}: issueContext,
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

  async addLabels(
    {repo, owner, issue_number}: issueContext,
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
