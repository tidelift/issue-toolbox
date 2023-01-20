import {Vulnerability} from './vulnerability'
import {Issue} from './issue'
import {CommentData, GithubClient} from './github_client'
import {VulnerabilityId, Mentions} from './scanner'

export async function createRecommendationsCommentIfNeeded(
  issue: Issue,
  vulns: Vulnerability[],
  github: GithubClient,
  template: (v: Vulnerability) => string
): Promise<{} | undefined> {
  const comments = await github.list_comments(issue)
  if (!comments) return

  const bot_comments = comments.filter(isBotComment)
  const unmentioned_vulns = [...vulns].filter(
    vuln => !bot_comments.some(commentIncludesText, vuln.vuln_id)
  )

  if (unmentioned_vulns.length > 0)
    return github.add_comment(
      issue,
      unmentioned_vulns.map(vuln => template(vuln)).join('\n---\n')
    )
}

export async function createDuplicatesCommentIfNeeded(
  issue: Issue,
  duplicates: Mentions,
  github: GithubClient,
  template: (vuln: VulnerabilityId, issue_number: string | number) => string
): Promise<{} | undefined> {
  const comments = await github.list_comments(issue)
  if (!comments) return

  const bot_comments = comments.filter(isBotComment)
  const unmentioned_dupes = [...duplicates].filter(
    ([vuln]) => !bot_comments.some(commentIncludesText, vuln)
  )

  if (unmentioned_dupes.length > 0)
    return github.add_comment(
      issue,
      unmentioned_dupes
        .map(([vuln, prior_issue]) => template(vuln, prior_issue))
        .join('\n---\n')
    )
}

function isBotComment(comment: CommentData): boolean {
  return (
    comment?.user?.login === 'github-actions[bot]' &&
    comment?.user?.type === 'Bot'
  )
}

function commentIncludesText(this: string, comment: CommentData): boolean {
  // eslint-disable-next-line no-invalid-this
  return !!comment.body?.includes(this)
}
