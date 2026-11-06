import { dummyCourses } from './dummyCourses.js'

const DAY = 24 * 60 * 60 * 1000
const course = (slug) => dummyCourses.find((c) => c.slug === slug)
const ago = (days) => new Date(Date.now() - days * DAY).toISOString()

const WEEK_TITLES = {
  'football-basics-for-beginners': [
    'Getting started and the rules',
    'First touch',
    'Simple passing',
    'Receiving the ball',
    'Drills you can do alone',
    'Mini game skills',
  ],
  'dribbling-and-ball-control': [
    'Close control basics',
    'Using both feet',
    'Feints and fakes',
    'Changing pace',
    'Beating a defender',
    'Dribbling under pressure',
    'Cone drill circuits',
    'Match situations',
  ],
}

export function getDummyEnrollments() {
  return [
    { _id: 'e1', course: course('football-basics-for-beginners'), startsAt: ago(15), weekTitles: WEEK_TITLES['football-basics-for-beginners'] },
    { _id: 'e2', course: course('dribbling-and-ball-control'), startsAt: ago(2), weekTitles: WEEK_TITLES['dribbling-and-ball-control'] },
    { _id: 'e3', course: course('free-warm-up-and-mobility'), startsAt: ago(30), weekTitles: [] },
  ]
}
