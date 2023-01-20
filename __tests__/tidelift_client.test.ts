import {expect, describe, test} from '@jest/globals'
import {Configuration} from '../src/configuration'
import {TideliftClient} from '../src/tidelift_client'
import {Vulnerability} from '../src/vulnerability'

const tidelift = new TideliftClient(
  Configuration.defaults().tidelift_api_key || 'NO_TOKEN'
)
const fakeVuln = 'CVE-5555-1234'
const realVuln = 'cve-2021-3807'

describe('fetch_vulnerability', () => {
  test('when not found, returns nothing', async () => {
    expect(await tidelift.fetch_vulnerability(fakeVuln)).toBe(undefined)
  })

  test('when found, returns shiny recommendation', async () => {
    // https://api.tidelift.com/external-api/v1/vulnerabilities/CVE-5555-1234
    let resp = await tidelift.fetch_vulnerability(realVuln)
    expect(await tidelift.fetch_vulnerability(realVuln)).toBeInstanceOf(
      Vulnerability
    )
  })
})

describe('fetch_vulnerabilities', () => {
  test('compacted array', async () => {
    const vuln_ids = [realVuln, fakeVuln]
    expect(await tidelift.fetch_vulnerabilities(vuln_ids)).toHaveLength(1)
  })
})
