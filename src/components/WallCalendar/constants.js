export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

// Curated Unsplash photo IDs per month – landscapes that evoke each season
export const MONTH_IMAGES = [
  'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=900&q=80', // Jan – snowy peaks
  'https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=900&q=80', // Feb – icy forest
  'https://images.unsplash.com/photo-1551272744-19456affaa89?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Mar – cherry blossom
  'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=900&q=80', // Apr – spring meadow
  'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=900&q=80', // May – wildflowers
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80', // Jun – summer beach
  'https://images.unsplash.com/photo-1603979649806-5299879db16b?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Jul – mountain lake
  'https://images.unsplash.com/photo-1535222830855-fd60aca7e065?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Aug – sunflower field
  'https://plus.unsplash.com/premium_photo-1669295395768-6ef852fddc90?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Sep – autumn forest
  'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=900&q=80', // Oct – pumpkin patch
  'https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=900&q=80', // Nov – harvest fog
  'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=900&q=80', // Dec – snowy village
]

// US Federal Holidays – month is 0-indexed; day is 1-indexed
// For recurring rules, we store {month, day} pairs or compute them per year.
export const FIXED_HOLIDAYS = [
  { month: 0, day: 1,  name: "New Year's Day" },
  { month: 6, day: 4,  name: 'Independence Day' },
  { month: 10, day: 11, name: "Veterans Day" },
  { month: 11, day: 25, name: 'Christmas Day' },
]

/**
 * Returns a Set of date keys ("YYYY-M-D") that are holidays in the given year.
 * Includes both fixed and computed floating holidays.
 */
export function getHolidayMap(year) {
  const map = {}

  // Fixed holidays
  FIXED_HOLIDAYS.forEach(({ month, day, name }) => {
    map[`${year}-${month}-${day}`] = name
  })

  // MLK Day – 3rd Monday in January
  map[`${year}-0-${nthWeekday(year, 0, 1, 3)}`] = 'MLK Day'

  // Presidents Day – 3rd Monday in February
  map[`${year}-1-${nthWeekday(year, 1, 1, 3)}`] = "Presidents' Day"

  // Memorial Day – last Monday in May
  map[`${year}-4-${lastWeekday(year, 4, 1)}`] = 'Memorial Day'

  // Labor Day – 1st Monday in September
  map[`${year}-8-${nthWeekday(year, 8, 1, 1)}`] = 'Labor Day'

  // Columbus Day – 2nd Monday in October
  map[`${year}-9-${nthWeekday(year, 9, 1, 2)}`] = 'Columbus Day'

  // Thanksgiving – 4th Thursday in November
  map[`${year}-10-${nthWeekday(year, 10, 4, 4)}`] = 'Thanksgiving'

  return map
}

// nth occurrence of weekday (0=Sun … 6=Sat) in a month
function nthWeekday(year, month, weekday, n) {
  let count = 0
  for (let d = 1; d <= 31; d++) {
    const dt = new Date(year, month, d)
    if (dt.getMonth() !== month) break
    if (dt.getDay() === weekday) {
      count++
      if (count === n) return d
    }
  }
}

// last occurrence of weekday in a month
function lastWeekday(year, month, weekday) {
  let last = null
  for (let d = 1; d <= 31; d++) {
    const dt = new Date(year, month, d)
    if (dt.getMonth() !== month) break
    if (dt.getDay() === weekday) last = d
  }
  return last
}
