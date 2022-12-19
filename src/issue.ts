import {IssueData} from './github_client'
import {notBlank} from './utils'

export type IssueNumber = number
export type PossibleIssueNumber = number | string | void
export type IssueContext = {
  owner: string
  repo: string
  issue_number: IssueNumber
}

export class IssueNotFoundError extends Error {}

export class Issue implements IssueContext {
  owner: string
  repo: string
  issue_number: IssueNumber
  data?: IssueData

  constructor({
    owner,
    repo,
    issue_number,
    data
  }: IssueContext & {data?: IssueData}) {
    this.owner = owner
    this.repo = repo
    this.issue_number = issue_number
    this.data = data
  }

  get context(): IssueContext {
    return {
      owner: this.owner,
      repo: this.repo,
      issue_number: this.issue_number
    }
  }

  get has_assignees(): boolean {
    return !!this.data?.assignees && this.data.assignees.length > 0
  }

  get searchable_text(): string[] {
    const searchable_fields = ['title', 'body']

    return searchable_fields
      .map(field => this.data && this.data[field])
      .filter(notBlank)
  }
}

export function findCurrentIssue(
  github_cxt,
  issue_number: PossibleIssueNumber
): Issue {
  return new Issue(findIssueContext(github_cxt, issue_number))
}

function findIssueContext(
  context,
  issue_number: PossibleIssueNumber
): IssueContext {
  const repo = context.payload?.repository?.name
  const owner = context.payload?.repository?.owner?.login
  issue_number = findIssueNumber(context, issue_number)

  if (repo && owner && issue_number) return {repo, owner, issue_number}

  throw new IssueNotFoundError()
}

function findIssueNumber(
  context,
  issue_number: PossibleIssueNumber
): IssueNumber {
  const possible_number =
    issue_number ||
    context.payload?.issue?.number ||
    context.payload?.pull_request?.number

  if (possible_number) return Number(possible_number)

  throw new IssueNotFoundError()
}
