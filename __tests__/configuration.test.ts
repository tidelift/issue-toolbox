import {expect, describe, test} from '@jest/globals'
import {Configuration} from '../src/configuration'

describe('defaults', () => {
  test('defaults', async () => {
    let defaults = Configuration.defaults()
    let subject = new Configuration()

    for (const [key, default_value] of Object.entries(defaults)) {
      expect(subject[key]).toEqual(default_value)
    }
  })

  test('defaults', async () => {
    let defaults = Configuration.defaults()
    let subject = new Configuration({tidelift_token: 'foo'})

    expect(subject.tidelift_token).toEqual('foo')
    for (const [key, default_value] of Object.entries(defaults)) {
      let expected = default_value
      if (key === 'tidelift_token') expected = 'foo'

      expect(subject[key]).toEqual(expected)
    }
  })
})
