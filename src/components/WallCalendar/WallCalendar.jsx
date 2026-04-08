import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import styles from './WallCalendar.module.css'
import { MONTH_NAMES, MONTH_IMAGES, getHolidayMap } from './constants'
import {
  daysInMonth,
  firstWeekdayOfMonth,
  toHolidayKey,
  isSameDay,
  isBetween,
  formatRange,
  rangeDays,
  midnight,
} from './dateUtils'

/* ─── Spiral Binding ─────────────────────────────────────────────────────── */
function BindingStrip() {
  return (
    <div className={styles.binding} aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => (
        <div key={i} className={styles.bindingHole}>
          <div className={styles.bindingCoil} />
        </div>
      ))}
    </div>
  )
}

/* ─── Hero Section ───────────────────────────────────────────────────────── */
function HeroSection({ month, year, onPrev, onNext, slideClass }) {
  const imgSrc = MONTH_IMAGES[month]

  return (
    <div className={styles.hero}>
      <div className={`${styles.heroImgWrap} ${slideClass}`}>
        <img
          src={imgSrc}
          alt={`${MONTH_NAMES[month]} scenery`}
          className={styles.heroImg}
          loading="lazy"
        />
      </div>

      {/* Decorative blue chevron overlay – mirrors the reference image */}
      <div className={styles.heroOverlay} aria-hidden="true">
        <svg
          viewBox="0 0 100 28"
          preserveAspectRatio="none"
          className={styles.chevronSvg}
        >
          <path d="M0,0 L0,28 L100,28 L100,0 L78,22 L55,4 L32,22 Z" />
          <path
            d="M0,0 L0,28 L100,28 L100,0 L78,22 L55,4 L32,22 Z"
            className={styles.chevronShine}
          />
        </svg>

        <div className={styles.monthBadge}>
          <span className={styles.yearLabel}>{year}</span>
          <span className={styles.monthLabel}>{MONTH_NAMES[month].toUpperCase()}</span>
        </div>
      </div>

      <button
        className={`${styles.navBtn} ${styles.navPrev}`}
        onClick={onPrev}
        aria-label="Previous month"
      >
        ‹
      </button>
      <button
        className={`${styles.navBtn} ${styles.navNext}`}
        onClick={onNext}
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  )
}

/* ─── Day Cell ────────────────────────────────────────────────────────────── */
function DayCell({ date, isToday, isStart, isEnd, isInRange, isHoverRange, isWeekend, holiday, onClick, onMouseEnter }) {
  const classNames = [
    styles.dayCell,
    isToday ? styles.today : '',
    isStart ? styles.rangeStart : '',
    isEnd ? styles.rangeEnd : '',
    isInRange ? styles.inRange : '',
    isHoverRange ? styles.hoverRange : '',
    isWeekend ? styles.weekend : '',
    holiday ? styles.hasHoliday : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classNames}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      role="button"
      tabIndex={0}
      aria-label={`${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}${holiday ? `, ${holiday}` : ''}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <span className={styles.dayNumber}>{date.getDate()}</span>
      {holiday && (
        <span className={styles.holidayDot} title={holiday} />
      )}
      {isToday && <span className={styles.todayRing} aria-hidden="true" />}
    </div>
  )
}

/* ─── Calendar Grid ──────────────────────────────────────────────────────── */
function CalendarGrid({
  year,
  month,
  rangeStart,
  rangeEnd,
  hoverDate,
  onDateClick,
  onDateHover,
  onMouseLeave,
  holidayMap,
}) {
  const totalDays = daysInMonth(year, month)
  const startOffset = firstWeekdayOfMonth(year, month)
  const today = new Date()

  // effective end for hover preview
  const effectiveEnd =
    rangeStart && !rangeEnd && hoverDate ? hoverDate : rangeEnd

  const cells = []

  // leading empty cells
  for (let i = 0; i < startOffset; i++) {
    cells.push(<div key={`empty-${i}`} className={styles.emptyCell} />)
  }

  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d)
    const key = toHolidayKey(date)
    const holiday = holidayMap[key]
    const dayOfWeek = date.getDay() // 0=Sun
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isToday = isSameDay(date, today)
    const isStart = isSameDay(date, rangeStart)
    const isEnd = isSameDay(date, effectiveEnd)
    const isInRange = isBetween(date, rangeStart, effectiveEnd)
    const isHoverRange =
      rangeStart && !rangeEnd && hoverDate
        ? isBetween(date, rangeStart, hoverDate)
        : false

    cells.push(
      <DayCell
        key={d}
        date={date}
        isToday={isToday}
        isStart={isStart}
        isEnd={isEnd}
        isInRange={isInRange}
        isHoverRange={isHoverRange}
        isWeekend={isWeekend}
        holiday={holiday || null}
        onClick={() => onDateClick(date)}
        onMouseEnter={() => onDateHover(date)}
      />
    )
  }

  return (
    <div className={styles.gridWrap} onMouseLeave={onMouseLeave}>
      {/* Day name headers */}
      <div className={styles.dayHeaders}>
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
          <div
            key={d}
            className={`${styles.dayHeader} ${d === 'SAT' || d === 'SUN' ? styles.weekendHeader : ''}`}
          >
            {d}
          </div>
        ))}
      </div>
      <div className={styles.grid}>{cells}</div>
    </div>
  )
}

/* ─── Notes Panel ────────────────────────────────────────────────────────── */
function NotesPanel({ monthKey, notes, onNotesChange, rangeStart, rangeEnd }) {
  const value = notes[monthKey] || ''
  const rangeLabel = formatRange(rangeStart, rangeEnd)
  const days = rangeDays(rangeStart, rangeEnd)

  return (
    <aside className={styles.notesPanel}>
      <div className={styles.notesMeta}>
        <span className={styles.notesTitle}>Notes</span>
        <div className={styles.notesLines} aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={styles.notesLine} />
          ))}
        </div>
      </div>

      <textarea
        className={styles.notesArea}
        placeholder={
          rangeLabel
            ? `Notes for ${rangeLabel}…`
            : 'Jot down memos for this month…'
        }
        value={value}
        onChange={(e) => onNotesChange(monthKey, e.target.value)}
        aria-label="Monthly notes"
        rows={6}
      />

      {rangeLabel && (
        <div className={styles.rangeInfo}>
          <div className={styles.rangeLabel}>{rangeLabel}</div>
          {days > 1 && (
            <div className={styles.rangeDays}>
              {days} day{days !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {(rangeStart || rangeEnd) && (
        <button
          className={styles.clearBtn}
          onClick={() => {
            /* Handled by parent via callback-less approach; we'll use a custom event */
            document.dispatchEvent(new CustomEvent('wc:clearRange'))
          }}
        >
          Clear selection
        </button>
      )}
    </aside>
  )
}

/* ─── Legend ─────────────────────────────────────────────────────────────── */
function Legend() {
  return (
    <div className={styles.legend}>
      <div className={styles.legendItem}>
        <div className={`${styles.legendSwatch} ${styles.swatchToday}`} />
        <span>Today</span>
      </div>
      <div className={styles.legendItem}>
        <div className={`${styles.legendSwatch} ${styles.swatchRange}`} />
        <span>Selected range</span>
      </div>
      <div className={styles.legendItem}>
        <div className={styles.legendDot} />
        <span>Holiday</span>
      </div>
    </div>
  )
}

/* ─── Root Component ─────────────────────────────────────────────────────── */
const SLIDE_DURATION = 380 // ms

export default function WallCalendar() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)
  const [hoverDate, setHoverDate] = useState(null)
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wc-notes') || '{}')
    } catch {
      return {}
    }
  })
  const [slideClass, setSlideClass] = useState('')
  const slideTimer = useRef(null)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthKey = `${year}-${month}`

  const holidayMap = useMemo(() => getHolidayMap(year), [year])

  // Persist notes
  useEffect(() => {
    try {
      localStorage.setItem('wc-notes', JSON.stringify(notes))
    } catch {
      /* quota exceeded – silently ignore */
    }
  }, [notes])

  // Listen for clear-range event from NotesPanel
  useEffect(() => {
    const handler = () => {
      setRangeStart(null)
      setRangeEnd(null)
      setHoverDate(null)
    }
    document.addEventListener('wc:clearRange', handler)
    return () => document.removeEventListener('wc:clearRange', handler)
  }, [])

  /* ── Month navigation with slide animation ── */
  const navigate = useCallback((direction) => {
    if (slideTimer.current) return // throttle during animation
    const outClass = direction === 1 ? styles.slideOutLeft : styles.slideOutRight
    setSlideClass(outClass)

    slideTimer.current = setTimeout(() => {
      setViewDate((prev) => {
        const d = new Date(prev)
        d.setMonth(d.getMonth() + direction)
        return d
      })
      const inClass = direction === 1 ? styles.slideInRight : styles.slideInLeft
      setSlideClass(inClass)
      setTimeout(() => setSlideClass(''), SLIDE_DURATION)
      slideTimer.current = null
    }, SLIDE_DURATION / 2)
  }, [])

  /* ── Date click: two-click range selection ── */
  const handleDateClick = useCallback(
    (date) => {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // First click or reset
        setRangeStart(date)
        setRangeEnd(null)
        setHoverDate(null)
      } else {
        // Second click
        if (isSameDay(date, rangeStart)) {
          // Clicking same day twice → treat as single-day selection
          setRangeEnd(date)
        } else if (midnight(date) < midnight(rangeStart)) {
          setRangeEnd(rangeStart)
          setRangeStart(date)
        } else {
          setRangeEnd(date)
        }
      }
    },
    [rangeStart, rangeEnd]
  )

  const handleDateHover = useCallback(
    (date) => {
      if (rangeStart && !rangeEnd) setHoverDate(date)
    },
    [rangeStart, rangeEnd]
  )

  const handleMouseLeave = useCallback(() => {
    if (rangeStart && !rangeEnd) setHoverDate(null)
  }, [rangeStart, rangeEnd])

  const handleNotesChange = useCallback((key, value) => {
    setNotes((prev) => ({ ...prev, [key]: value }))
  }, [])

  return (
    <div className={styles.calendarWrap}>
      {/* Physical paper sheet */}
      <div className={styles.calendar}>
        <BindingStrip />

        <HeroSection
          month={month}
          year={year}
          onPrev={() => navigate(-1)}
          onNext={() => navigate(1)}
          slideClass={slideClass}
        />

        <div className={styles.body}>
          <NotesPanel
            monthKey={monthKey}
            notes={notes}
            onNotesChange={handleNotesChange}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
          />

          <div className={styles.calendarSection}>
            <CalendarGrid
              year={year}
              month={month}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              hoverDate={hoverDate}
              onDateClick={handleDateClick}
              onDateHover={handleDateHover}
              onMouseLeave={handleMouseLeave}
              holidayMap={holidayMap}
            />

            <Legend />
          </div>
        </div>
      </div>
    </div>
  )
}
