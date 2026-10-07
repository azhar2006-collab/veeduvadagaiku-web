import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  X,
  RotateCcw,
  Sparkles,
  MapPin,
  Bed,
  Maximize2,
  Sofa,
  Phone,
  MessageCircle,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Property } from '../../types';
import { useFavourites } from '../../hooks/useFavourites';
import toast from 'react-hot-toast';

interface PropertySwipeDeckProps {
  properties: Property[];
  onFilterChange?: (type: 'HOUSE' | 'SHOP' | '') => void;
  selectedType?: 'HOUSE' | 'SHOP' | '';
}

export const PropertySwipeDeck: React.FC<PropertySwipeDeckProps> = ({
  properties,
  onFilterChange,
  selectedType = '',
}) => {
  const navigate = useNavigate();
  const { toggleFavourite, isFavourite } = useFavourites();

  // Active stack of cards remaining
  const [deck, setDeck] = useState<Property[]>(properties);
  const [swipedHistory, setSwipedHistory] = useState<{ property: Property; direction: 'left' | 'right' }[]>([]);
  
  // Drag physics state
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [photoIndex, setPhotoIndex] = useState<number>(0);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const SWIPE_THRESHOLD = 72;
  const SWIPE_OUT_MS = 180;

  // Sync deck when input properties change
  useEffect(() => {
    setDeck(properties);
    setSwipedHistory([]);
    setPhotoIndex(0);
  }, [properties]);

  const currentProperty = deck[0];
  const nextProperty = deck[1];
  const thirdProperty = deck[2];

  // Current property photos
  const currentImages = currentProperty?.images && currentProperty.images.length > 0
    ? currentProperty.images.map((img) => img.imageUrl)
    : ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'];

  // Handle Swipe logic
  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (!currentProperty || swipeDirection) return;

      setSwipeDirection(direction);

      if (direction === 'right') {
        // Like / Favourites action
        toggleFavourite(currentProperty.id);
        toast.success(`Saved "${currentProperty.title}" to shortlist!`, {
          duration: 2500,
          position: 'top-center',
          style: {
            borderRadius: '16px',
            background: '#064E3B',
            color: '#fff',
            fontWeight: 'bold',
          },
        });
      } else {
        toast('Passed to next rental', {
          duration: 1500,
          position: 'top-center',
        });
      }

      // Allow fly-out animation to complete
      setTimeout(() => {
        setSwipedHistory((prev) => [{ property: currentProperty, direction }, ...prev]);
        setDeck((prev) => prev.slice(1));
        setSwipeDirection(null);
        dragOffsetRef.current = { x: 0, y: 0 };
        setDragOffset({ x: 0, y: 0 });
        setPhotoIndex(0);
      }, SWIPE_OUT_MS);
    },
    [currentProperty, swipeDirection, toggleFavourite]
  );

  // Undo / Rewind last swiped property
  const handleUndo = () => {
    if (swipedHistory.length === 0) {
      toast('No swiped properties to undo');
      return;
    }
    const [lastSwiped, ...restHistory] = swipedHistory;
    setDeck((prev) => [lastSwiped.property, ...prev]);
    setSwipedHistory(restHistory);
    setPhotoIndex(0);
    toast.success(`Restored "${lastSwiped.property.title}"`);
  };

  // Restart / Reset Deck
  const handleResetDeck = () => {
    setDeck(properties);
    setSwipedHistory([]);
    setPhotoIndex(0);
    isDraggingRef.current = false;
    dragOffsetRef.current = { x: 0, y: 0 };
    setDragOffset({ x: 0, y: 0 });
    toast.success('Deck reshuffled! Browse Chennai rentals again.');
  };

  const releasePointer = (pointerId: number) => {
    try {
      cardRef.current?.releasePointerCapture(pointerId);
    } catch {
      /* capture may already be released */
    }
  };

  // Drag Gesture Handlers (Mouse & Touch)
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.deck-action-prevent-drag')) {
      return;
    }
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragOffsetRef.current = { x: 0, y: 0 };
    cardRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const next = { x: deltaX, y: deltaY };
    dragOffsetRef.current = next;
    setDragOffset(next);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    releasePointer(e.pointerId);

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (deltaX > SWIPE_THRESHOLD) {
      handleSwipe('right');
    } else if (deltaX < -SWIPE_THRESHOLD) {
      handleSwipe('left');
    } else if (Math.abs(deltaX) < 14 && Math.abs(deltaY) < 14 && currentProperty) {
      navigate(`/property/${currentProperty.id}`);
      dragOffsetRef.current = { x: 0, y: 0 };
      setDragOffset({ x: 0, y: 0 });
    } else {
      dragOffsetRef.current = { x: 0, y: 0 };
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    releasePointer(e.pointerId);
    dragOffsetRef.current = { x: 0, y: 0 };
    setDragOffset({ x: 0, y: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }
      if (e.key === 'ArrowRight') {
        handleSwipe('right');
      } else if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'z' || e.key === 'Z') {
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, swipedHistory]);

  // Next / Prev photo in current card
  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev > 0 ? prev - 1 : currentImages.length - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev < currentImages.length - 1 ? prev + 1 : 0));
  };

  // Calculate dynamic transform for top card
  const rotationAngle = (dragOffset.x / 15) * 0.7; // slight rotation while dragging
  const likeOpacity = Math.min(Math.max(dragOffset.x / 90, 0), 1);
  const passOpacity = Math.min(Math.max(-dragOffset.x / 90, 0), 1);

  const cardTransform = swipeDirection
    ? swipeDirection === 'right'
      ? 'translate3d(105%, 0, 0) rotate(18deg)'
      : 'translate3d(-105%, 0, 0) rotate(-18deg)'
    : isDragging
    ? `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.25}px, 0) rotate(${rotationAngle}deg)`
    : 'translate3d(0, 0, 0) rotate(0deg)';

  const cardTransition = isDragging
    ? 'none'
    : `transform ${SWIPE_OUT_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center select-none px-1">
      {/* Category Pills & Deck Header */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 mb-5">
        <div className="inline-flex items-center gap-1 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => onFilterChange?.('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              selectedType === ''
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>All Chennai</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterChange?.('HOUSE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              selectedType === 'HOUSE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Houses</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterChange?.('SHOP')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              selectedType === 'SHOP'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Shops</span>
          </button>
        </div>

        {/* Counter */}
        <div className="text-center sm:text-right">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
            {deck.length > 0 ? `${deck.length} remaining` : 'All viewed'}
          </span>
          <div className="text-[10px] text-slate-400 font-normal">Swipe or tap buttons below</div>
        </div>
      </div>

      {/* Card Stack Area */}
      <div
        className="relative w-full mx-auto aspect-[3/4.15] sm:aspect-[3/4.35] min-h-[380px] sm:min-h-[510px] max-h-[70vh] sm:max-h-[580px]"
        style={{ perspective: '1000px' }}
      >
        {deck.length === 0 ? (
          /* Empty Deck State */
          <div className="w-full h-full bg-gradient-to-b from-[#0B1B3D] to-[#064E3B] rounded-3xl p-8 border border-emerald-800/40 text-white flex flex-col items-center justify-center text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center shadow-inner shadow-emerald-500/30">
              <Sparkles className="w-10 h-10 text-amber-300" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                You're All Caught Up!
              </span>
              <h3 className="text-2xl font-black text-white">
                Explored All Chennai Properties
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xs">
                You've swiped through all available rentals in this category. Reshuffle to explore again or browse the full listings directory.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={handleResetDeck}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-slate-950" />
                <span>Shuffle & Start Again</span>
              </button>

              <Link
                to="/properties"
                className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2"
              >
                <span>Browse All in Grid View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Third Card Underneath */}
            {thirdProperty && (
              <div
                className="absolute inset-0 rounded-3xl bg-gray-900 border border-gray-800 shadow-lg pointer-events-none transform translate-y-6 scale-[0.90] opacity-50 overflow-hidden"
                style={{ zIndex: 1 }}
              >
                <img
                  src={
                    thirdProperty.images?.[0]?.imageUrl ||
                    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={thirdProperty.title}
                  className="w-full h-full object-cover blur-sm brightness-50"
                />
              </div>
            )}

            {/* Second Card Underneath */}
            {nextProperty && (
              <div
                className="absolute inset-0 rounded-3xl bg-gray-900 border border-gray-700 shadow-xl pointer-events-none overflow-hidden transition-all duration-300"
                style={{
                  zIndex: 2,
                  transform: isDragging
                    ? `translateY(${Math.max(14 - Math.abs(dragOffset.x) * 0.08, 0)}px) scale(${Math.min(
                        0.95 + Math.abs(dragOffset.x) * 0.0004,
                        1
                      )})`
                    : 'translateY(12px) scale(0.95)',
                  opacity: isDragging ? Math.min(0.85 + Math.abs(dragOffset.x) * 0.001, 1) : 0.85,
                }}
              >
                <img
                  src={
                    nextProperty.images?.[0]?.imageUrl ||
                    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={nextProperty.title}
                  className="w-full h-full object-cover brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <div className="text-xl font-black">₹{nextProperty.rent.toLocaleString('en-IN')}/mo</div>
                  <div className="text-xs text-gray-300 font-semibold">{nextProperty.locality}, Chennai</div>
                </div>
              </div>
            )}

            {/* Top Interactive Card */}
            {currentProperty && (
              <div
                ref={cardRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing touch-none bg-gray-950 border border-white/15 shadow-2xl transition-shadow duration-300"
                style={{
                  zIndex: 10,
                  transform: cardTransform,
                  transformOrigin: 'center center',
                  transition: cardTransition,
                  willChange: isDragging || swipeDirection ? 'transform' : 'auto',
                }}
              >
                {/* Background Image Carousel */}
                <div className="relative w-full h-full bg-gray-900">
                  <img
                    src={currentImages[photoIndex] || currentImages[0]}
                    alt={currentProperty.title}
                    draggable={false}
                    className="w-full h-full object-cover transition-all duration-300"
                  />

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060D1E] via-[#060D1E]/40 to-black/50 pointer-events-none" />

                  {/* Photo Pagination Bar (Stories Style) */}
                  {currentImages.length > 1 && (
                    <div className="absolute top-3 left-4 right-4 z-20 flex gap-1.5">
                      {currentImages.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                            idx === photoIndex ? 'bg-white shadow-sm' : 'bg-white/30 backdrop-blur-sm'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Photo tap navigation left/right areas */}
                  {currentImages.length > 1 && (
                    <div className="absolute inset-0 z-10 grid grid-cols-2 pointer-events-auto">
                      <button
                        type="button"
                        onClick={handlePrevPhoto}
                        aria-label="Previous photo"
                        className="h-2/3 deck-action-prevent-drag text-transparent flex items-center justify-start pl-2 opacity-0 hover:opacity-100 hover:text-white/60 transition"
                      >
                        <ChevronLeft className="w-8 h-8 drop-shadow-md" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextPhoto}
                        aria-label="Next photo"
                        className="h-2/3 deck-action-prevent-drag text-transparent flex items-center justify-end pr-2 opacity-0 hover:opacity-100 hover:text-white/60 transition"
                      >
                        <ChevronRight className="w-8 h-8 drop-shadow-md" />
                      </button>
                    </div>
                  )}

                  {/* LIKE / SHORTLIST Stamp */}
                  <div
                    className="absolute top-10 left-6 z-30 pointer-events-none border-2 border-emerald-400 bg-emerald-950/80 backdrop-blur-md text-emerald-300 px-4 py-1.5 rounded-2xl font-semibold text-lg sm:text-xl uppercase tracking-widest rotate-[-15deg] shadow-2xl transition-opacity duration-150"
                    style={{
                      opacity: swipeDirection === 'right' ? 1 : likeOpacity,
                    }}
                  >
                    SHORTLIST
                  </div>

                  {/* PASS Stamp */}
                  <div
                    className="absolute top-10 right-6 z-30 pointer-events-none border-2 border-rose-500 bg-rose-950/80 backdrop-blur-md text-rose-300 px-4 py-1.5 rounded-2xl font-semibold text-lg sm:text-xl uppercase tracking-widest rotate-[15deg] shadow-2xl transition-opacity duration-150"
                    style={{
                      opacity: swipeDirection === 'left' ? 1 : passOpacity,
                    }}
                  >
                    PASS
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center px-3 py-1 bg-gray-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-medium rounded-full shadow-lg">
                      {currentProperty.propertyType === 'HOUSE' ? (
                        <span>Residential House</span>
                      ) : (
                        <span>Commercial Shop</span>
                      )}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-medium rounded-full shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                      <span>Verified Owner</span>
                    </span>
                  </div>

                  {/* Bottom Property Info Sheet */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-20 text-white space-y-3">
                    {/* Price & Deposit */}
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-white drop-shadow-md">
                          ₹{currentProperty.rent.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-normal text-emerald-300 ml-1">/ month</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-normal text-gray-300 block">Deposit</span>
                        <span className="text-xs font-medium text-amber-400">
                          ₹{currentProperty.deposit.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Title & Locality */}
                    <div>
                      <h3 className="text-lg font-medium text-white leading-snug line-clamp-1 drop-shadow">
                        {currentProperty.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-normal mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{currentProperty.locality}, Chennai</span>
                      </div>
                    </div>

                    {/* Specs Chips */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {currentProperty.propertyType === 'HOUSE' && currentProperty.bedrooms && (
                        <span className="px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-lg text-xs font-normal flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-amber-400" />
                          <span>{currentProperty.bedrooms} BHK</span>
                        </span>
                      )}
                      <span className="px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-lg text-xs font-normal flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{currentProperty.propertySize} sq.ft</span>
                      </span>
                      {currentProperty.furnishing && (
                        <span className="px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-lg text-xs font-normal flex items-center gap-1">
                          <Sofa className="w-3.5 h-3.5 text-amber-400" />
                          <span className="capitalize">{currentProperty.furnishing.replace('_', ' ').toLowerCase()}</span>
                        </span>
                      )}
                    </div>

                    {/* Amenities Pill Previews */}
                    {currentProperty.amenities && currentProperty.amenities.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-hidden text-[10px] text-gray-300 pointer-events-none">
                        {currentProperty.amenities.slice(0, 3).map((amenity, i) => (
                          <span key={i} className="px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-md border border-white/10 truncate font-normal">
                            - {amenity}
                          </span>
                        ))}
                        {currentProperty.amenities.length > 3 && (
                          <span className="text-[10px] text-amber-300 font-medium">
                            +{currentProperty.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(`/property/${currentProperty.id}`)}
                      className="deck-action-prevent-drag w-full mt-1 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-sm font-medium text-white backdrop-blur-md transition active:scale-[0.98] pointer-events-auto"
                    >
                      View full listing
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Property Action Buttons Bar */}
      {deck.length > 0 && currentProperty && (
        <div className="w-full max-w-sm mx-auto flex items-center justify-center gap-2.5 sm:gap-5 mt-5 sm:mt-6 z-30 px-1">
          {/* Rewind / Undo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={swipedHistory.length === 0}
            aria-label="Undo last swipe"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 border border-white/40 text-amber-600 hover:text-amber-700 hover:border-amber-300 shadow-lg transition-transform duration-150 flex items-center justify-center active:scale-90 disabled:opacity-40 disabled:pointer-events-none"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Pass / Dislike Button */}
          <button
            type="button"
            onClick={() => handleSwipe('left')}
            aria-label="Pass property"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-rose-200/90 text-rose-500 hover:bg-rose-50 hover:border-rose-400 shadow-xl transition-transform duration-150 flex items-center justify-center active:scale-90"
          >
            <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
          </button>

          {/* Info / View Full Page */}
          <button
            type="button"
            onClick={() => navigate(`/property/${currentProperty.id}`)}
            aria-label="View property details"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 border border-white/40 text-primary-600 hover:text-primary-700 shadow-lg transition-transform duration-150 flex items-center justify-center active:scale-90"
          >
            <Info className="w-5 h-5" />
          </button>

          {/* Like / Shortlist Button */}
          <button
            type="button"
            onClick={() => handleSwipe('right')}
            aria-label="Like and shortlist property"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white shadow-xl shadow-emerald-900/40 transition-transform duration-150 flex items-center justify-center active:scale-90"
          >
            <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
          </button>

          {/* Direct Landlord Call or WhatsApp */}
          {currentProperty.contactWhatsapp ? (
            <a
              href={`https://wa.me/91${currentProperty.owner?.user?.mobile || ''}?text=${encodeURIComponent(
                `Vanakkam! I saw your property "${currentProperty.title}" in ${currentProperty.locality} on VeeduVadagaiku. Is it still available for rent?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 border border-white/40 text-emerald-600 hover:text-emerald-700 shadow-lg transition-transform duration-150 flex items-center justify-center active:scale-90"
            >
              <MessageCircle className="w-5 h-5 fill-emerald-600 text-white" />
            </a>
          ) : (
            <Link
              to={`/property/${currentProperty.id}`}
              aria-label="Call landlord"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 border border-white/40 text-emerald-600 shadow-lg transition-transform duration-150 flex items-center justify-center active:scale-90"
            >
              <Phone className="w-5 h-5" />
            </Link>
          )}
        </div>
      )}

      {/* Swipe Hint */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] text-slate-400 font-normal">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Pass
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Shortlist
        </span>
      </div>
    </div>
  );
};
