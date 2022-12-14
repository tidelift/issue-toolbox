import {setFailed, notice, info} from '@actions/core'
import {context as githubContext} from '@actions/github'
import {findCurrentIssue, IssueNotFoundError} from './issue'
import {Scanner} from './scanner'

async function run(): Promise<void> {
  try {
    const scanner = new Scanner()
    const issue = findCurrentIssue(githubContext, scanner.config.issue_number)
    const message = await scanner.perform(issue)

    info(message)
  } catch (error) {
    if (error instanceof IssueNotFoundError) {
      notice('Could not find current issue. Skipping.')
    } else if (error instanceof Error) {
      setFailed(error)
    } else {
      setFailed(String(error))
    }
  }
}

run()
