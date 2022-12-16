import {TideliftRecommendation} from './tidelift_recommendation'
import {Issue} from './issue'
import {commentData, GithubClient} from './github_client'
import {VulnerabilityId, Mentions} from './scanner'

export async function createRecommendationsCommentIfNeeded(
  issue: Issue,
  recs: TideliftRecommendation[],
  github: GithubClient,
  template: (r: TideliftRecommendation) => string
): Promise<{} | undefined> {
  const comments = await github.listComments(issue)
  if (!comments) return

  const botComments = comments.filter(isBotComment)
  const unmentioned_recs = [...recs].filter(
    rec => !botComments.some(commentIncludesText, rec.vulnerability)
  )

  if (unmentioned_recs.length > 0)
    return github.addComment(
      issue,
      unmentioned_recs.map(rec => template(rec)).join('\n---\n')
    )
}

export async function createDuplicatesCommentIfNeeded(
  issue: Issue,
  duplicates: Mentions,
  github: GithubClient,
  template: (vuln: VulnerabilityId, issue_number: string | number) => string
): Promise<{} | undefined> {
  const comments = await github.listComments(issue)
  if (!comments) return

  const botComments = comments.filter(isBotComment)
  const unmentioned_dupes = [...duplicates].filter(
    ([vuln]) => !botComments.some(commentIncludesText, vuln)
  )

  if (unmentioned_dupes.length > 0)
    return github.addComment(
      issue,
      unmentioned_dupes
        .map(([vuln, prior_issue]) => template(vuln, prior_issue))
        .join('\n---\n')
    )
}

function isBotComment(comment: commentData): boolean {
  return (
    comment?.user?.login === 'github-actions[bot]' &&
    comment?.user?.type === 'Bot'
  )
}

function commentIncludesText(this: string, comment: commentData): boolean {
  // eslint-disable-next-line no-invalid-this
  return !!comment.body?.includes(this)
}
