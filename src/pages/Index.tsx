import { useState, useEffect, useCallback } from "react";
import { CalendarMonth } from "@/components/CalendarMonth";
import { CalendarHeader } from "@/components/CalendarHeader";
import { EventModal } from "@/components/EventModal";
import { ManifestationModal } from "@/components/ManifestationModal";
import { CalendarEvent } from "@/data/events";

/**
 * HYBRID ATHLETE CALENDAR 2026
 * ============================
 * 
 * A full-year calendar displaying January–December 2026.
 * Each month occupies one full screen (100vh).
 * 
 * AUTO-SCROLL BEHAVIOR:
 * On page load, automatically scrolls to the current month
 * based on today's date. For example, if today is Feb 15,
 * the page opens with February visible.
 */

const YEAR = 2026;
const MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export default function Index() {
  const [currentMonth, setCurrentMonth] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isManifestationOpen, setIsManifestationOpen] = useState(false);

  /**
   * AUTO-SCROLL TO CURRENT MONTH
   */
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const month = today.getMonth();
    
    const targetMonth = currentYear === YEAR ? month : 0;
    
    const timeoutId = setTimeout(() => {
      const element = document.getElementById(`month-${targetMonth}`);
      if (element) {
        element.scrollIntoView({ behavior: 'instant' });
        setCurrentMonth(targetMonth);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  /**
   * SCROLL DETECTION
   */
  useEffect(() => {
    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      const estimatedMonth = Math.round(scrollY / viewportHeight);
      const clampedMonth = Math.max(0, Math.min(11, estimatedMonth));
      
      if (clampedMonth !== currentMonth) {
        setCurrentMonth(clampedMonth);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentMonth]);

  /**
   * EVENT HANDLERS
   */
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleCloseEventModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handleManifestationClick = useCallback(() => {
    setIsManifestationOpen(true);
  }, []);

  const handleCloseManifestationModal = useCallback(() => {
    setIsManifestationOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header with Title and Month Navigation */}
      <CalendarHeader 
        currentMonth={currentMonth} 
        onManifestationClick={handleManifestationClick}
      />
      
      {/* Calendar Months Container */}
      <main className="pt-24 md:pt-28 snap-y snap-mandatory">
        {MONTHS.map(month => (
          <CalendarMonth
            key={month}
            year={YEAR}
            month={month}
            onEventClick={handleEventClick}
          />
        ))}
      </main>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={handleCloseEventModal}
        />
      )}

      {/* Manifestation Modal */}
      <ManifestationModal
        isOpen={isManifestationOpen}
        onClose={handleCloseManifestationModal}
      />

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border">
        <p className="font-mono">2026 — The Year of the Hybrid Athlete</p>
        <p className="mt-1 text-xs">
          A read-only life calendar reflecting yearly focus and defining challenges
        </p>
      </footer>
    </div>
  );
}
