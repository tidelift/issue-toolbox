import {Axios, default as axios} from 'axios'
import {TideliftRecommendation} from './tidelift_recommendation'
import {Vulnerability} from './vulnerability'
import {concurrently} from './utils'
import {VulnerabilityId} from './scanner'

export class TideliftClient {
  api_key: string
  client: Axios

  constructor(api_key: string) {
    this.api_key = api_key

    /* eslint-disable @typescript-eslint/naming-convention */ //
    this.client = axios.create({
      baseURL: 'https://api.tidelift.com/external-api/v1',
      headers: {
        Authorization: `Bearer ${api_key}`
      },
      validateStatus: status =>
        (status >= 200 && status < 300) || status === 404
    })
    /* eslint-enable @typescript-eslint/naming-convention */ //
  }

  async fetch_vulnerability(
    vuln: VulnerabilityId
  ): Promise<Vulnerability | undefined> {
    const response = await this.client.get(
      `/vulnerabilities/${vuln}`
    )

    if (response.status === 404) {
      return
    }

    return new Vulnerability(vuln, response.data)
  }

  async fetch_vulnerabilities(
    vulns: VulnerabilityId[]
  ): Promise<Vulnerability[]> {
    return await concurrently(vulns, async vuln =>
      this.fetch_vulnerability(vuln)
    )
  }
}
