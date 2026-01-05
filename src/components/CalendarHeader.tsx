interface CalendarHeaderProps {
  currentMonth: number;
  onManifestationClick: () => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function CalendarHeader({ currentMonth, onManifestationClick }: CalendarHeaderProps) {
  const scrollToMonth = (month: number) => {
    const element = document.getElementById(`month-${month}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
        {/* Top row: Title + Manifestation button */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-24 md:w-32" /> {/* Spacer for balance */}
          <h1 className="text-lg md:text-2xl font-serif font-bold text-foreground text-center">
            2026: The Year of the Hybrid Athlete
          </h1>
          <button
            onClick={onManifestationClick}
            className="w-24 md:w-32 px-3 py-1.5 rounded-md text-xs md:text-sm font-medium
              text-muted-foreground hover:text-foreground hover:bg-muted/50
              transition-all duration-200 text-right"
          >
            Manifestation
          </button>
        </div>
        
        {/* Month Navigation */}
        <nav className="flex justify-center gap-1 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {MONTH_NAMES.map((name, index) => (
            <button
              key={name}
              onClick={() => scrollToMonth(index)}
              className={`
                px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium
                transition-all duration-200 flex-shrink-0
                ${currentMonth === index 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
            >
              {name}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
