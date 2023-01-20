import {expect, describe, test} from '@jest/globals'
import {scanGhsa, scanCve, Scanner} from '../src/scanner'
import {Configuration} from '../src/configuration'
import {Issue} from '../src/issue'
import {TideliftClient} from '../src/tidelift_client'
import {Vulnerability} from '../src/vulnerability'

const stubTidelift = new TideliftClient('STUB')

const sample_rec = new Vulnerability('CVE-2021-3807', {
  description: 'Foo',
  severity: 10,
  url: 'https://a.url',
  nist_url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-3807',
  recommendation: {
    impact_description: 'no',
    impact_score: 10,
    workaround_available: false,
    created_at: new Date(),
    updated_at: new Date(),
    other_conditions: false,
    specific_methods_affected: false,
    real_issue: true
  }
})

const scanner = new Scanner()
scanner.github.add_comment = jest.fn()
scanner.github.add_labels = jest.fn()

describe('Scanner', () => {
  test('has config', () => {
    let subject = new Scanner()
    expect(subject.config).toEqual(Configuration.defaults())
  })

  test('fake issue', async () => {
    let issue = new Issue({repo: 'foo', owner: 'bar', issue_number: 1})
    let subject = await scanner.perform(issue)

    expect(subject).toContain(Scanner.statuses.no_issue_data(''))
  })

  test('perform no vulns mentioned', async () => {
    let issue = new Issue({repo: 'codeql', owner: 'github', issue_number: 1})
    let subject = await scanner.perform(issue)

    expect(subject).toContain(Scanner.statuses.no_vulnerabilities())
  })

  test('perform success', async () => {
    let issue = new Issue({
      repo: 'codeql',
      owner: 'github',
      issue_number: 8707
    })
    let subject = await scanner.perform(issue)

    window.console.log("scucess is ", subject)
    // This CVE exists but currently has no recs
    expect(subject).toContain('CVE-2021-43297')
  })

  describe('find_cves', () => {
    test('searches CVE ids, normalizes them', async () => {
      const input = ['CVE-5555-1234', 'cvE-2022-2222']
      const expected = new Set(['CVE-5555-1234', 'CVE-2022-2222'])
      const subject = scanner.find_cves(input)

      expect(subject).toEqual(expected)
    })

    test('results are unique', async () => {
      const input = ['cvE-2022-2222  cvE-2022-2222', 'cvE-2022-2222 lorem']
      const subject = scanner.find_cves(input)

      expect(subject.size).toBe(1)
    })
  })

  describe('find_ghsa', () => {
    test('finds cve from github advisory', async () => {
      const input = ['baz GHSA-vv3r-fxqp-vr3f foo']
      const expected = new Set(['CVE-2022-38147'])
      const subject = await scanner.find_ghsas(input)

      expect(subject).toEqual(expected)
    })
  })

  describe('find_all', () => {
    test('results are unique across indirectly found cves', async () => {
      const input = ['CVE-2022-38147', 'GHSA-vv3r-fxqp-vr3f']
      const subject = await scanner.find_all(input)

      expect(subject.size).toBe(1)
    })
  })

  describe('find_vulnerabilities', () => {
    describe('when disabled', () => {
      test('returns []', async () => {
        const input = new Set(['CVE-5555-1234'])
        const subject = await new Scanner({
          disable_recommendations: true
        }).find_vulnerabilities(input)

        expect(subject).toEqual([])
      })
    })

    describe('when no tidelift client', () => {
      test('returns []', async () => {
        const input = new Set(['CVE-5555-1234'])
        const subject = await new Scanner({
          tidelift: undefined
        }).find_vulnerabilities(input)

        expect(subject).toEqual([])
      })
    })

    describe('when has rec', () => {
      test('returns []', async () => {
        stubTidelift.fetch_vulnerabilities = jest
          .fn()
          .mockImplementationOnce(vulns => [sample_rec])

        const input = new Set(['CVE-2021-3807'])
        const subject = await new Scanner({
          tidelift: stubTidelift
        }).find_vulnerabilities(input)

        expect(stubTidelift.fetch_vulnerabilities).toHaveBeenCalledWith([
          ...input.values()
        ])
      })
    })
  })

  describe('check_duplicates', () => {
    test('returns []', async () => {
      const input = new Set(['CVE-2021-3807'])

      const subject = await scanner.check_duplicates(
        {owner: 'tidelift', repo: 'issue-toolbox'},
        input
      )

      expect(subject).toEqual(new Map([['CVE-2021-3807', 1]]))
    })
  })
})

describe('scanGhsa', () => {
  test('finds ghsa ids in text', async () => {
    expect(scanGhsa('baz GHSA-vv3r-fxqp-vr3f foo')).toEqual([
      'GHSA-vv3r-fxqp-vr3f'
    ])
  })
})

describe('scanCve', () => {
  test('extracts formatted', async () => {
    expect(scanCve('baz CVE-5555-1234 cvE-2022-2222 foo')).toEqual([
      'CVE-5555-1234',
      'CVE-2022-2222'
    ])
  })
})
