import {expect, describe, test} from '@jest/globals'
import {Issue, findCurrentIssue, IssueNotFoundError} from '../src/issue'

describe('findCurrentIssue', () => {
  let sampleContext = {
    payload: {
      issue: {number: 1},
      repository: {
        owner: {login: 'github'},
        name: 'codeql'
      }
    }
  }

  test('uses a given issue number', async () => {
    const issue_number = 3
    const subject = findCurrentIssue(sampleContext, issue_number)

    expect(subject.issue_number).toEqual(3)
  })

  test('parses given context for issue number', async () => {
    const issue_number = ''
    let subject = findCurrentIssue(sampleContext, issue_number)
    expect(subject.issue_number).toEqual(1)
  })

  test('parses given github context for needed issue details', async () => {
    let subject = findCurrentIssue(sampleContext)
    expect(subject.repo).toEqual('codeql')
    expect(subject.owner).toEqual('github')
  })

  test('throws error if missing an identifier', async () => {
    expect(() => {
      findCurrentIssue({})
    }).toThrowError(IssueNotFoundError)
  })
})
