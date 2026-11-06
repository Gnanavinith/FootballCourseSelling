export const dummyCourses = [
  { _id: 'c1', slug: 'football-basics-for-beginners', title: 'Football Basics for Beginners', description: 'Start from zero. Learn ball control, first touch, simple passing.', price: 1499, totalWeeks: 6, level: 'Beginner', language: 'English', thumbnail: null },
  { _id: 'c2', slug: 'football-basics-tamil', title: 'கால்பந்து அடிப்படைகள்', description: 'கால்பந்து விளையாட்டின் அடிப்படைகளை தமிழில் படிப்படியாக கற்றுக்கொள்ளுங்கள்.', price: 1499, totalWeeks: 6, level: 'Beginner', language: 'Tamil', thumbnail: null },
  { _id: 'c3', slug: 'dribbling-and-ball-control', title: 'Dribbling & Ball Control Mastery', description: 'Beat defenders with close control, feints and change of pace.', price: 2499, totalWeeks: 8, level: 'Intermediate', language: 'English', thumbnail: null },
  { _id: 'c4', slug: 'passing-and-vision', title: 'Passing & Vision', description: 'Short and long passing, weight of pass, scanning the field.', price: 1999, totalWeeks: 6, level: 'Intermediate', language: 'English', thumbnail: null },
  { _id: 'c5', slug: 'shooting-and-finishing', title: 'Shooting & Finishing', description: 'Improve technique, accuracy and power.', price: 2999, totalWeeks: 8, level: 'Advanced', language: 'English', thumbnail: null },
  { _id: 'c6', slug: 'goalkeeper-training', title: 'Goalkeeper Training', description: 'Footwork, handling, diving, positioning and distribution.', price: 2499, totalWeeks: 8, level: 'Intermediate', language: 'English', thumbnail: null },
  { _id: 'c7', slug: 'fitness-and-stamina', title: 'Fitness & Stamina for Footballers', description: 'Build speed, endurance and strength.', price: 999, totalWeeks: 4, level: 'All levels', language: 'English', thumbnail: null },
  { _id: 'c8', slug: 'tactics-and-game-understanding', title: 'Tactics & Game Understanding', description: 'Learn positioning, pressing, build-up play.', price: 2999, totalWeeks: 6, level: 'Advanced', language: 'English', thumbnail: null },
  { _id: 'c9', slug: 'free-warm-up-and-mobility', title: 'Free: Warm-up & Mobility Routine', description: 'A short free course with warm-up and stretching.', price: 0, totalWeeks: 2, level: 'All levels', language: 'English', thumbnail: null },
]
export const getDummyCourseBySlug = (slug) => dummyCourses.find((c) => c.slug === slug) || null
