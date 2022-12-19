import {expect, describe, test} from '@jest/globals'
import {Configuration} from '../src/configuration'
import {TideliftClient} from '../src/tidelift_client'
import {TideliftRecommendation} from '../src/tidelift_recommendation'

const tidelift = new TideliftClient(
  Configuration.defaults().tidelift_api_key || 'NO_TOKEN'
)
const fakeVuln = 'CVE-5555-1234'
const realVuln = 'cve-2021-3807'

describe('fetch_recommendation', () => {
  test('when not found, returns nothing', async () => {
    expect(await tidelift.fetch_recommendation(fakeVuln)).toBe(undefined)
  })

  test('when found, returns shiny recommendation', async () => {
    expect(await tidelift.fetch_recommendation(realVuln)).toBeInstanceOf(
      TideliftRecommendation
    )
  })
})

describe('fetch_recommendations', () => {
  test('compacted array', async () => {
    const vulns = [realVuln, fakeVuln]
    expect(await tidelift.fetch_recommendations(vulns)).toHaveLength(1)
  })
})
