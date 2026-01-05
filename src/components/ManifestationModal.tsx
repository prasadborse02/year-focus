import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ManifestationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * MANIFESTATION CONTENT
 * =====================
 * Edit this Markdown content to update the manifestation page.
 */
const MANIFESTATION_CONTENT = `# 2026 Manifestation`;

// This is the year of the **Hybrid Athlete**.

// ## Core Principles

// - Train consistently
// - Respect recovery
// - Do hard things on purpose

// ## The Vision

// This year is about becoming someone who:

// - **Runs** — not away from, but toward challenge
// - **Swims** — through discomfort with grace
// - **Lifts** — themselves and others up
// - **Endures** — when everything says to stop

// ## Monthly Mantras

// **January–March**: *Build the foundation*

// **April–June**: *Embrace the grind*

// **July–September**: *Peak and perform*

// **October–December**: *Reflect and renew*

// ---

// > "The body achieves what the mind believes."

// ---

// *This is not just a year. This is a transformation.*`;

/**
 * Simple Markdown parser
 */
function parseMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2 text-foreground">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="text-lg font-semibold mt-5 mb-3 text-foreground">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="text-2xl font-serif font-bold mt-2 mb-4 text-foreground">$1</h2>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-border my-6" />')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // List items
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc list-inside text-foreground/80 my-1">$1</li>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-primary/50 pl-4 italic text-muted-foreground my-4">$1</blockquote>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(/\n/g, '<br />');
}

export function ManifestationModal({ isOpen, onClose }: ManifestationModalProps) {
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
          <h3 className="text-xl font-serif font-semibold text-foreground">
            Manifestation
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          <div 
            className="prose prose-sm max-w-none text-foreground/90"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(MANIFESTATION_CONTENT) }}
          />
        </div>
      </div>
    </div>
  );
}
