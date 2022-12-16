import {default as axios} from 'axios'
import {TideliftRecommendation} from './tidelift_recommendation'
import {concurrently} from './utils'
import {VulnerabilityId} from './scanner'

export class TideliftClient {
  api_key: string
  client

  constructor(api_key: string) {
    this.api_key = api_key
    this.client = axios.create({
      baseURL: 'https://api.tidelift.com/external-api/v1',
      headers: {
        Authorization: `Bearer ${api_key}`
      },
      validateStatus: status =>
        (status >= 200 && status < 300) || status === 404
    })
  }

  async fetchRecommendation(
    vuln: VulnerabilityId
  ): Promise<TideliftRecommendation | undefined> {
    const response = await this.client.get(
      `/vulnerability/${vuln}/recommendation`
    )

    if (response.status === 404) {
      return
    }

    return new TideliftRecommendation(vuln, response.data)
  }

  async fetchRecommendations(
    vulns: VulnerabilityId[]
  ): Promise<TideliftRecommendation[]> {
    return await concurrently(vulns, async vuln =>
      this.fetchRecommendation(vuln)
    )
  }
}
