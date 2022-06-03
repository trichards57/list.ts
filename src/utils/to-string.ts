export default function (s: undefined | null | { toString(): string } | string): string {
  if (s === undefined || s === null) return ''

  return s.toString()
}
