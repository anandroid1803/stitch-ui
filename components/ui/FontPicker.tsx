'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronDown, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  fetchGoogleFontsCatalog,
  searchFonts,
  loadGoogleFont,
  isFontLoaded,
  isSystemFont,
  preloadFont,
  type GoogleFont,
} from '@/lib/fonts/googleFonts';

interface FontPickerProps {
  value: string;
  onChange: (fontFamily: string) => void;
  className?: string;
}

export function FontPicker({ value, onChange, className }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingFont, setLoadingFont] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch fonts catalog on mount
  useEffect(() => {
    let mounted = true;
    
    fetchGoogleFontsCatalog()
      .then((catalog) => {
        if (mounted) {
          setFonts(catalog);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Filter fonts based on search
  const filteredFonts = useMemo(() => {
    return searchFonts(fonts, searchQuery);
  }, [fonts, searchQuery]);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Preload font on hover
  const handleFontHover = useCallback((family: string) => {
    if (!isFontLoaded(family) && !isSystemFont(family)) {
      preloadFont(family);
    }
  }, []);

  // Select a font
  const handleSelectFont = useCallback(async (family: string) => {
    setLoadingFont(family);
    
    try {
      // Load the font before applying it
      await loadGoogleFont(family);
      onChange(family);
      setIsOpen(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to load font:', error);
      // Still apply the font even if loading failed
      onChange(family);
    } finally {
      setLoadingFont(null);
    }
  }, [onChange]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const inputStyle = {
    width: '100%',
    height: 32,
    padding: '0 8px',
    fontSize: 14,
    border: '1px solid #e5e5e5',
    borderRadius: 8,
    backgroundColor: 'white',
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 text-left"
        style={inputStyle}
      >
        <span
          className="truncate"
          style={{ fontFamily: isFontLoaded(value) ? value : 'inherit' }}
        >
          {value}
        </span>
        <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden"
          style={{ maxHeight: 320 }}
          onKeyDown={handleKeyDown}
        >
          {/* Search input */}
          <div className="p-2 border-b border-neutral-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search fonts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-sm border border-neutral-200 rounded-md focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Font list */}
          <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: 256 }}>
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-neutral-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading fonts...</span>
              </div>
            ) : filteredFonts.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-sm">
                No fonts found
              </div>
            ) : (
              <div className="py-1">
                {filteredFonts.slice(0, 100).map((font) => {
                  const isSelected = font.family === value;
                  const isLoadingThis = loadingFont === font.family;
                  const isLoaded = isFontLoaded(font.family);

                  return (
                    <button
                      key={font.family}
                      type="button"
                      onClick={() => handleSelectFont(font.family)}
                      onMouseEnter={() => handleFontHover(font.family)}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-2 transition-colors',
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-neutral-50'
                      )}
                      disabled={isLoadingThis}
                    >
                      <span
                        className="truncate"
                        style={{
                          fontFamily: isLoaded ? font.family : 'inherit',
                        }}
                      >
                        {font.family}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isLoadingThis && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                        )}
                        <span className="text-xs text-neutral-400 capitalize">
                          {font.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {filteredFonts.length > 100 && (
                  <div className="px-3 py-2 text-xs text-neutral-400 text-center border-t border-neutral-100">
                    Showing 100 of {filteredFonts.length} fonts. Type to search for more.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
