export function notBlank<TValue>(
  value: TValue | null | undefined | void
): value is TValue {
  if (value === null || value === undefined) return false
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testDummy: TValue = value
  return true
}

export function unique<TValue>(
  value: TValue,
  index: number,
  self: TValue[]
): boolean {
  return self.indexOf(value) === index
}

export async function concurrently<A, B>(
  array: A[],
  func: (item: A) => B | undefined | Promise<B | undefined>
): Promise<B[]> {
  const result = await Promise.all(
    array.map(async item => func.call(null, item))
  )

  return result.filter(notBlank)
}
