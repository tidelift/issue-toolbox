import {issueData} from './github_client'
import {notBlank} from './utils'

export type issueNumber = number
export type possibleIssueNumber = number | string | void
export type issueContext = {
  owner: string
  repo: string
  issue_number: issueNumber
}

export class IssueNotFoundError extends Error {}

export class Issue implements issueContext {
  owner: string
  repo: string
  issue_number: issueNumber
  data?: issueData

  constructor({
    owner,
    repo,
    issue_number,
    data
  }: issueContext & {data?: issueData}) {
    this.owner = owner
    this.repo = repo
    this.issue_number = issue_number
    this.data = data
  }

  get context(): issueContext {
    return {owner: this.owner, repo: this.repo, issue_number: this.issue_number}
  }

  get hasAssignees(): boolean {
    return !!this.data?.assignees && this.data.assignees.length > 0
  }

  get searchableText(): string[] {
    const searchableFields = ['title', 'body']

    return searchableFields
      .map(field => this.data && this.data[field])
      .filter(notBlank)
  }
}

export function findCurrentIssue(
  githubContext,
  issue_number: possibleIssueNumber
): Issue {
  return new Issue(findIssueContext(githubContext, issue_number))
}

function findIssueContext(
  context,
  issue_number: possibleIssueNumber
): issueContext {
  const repo = context.payload?.repository?.name
  const owner = context.payload?.repository?.owner?.login
  issue_number = findIssueNumber(context, issue_number)

  if (repo && owner && issue_number) return {repo, owner, issue_number}

  throw new IssueNotFoundError()
}

function findIssueNumber(
  context,
  issue_number: possibleIssueNumber
): issueNumber {
  const possibleNumber =
    issue_number ||
    context.payload?.issue?.number ||
    context.payload?.pull_request?.number

  if (possibleNumber) return Number(possibleNumber)

  throw new IssueNotFoundError()
}
