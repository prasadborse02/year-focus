import { useEffect, useRef } from "react";
import { CalendarEvent, isMultiDayEvent } from "@/data/events";
import { X } from "lucide-react";

interface EventModalProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Simple Markdown parser for event details
 */
function parseMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2 text-foreground">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-foreground">$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // List items
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc list-inside text-foreground/80">$1</li>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-primary/50 pl-4 italic text-muted-foreground my-2">$1</blockquote>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(/\n/g, '<br />');
}

function formatDateRange(event: CalendarEvent): string {
  const start = new Date(event.start);
  const end = new Date(event.end);
  
  const formatDate = (d: Date) => 
    `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  
  if (isMultiDayEvent(event)) {
    return `${formatDate(start)} — ${formatDate(end)}`;
  }
  return formatDate(start);
}

export function EventModal({ event, isOpen, onClose }: EventModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative bg-card rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <header className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-semibold text-foreground flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: `hsl(${event.color})` }}
              />
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDateRange(event)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-100px)] p-6">
          <div 
            className="prose prose-sm max-w-none text-foreground/90"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(event.details) }}
          />
        </div>
      </div>
    </div>
  );
}
