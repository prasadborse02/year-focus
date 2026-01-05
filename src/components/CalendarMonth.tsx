import { CalendarEvent, getEventsForDate, formatDateString, events as allEvents } from "@/data/events";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarMonthProps {
  year: number;
  month: number; // 0-indexed (0 = January)
  onEventClick: (event: CalendarEvent) => void;
}

// Week starts on Monday (ISO-8601)
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface EventBlock {
  event: CalendarEvent;
  startCol: number; // 0-6 column position in this week
  endCol: number; // 0-6 column position in this week
  row: number; // row index within the week (for stacking)
  isStart: boolean; // true if this is where the event actually starts
  isEnd: boolean; // true if this is where the event actually ends
}

/**
 * Calculate event blocks for a given week
 * Handles events that span across weeks by creating continuation blocks
 */
function getEventBlocksForWeek(
  weekDays: (number | null)[],
  year: number,
  month: number
): EventBlock[] {
  const blocks: EventBlock[] = [];
  const processedEvents = new Set<string>();

  // Get the date range of this week
  const weekDates: Date[] = [];
  weekDays.forEach((day, i) => {
    if (day !== null) {
      weekDates[i] = new Date(year, month, day);
    }
  });

  // Find first and last valid day indices in week
  let firstValidIdx = weekDays.findIndex(d => d !== null);
  let lastValidIdx = weekDays.length - 1;
  while (lastValidIdx >= 0 && weekDays[lastValidIdx] === null) {
    lastValidIdx--;
  }

  if (firstValidIdx === -1) return blocks;

  // For each day in the week, check for events
  weekDays.forEach((day, colIndex) => {
    if (day === null) return;

    const date = new Date(year, month, day);
    const dayEvents = getEventsForDate(date);

    dayEvents.forEach(event => {
      // Create unique key for this event in this week
      const weekKey = `${event.id}-week-${weekDays[firstValidIdx]}`;
      if (processedEvents.has(weekKey)) return;
      processedEvents.add(weekKey);

      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Find where this event starts and ends within this week
      let startCol = -1;
      let endCol = -1;
      let isStart = false;
      let isEnd = false;

      for (let i = 0; i < 7; i++) {
        if (weekDays[i] === null) continue;
        const cellDate = new Date(year, month, weekDays[i]!);
        const cellDateStr = formatDateString(cellDate);
        const eventStartStr = event.start;
        const eventEndStr = event.end;

        // Check if this cell is within the event range
        if (cellDateStr >= eventStartStr && cellDateStr <= eventEndStr) {
          if (startCol === -1) {
            startCol = i;
            isStart = cellDateStr === eventStartStr;
          }
          endCol = i;
          isEnd = cellDateStr === eventEndStr;
        }
      }

      if (startCol === -1) return; // Event not in this week

      // Assign row (stack events vertically if they overlap)
      let row = 0;
      const usedRows = blocks
        .filter(b => {
          // Check for column overlap
          return !(b.endCol < startCol || b.startCol > endCol);
        })
        .map(b => b.row);

      while (usedRows.includes(row)) {
        row++;
      }

      blocks.push({
        event,
        startCol,
        endCol,
        row,
        isStart,
        isEnd
      });
    });
  });

  // Sort blocks by row for consistent rendering
  blocks.sort((a, b) => a.row - b.row);

  return blocks;
}

/**
 * Get single-day events for a specific day
 */
function getSingleDayEventsForDate(date: Date): CalendarEvent[] {
  return getEventsForDate(date).filter(event => event.start === event.end);
}

export function CalendarMonth({ year, month, onEventClick }: CalendarMonthProps) {
  // Get first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Calculate starting day offset for Monday-based week
  const dayOfWeek = firstDay.getDay();
  const startingDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Create array of day cells
  const days: (number | null)[] = [];

  // Add empty cells for days before the first of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add day numbers
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  // Fill remaining cells to complete the grid
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  // Group days into weeks
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Check if a date is today
  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  // Constants for event bar dimensions - reduced for lighter visual weight
  const EVENT_BAR_HEIGHT = 14; // reduced from 18px
  const EVENT_BAR_GAP = 2;

  return (
    <section
      id={`month-${month}`}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 md:py-12 snap-start"
    >
      {/* Month Header - Primary focal point */}
      <header className="text-center mb-6 md:mb-8">
        <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground tracking-tight">
          {MONTH_NAMES[month]}
        </h2>
        <p className="text-muted-foreground/60 text-xs md:text-sm mt-1 font-mono tracking-wider">
          {year}
        </p>
      </header>

      {/* Calendar Grid */}
      <div className="w-full max-w-4xl">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2 md:mb-3">
          {WEEKDAYS.map(day => (
            <div
              key={day}
              className="text-center text-[10px] md:text-xs font-medium text-muted-foreground/70 py-1.5 uppercase tracking-wide"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Week Rows */}
        <TooltipProvider delayDuration={300}>
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => {
              const eventBlocks = getEventBlocksForWeek(week, year, month);

              // Get multi-day events (for overlay rendering)
              const multiDayBlocks = eventBlocks.filter(b => b.startCol !== b.endCol || !b.isStart || !b.isEnd);

              // Calculate max row for proper spacing
              const maxRow = multiDayBlocks.length > 0
                ? Math.max(...multiDayBlocks.map(b => b.row))
                : -1;

              // Calculate overlay height needed
              const overlayHeight = maxRow >= 0 ? (maxRow + 1) * (EVENT_BAR_HEIGHT + EVENT_BAR_GAP) : 0;

              return (
                <div key={weekIndex} className="relative">
                  {/* Multi-day event overlay layer */}
                  {multiDayBlocks.length > 0 && (
                    <div
                      className="absolute left-0 right-0 z-10 pointer-events-none"
                      style={{
                        top: '22px', // Below the date number area
                        height: `${overlayHeight}px`
                      }}
                    >
                      {/* Render multi-day event bars */}
                      {multiDayBlocks.map((block, blockIndex) => {
                        const span = block.endCol - block.startCol + 1;
                        const leftPercent = (block.startCol / 7) * 100;
                        const widthPercent = (span / 7) * 100;

                        // Determine edge styling for continuity cues
                        const hasLeftFade = !block.isStart;
                        const hasRightFade = !block.isEnd;

                        return (
                          <Tooltip key={`${block.event.id}-${blockIndex}`}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => onEventClick(block.event)}
                                className="absolute pointer-events-auto flex items-center px-1.5 md:px-2 text-[8px] md:text-[10px] font-medium leading-tight transition-all duration-150 hover:brightness-110 cursor-pointer"
                                style={{
                                  backgroundColor: `hsl(${block.event.color} / 0.75)`,
                                  color: 'white',
                                  textShadow: '0 1px 1px rgba(0,0,0,0.2)',
                                  left: `calc(${leftPercent}% + 2px)`,
                                  width: `calc(${widthPercent}% - 4px)`,
                                  top: `${block.row * (EVENT_BAR_HEIGHT + EVENT_BAR_GAP)}px`,
                                  height: `${EVENT_BAR_HEIGHT}px`,
                                  borderRadius: block.isStart && block.isEnd
                                    ? '3px'
                                    : block.isStart
                                    ? '3px 0 0 3px'
                                    : block.isEnd
                                    ? '0 3px 3px 0'
                                    : '0',
                                  // Subtle gradient for continuation cues
                                  background: hasLeftFade || hasRightFade
                                    ? `linear-gradient(to right, ${hasLeftFade ? `hsl(${block.event.color} / 0.55)` : `hsl(${block.event.color} / 0.75)`} 0%, hsl(${block.event.color} / 0.75) ${hasLeftFade ? '8%' : '0%'}, hsl(${block.event.color} / 0.75) ${hasRightFade ? '92%' : '100%'}, ${hasRightFade ? `hsl(${block.event.color} / 0.55)` : `hsl(${block.event.color} / 0.75)`} 100%)`
                                    : `hsl(${block.event.color} / 0.75)`
                                }}
                              >
                                {block.isStart && (
                                  <span className="truncate whitespace-nowrap overflow-hidden">
                                    {block.event.title}
                                  </span>
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="bg-popover text-popover-foreground border border-border text-xs"
                            >
                              {block.event.title}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  )}

                  {/* Day cells grid */}
                  <div className="grid grid-cols-7 gap-px">
                    {week.map((day, dayIndex) => {
                      if (day === null) {
                        return (
                          <div
                            key={`empty-${dayIndex}`}
                            className="aspect-[4/3] md:aspect-[3/2] bg-muted/10 rounded-md"
                          />
                        );
                      }

                      // Get single-day events for this cell
                      const date = new Date(year, month, day);
                      const singleDayEvents = getSingleDayEventsForDate(date);

                      // Calculate padding needed for multi-day event overlay
                      const paddingTop = multiDayBlocks.length > 0 ? overlayHeight + 4 : 0;

                      return (
                        <div
                          key={`day-${day}`}
                          className={`
                            aspect-[4/3] md:aspect-[3/2] rounded-md bg-card border border-border/40
                            flex flex-col relative overflow-hidden
                            ${isToday(day) ? 'ring-1 ring-primary/70 ring-offset-1 ring-offset-background' : ''}
                          `}
                        >
                          {/* Date number - top left header area */}
                          <div className="flex-shrink-0 px-1.5 pt-1 md:px-2 md:pt-1.5">
                            <span className={`
                              text-[10px] md:text-xs leading-none
                              ${isToday(day) ? 'text-primary font-semibold' : 'text-foreground/50 font-medium'}
                            `}>
                              {day}
                            </span>
                          </div>

                          {/* Single-day event tiles area */}
                          <div
                            className="flex-1 flex flex-col justify-center px-0.5 pb-1 md:px-1 md:pb-1.5 min-h-0"
                            style={{ paddingTop: `${paddingTop}px` }}
                          >
                            <div className="flex flex-col gap-0.5 max-h-full overflow-hidden">
                              {singleDayEvents.map((event, eventIndex) => {
                                const isLongTitle = event.title.length > 10;

                                return (
                                  <Tooltip key={`${event.id}-${eventIndex}`}>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => onEventClick(event)}
                                        className="h-3 md:h-3.5 flex items-center justify-center px-1 text-[7px] md:text-[8px] font-medium leading-none transition-all duration-150 hover:brightness-110 cursor-pointer rounded-sm"
                                        style={{
                                          backgroundColor: `hsl(${event.color} / 0.15)`,
                                          color: `hsl(${event.color})`,
                                          border: `1px solid hsl(${event.color} / 0.3)`,
                                        }}
                                      >
                                        <span className="truncate whitespace-nowrap overflow-hidden">
                                          {event.title}
                                        </span>
                                      </button>
                                    </TooltipTrigger>
                                    {isLongTitle && (
                                      <TooltipContent
                                        side="top"
                                        className="bg-popover text-popover-foreground border border-border text-xs"
                                      >
                                        {event.title}
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
}
