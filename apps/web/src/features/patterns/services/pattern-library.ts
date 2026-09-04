import type { Lesson, Pattern, PatternGroup } from '../domain/pattern'

const declarations = import.meta.glob('../../../patterns/*.json', {
  eager: true,
  import: 'default',
})

function isPattern(value: unknown): value is Pattern {
  if (!value || typeof value !== 'object') return false

  const pattern = value as Partial<Pattern>

  return (
    pattern.status === 'lesson'
  )
}

function isLesson(pattern: Pattern): pattern is Lesson {
  const lesson = pattern as Partial<Lesson>

  return (
    typeof lesson.description === 'string' &&
    Boolean(lesson.scenario) &&
    Array.isArray(lesson.template?.regions) &&
    Array.isArray(lesson.template?.nodes) &&
    Array.isArray(lesson.template?.edges)
  )
}

function groupId(group: string): string {
  return group.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export const patterns = Object.values(declarations)
  .filter(isPattern)
  .sort((left, right) => left.name.localeCompare(right.name))

export const lessons = patterns.filter(isLesson)

export const lessonGroups = lessons
  .reduce<PatternGroup[]>((groups, lesson) => {
    const existing = groups.find((group) => group.title === lesson.group)

    if (existing) {
      existing.patterns.push(lesson)
      return groups
    }

    groups.push({
      id: groupId(lesson.group),
      title: lesson.group,
      patterns: [lesson],
    })
    return groups
  }, [])
