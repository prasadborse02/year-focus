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
  startCol: number; // 0-6 column position
  span: number; // number of columns to span
  row: number; // row index within the week
}

/**
 * Calculate event blocks for a given week
 * Returns positioned event blocks that span across days
 */
function getEventBlocksForWeek(
  weekDays: (number | null)[],
  year: number,
  month: number
): EventBlock[] {
  const blocks: EventBlock[] = [];
  const processedEvents = new Set<string>();

  // For each day in the week, check for events
  weekDays.forEach((day, colIndex) => {
    if (day === null) return;

    const date = new Date(year, month, day);
    const dayEvents = getEventsForDate(date);

    dayEvents.forEach(event => {
      // Skip if we've already processed this event for this week
      const weekKey = `${event.id}-${weekDays[0] || 'null'}`;
      if (processedEvents.has(weekKey)) return;
      processedEvents.add(weekKey);

      // Calculate span within this week
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Find start column (where this event starts in this week)
      let startCol = colIndex;
      
      // Find end column (where this event ends in this week)
      let endCol = colIndex;
      for (let i = colIndex; i < 7; i++) {
        const checkDay = weekDays[i];
        if (checkDay === null) break;
        
        const checkDate = new Date(year, month, checkDay);
        if (checkDate <= eventEnd) {
          endCol = i;
        } else {
          break;
        }
      }

      const span = endCol - startCol + 1;

      // Assign row (stack events vertically if they overlap)
      let row = 0;
      const usedRows = blocks
        .filter(b => {
          // Check for column overlap
          const bEnd = b.startCol + b.span - 1;
          const thisEnd = startCol + span - 1;
          return !(bEnd < startCol || b.startCol > thisEnd);
        })
        .map(b => b.row);
      
      while (usedRows.includes(row)) {
        row++;
      }

      blocks.push({
        event,
        startCol,
        span,
        row
      });
    });
  });

  return blocks;
}

export function CalendarMonth({ year, month, onEventClick }: CalendarMonthProps) {
  // Get first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Calculate starting day offset for Monday-based week
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  // We need to convert to Monday-based: Monday = 0, Sunday = 6
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

  return (
    <section 
      id={`month-${month}`}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 md:py-12 snap-start"
    >
      {/* Month Header */}
      <header className="text-center mb-6 md:mb-8">
        <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground tracking-tight">
          {MONTH_NAMES[month]}
        </h2>
        <p className="text-muted-foreground text-sm md:text-base mt-1 font-mono">
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
              className="text-center text-xs md:text-sm font-medium text-muted-foreground py-2"
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
              
              // Group event blocks by column for per-cell rendering
              const eventsByCol: Record<number, EventBlock[]> = {};
              eventBlocks.forEach(block => {
                // For spanning events, we only render in the start column
                if (!eventsByCol[block.startCol]) {
                  eventsByCol[block.startCol] = [];
                }
                eventsByCol[block.startCol].push(block);
              });
              
              return (
                <div key={weekIndex} className="grid grid-cols-7 gap-px">
                  {week.map((day, dayIndex) => {
                    if (day === null) {
                      return (
                        <div 
                          key={`empty-${dayIndex}`} 
                          className="aspect-[4/3] md:aspect-[3/2] bg-muted/20 rounded-md"
                        />
                      );
                    }

                    // Get events that START on this column
                    const cellEvents = eventsByCol[dayIndex] || [];

                    return (
                      <div
                        key={`day-${day}`}
                        className={`
                          aspect-[4/3] md:aspect-[3/2] rounded-md bg-card border border-border/50
                          flex flex-col relative overflow-hidden
                          ${isToday(day) ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                        `}
                      >
                        {/* Date number - top left header area */}
                        <div className="flex-shrink-0 px-1.5 pt-1 md:px-2 md:pt-1.5">
                          <span className={`
                            text-[10px] md:text-xs font-medium leading-none
                            ${isToday(day) ? 'text-primary font-bold' : 'text-foreground/60'}
                          `}>
                            {day}
                          </span>
                        </div>
                        
                        {/* Event tiles area - centered in remaining space */}
                        <div className="flex-1 flex flex-col justify-center px-0.5 pb-1 md:px-1 md:pb-1.5 min-h-0">
                          <div className="flex flex-col gap-0.5 max-h-full overflow-hidden">
                            {cellEvents.map((block, blockIndex) => {
                              const isLongTitle = block.event.title.length > 12;
                              
                              return (
                                <Tooltip key={`${block.event.id}-${blockIndex}`}>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => onEventClick(block.event)}
                                      className={`
                                        h-4 md:h-[18px] flex items-center px-1 md:px-1.5
                                        text-[9px] md:text-[11px] font-medium leading-tight
                                        transition-all duration-150 hover:opacity-90 hover:brightness-110
                                        cursor-pointer rounded
                                        ${block.span > 1 ? 'rounded-r-none' : ''}
                                      `}
                                      style={{
                                        backgroundColor: `hsl(${block.event.color})`,
                                        color: 'white',
                                        textShadow: '0 1px 1px rgba(0,0,0,0.15)',
                                        // For spanning events, extend beyond cell
                                        ...(block.span > 1 ? {
                                          width: `calc(${block.span * 100}% + ${(block.span - 1) * 1}px)`,
                                          position: 'relative',
                                          zIndex: 10,
                                        } : {})
                                      }}
                                    >
                                      <span className="truncate whitespace-nowrap overflow-hidden">
                                        {block.event.title}
                                      </span>
                                    </button>
                                  </TooltipTrigger>
                                  {isLongTitle && (
                                    <TooltipContent 
                                      side="top" 
                                      className="bg-popover text-popover-foreground border border-border text-xs"
                                    >
                                      {block.event.title}
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
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
}
