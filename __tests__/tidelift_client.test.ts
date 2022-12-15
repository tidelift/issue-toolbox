import {expect, describe, test} from '@jest/globals'
import {Configuration} from '../src/configuration'
import {TideliftClient} from '../src/tidelift_client'
import {TideliftRecommendation} from '../src/tidelift_recommendation'

const tidelift = new TideliftClient(
  Configuration.defaults().tidelift_api_key || 'NO_TOKEN'
)
const fakeVuln = 'CVE-5555-1234'
const realVuln = 'cve-2021-3807'

describe('fetchRecommendation', () => {
  test('when not found, returns nothing', async () => {
    expect(await tidelift.fetchRecommendation(fakeVuln)).toBe(undefined)
  })

  test('when found, returns shiny recommendation', async () => {
    expect(await tidelift.fetchRecommendation(realVuln)).toBeInstanceOf(
      TideliftRecommendation
    )
  })
})

describe('fetchRecommendations', () => {
  test('compacted array', async () => {
    const vulns = [realVuln, fakeVuln]
    expect(await tidelift.fetchRecommendations(vulns)).toHaveLength(1)
  })
})
