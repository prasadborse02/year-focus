/**
 * EVENTS DATA FILE
 * ================
 * 
 * Add or edit events here. Each event has:
 * - id: Unique identifier
 * - title: Event name
 * - start: Start date (YYYY-MM-DD format)
 * - end: End date (YYYY-MM-DD format) - same as start for single-day events
 * - color: HSL color string for the event marker
 * - details: Markdown-formatted description
 * 
 * MULTI-DAY EVENTS:
 * When start !== end, the event spans multiple days.
 * The calendar will show the event marker on each day within the range.
 */

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  color: string; // HSL color
  details: string; // Markdown content
}

export const events: CalendarEvent[] = [
  {
    id: "misogi-challenge",
    title: "Misogi Challenge",
    start: "2026-03-01",
    end: "2026-06-30",
    color: "0 72% 50%", // Red
    details: `**100km Monthly Running Target**

- Complete 100km of running each month
- Mix of trail runs, intervals, and long steady runs
- Progressive distance increase week over week

**Strength Training**
- 3x per week full body sessions
- Focus on compound movements
- Olympic lifting progression

**Swimming**
- 2x per week pool sessions
- Work on stroke efficiency
- Build to 2km continuous swim

**Mental Resilience Focus**
- Cold exposure protocol
- Meditation practice
- Weekly reflection journaling`
  },
  {
    id: "ultra-prep",
    title: "Ultra Marathon Prep",
    start: "2026-07-01",
    end: "2026-09-30",
    color: "200 98% 39%", // Primary blue
    details: `**Building the Engine**

Peak training phase for the autumn ultra marathon.

- Weekly mileage: 80-120km
- Back-to-back long runs on weekends
- Nutrition strategy testing
- Altitude training camps

**Key Sessions**
- Tuesday: Speed work
- Thursday: Tempo runs
- Saturday: Long trail run
- Sunday: Recovery run + strength`
  },
  {
    id: "first-ultra",
    title: "First 100km Ultra",
    start: "2026-10-17",
    end: "2026-10-17",
    color: "45 93% 47%", // Gold
    details: `**The Main Event**

First 100km ultramarathon attempt.

- Location: Mountain trails
- Elevation gain: 4,500m
- Target time: Sub-20 hours
- Crew and pacers arranged

*"The goal is not to finish fast, but to finish transformed."*`
  },
  {
    id: "recovery-block",
    title: "Active Recovery Block",
    start: "2026-10-18",
    end: "2026-11-15",
    color: "160 60% 45%", // Teal
    details: `**Post-Ultra Recovery**

Structured recovery period to rebuild.

- Week 1-2: Complete rest, walking only
- Week 3-4: Easy swimming and yoga
- Light strength work resumes
- Focus on sleep and nutrition

**Recovery Protocols**
- Massage therapy weekly
- Compression and elevation
- Anti-inflammatory nutrition`
  },
  {
    id: "year-reflection",
    title: "Year End Reflection",
    start: "2026-12-20",
    end: "2026-12-31",
    color: "270 50% 50%", // Purple
    details: `**Closing the Year**

Time for deep reflection and planning.

- Review all training logs
- Analyze what worked, what didn't
- Set intentions for 2027
- Gratitude practice

**Planning Sessions**
- December 20-23: Review
- December 24-26: Rest
- December 27-31: 2027 planning`
  },
  {
    id: "base-building",
    title: "Base Building Phase",
    start: "2026-01-05",
    end: "2026-02-28",
    color: "215 24% 40%", // Steel blue
    details: `**Foundation Work**

Building aerobic base and movement quality.

- Zone 2 training emphasis
- Running: 40-60km per week
- Swimming: 4-6km per week
- Strength: Movement patterns

**Weekly Structure**
- Monday: Strength + swim
- Tuesday: Easy run
- Wednesday: Swim intervals
- Thursday: Tempo run
- Friday: Rest or yoga
- Saturday: Long run
- Sunday: Active recovery`
  },
  {
    id: "new-year",
    title: "New Year Commitment",
    start: "2026-01-01",
    end: "2026-01-01",
    color: "200 98% 39%", // Primary
    details: `**The Year Begins**

Setting the foundation for the Year of the Hybrid Athlete.

- Morning cold plunge
- First training session
- Vision board creation
- Commitment ceremony

*"Every journey begins with a single step."*`
  },
  {
    id: "swim-focus",
    title: "Swim Focus Week",
    start: "2026-02-09",
    end: "2026-02-15",
    color: "190 80% 45%", // Cyan
    details: `**Intensive Swim Block**

Dedicated week to improve swimming technique.

- Daily pool sessions
- Video analysis
- Stroke correction drills
- Open water simulation

**Goals**
- Reduce 100m time by 5 seconds
- Improve breathing pattern
- Build water confidence`
  }
];

/**
 * HELPER: Get events for a specific date
 * Checks if the date falls within any event's start-end range
 */
export function getEventsForDate(date: Date): CalendarEvent[] {
  const dateStr = formatDateString(date);
  
  return events.filter(event => {
    return dateStr >= event.start && dateStr <= event.end;
  });
}

/**
 * HELPER: Format date to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * HELPER: Check if an event is multi-day
 */
export function isMultiDayEvent(event: CalendarEvent): boolean {
  return event.start !== event.end;
}

/**
 * HELPER: Get the position of a date within a multi-day event
 * Returns: 'start' | 'middle' | 'end' | 'single'
 */
export function getEventPosition(event: CalendarEvent, date: Date): 'start' | 'middle' | 'end' | 'single' {
  const dateStr = formatDateString(date);
  
  if (event.start === event.end) return 'single';
  if (dateStr === event.start) return 'start';
  if (dateStr === event.end) return 'end';
  return 'middle';
}
