import {expect, describe, test} from '@jest/globals'
import {GithubClient} from '../src/github_client'
import {Configuration} from '../src/configuration'

const github = new GithubClient(Configuration.defaults().github_token)

describe('getCveForGhsa', () => {
  test('searches CVE ids, normalizes them', async () => {
    const subject = await github.getCveForGhsa('GHSA-vv3r-fxqp-vr3f')

    expect(subject).toEqual('CVE-2022-38147')
  })
})
