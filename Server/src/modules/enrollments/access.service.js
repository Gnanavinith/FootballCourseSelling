const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

export function effectiveNow(enrollment, now = new Date()) {
  return enrollment.pausedAt ? enrollment.pausedAt : now
}

export function currentWeek(enrollment, now = new Date()) {
  if (enrollment.unlockedAll) return Infinity
  const start = new Date(enrollment.startsAt).getTime()
  const extra = enrollment.extraMs || 0
  const nowMs = effectiveNow(enrollment, now).getTime()
  const elapsed = nowMs - start - extra
  let week = Math.floor(elapsed / MS_PER_WEEK) + 1
  const courseWeeks = enrollment.totalWeeks || 9999
  if (week < 1) week = 1
  if (week > courseWeeks) week = courseWeeks // D1 keep last week open
  return week
}

export function nextUnlockAt(enrollment, now = new Date()) {
  if (enrollment.unlockedAll) return null
  const cw = currentWeek(enrollment, now)
  const totalWeeks = enrollment.totalWeeks || 9999
  if (cw >= totalWeeks) return null
  const start = new Date(enrollment.startsAt).getTime()
  const extra = enrollment.extraMs || 0
  return new Date(start + extra + cw * MS_PER_WEEK)
}

export function isWeekAccessible(enrollment, weekNumber, now = new Date()) {
  if (enrollment.unlockedAll) return true
  const cw = currentWeek(enrollment, now)
  return weekNumber <= cw // past/current accessible? spec: only current week playable, but weeks list statuses
}
