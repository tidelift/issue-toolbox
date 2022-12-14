import {default as axios} from 'axios'
import {TideliftRecommendation} from './tidelift_recommendation'
import {concurrently} from './utils'
import {VulnerabilityId} from './scanner'

export class TideliftClient {
  token: string
  client

  constructor(token: string) {
    this.token = token
    this.client = axios.create({
      baseURL: 'https://api.tidelift.com/external-api/v1',
      headers: {
        Authorization: `Bearer ${token}`
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
