import type { Pattern, PatternGroup, RunnablePattern } from '../domain/pattern'

const declarations = import.meta.glob('../../../patterns/*.json', {
  eager: true,
  import: 'default',
})

function isPattern(value: unknown): value is Pattern {
  if (!value || typeof value !== 'object') return false

  const pattern = value as Partial<Pattern>

  return (
    (pattern.status === 'draft' || pattern.status === 'runnable' || pattern.status === 'lesson')
  )
}

function isRunnablePattern(pattern: Pattern): pattern is RunnablePattern {
  const runnable = pattern as Partial<RunnablePattern>

  return (
    pattern.status === 'runnable' &&
    typeof runnable.description === 'string' &&
    Boolean(runnable.scenario) &&
    Array.isArray(runnable.template?.regions) &&
    Array.isArray(runnable.template?.nodes) &&
    Array.isArray(runnable.template?.edges)
  )
}

function groupId(group: string): string {
  return group.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export const patterns = Object.values(declarations)
  .filter(isPattern)
  .sort((left, right) => left.name.localeCompare(right.name))

export const runnablePatterns = patterns.filter(isRunnablePattern)

export const patternGroups = patterns
  .filter((pattern) => pattern.status !== 'runnable')
  .reduce<PatternGroup[]>((groups, pattern) => {
    const existing = groups.find((group) => group.title === pattern.group)

    if (existing) {
      existing.patterns.push(pattern)
      return groups
    }

    groups.push({
      id: groupId(pattern.group),
      title: pattern.group,
      patterns: [pattern],
    })
    return groups
  }, [])
