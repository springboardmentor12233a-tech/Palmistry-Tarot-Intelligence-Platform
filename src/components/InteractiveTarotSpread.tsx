import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  RotateCw, 
  Shuffle, 
  Eye, 
  Layers, 
  Compass, 
  Info,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TarotCard, SpreadType, DrawnCard, SpreadDefinition } from '../types';
import { TAROT_DECK, SPREAD_DEFINITIONS } from '../data/tarotData';
import { getCardImageUrl } from '../utils/tarotImages';

interface InteractiveTarotSpreadProps {
  selectedSpreadType?: SpreadType;
  onSpreadComplete?: (drawnCards: DrawnCard[], spreadType: SpreadType) => void;
  initialDrawnCards?: DrawnCard[];
  readOnly?: boolean;
}

export const InteractiveTarotSpread: React.FC<InteractiveTarotSpreadProps> = ({
  selectedSpreadType = 'three_card',
  onSpreadComplete,
  initialDrawnCards = [],
  readOnly = false,
}) => {
  const [currentSpreadId, setCurrentSpreadId] = useState<SpreadType>(selectedSpreadType);
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>(initialDrawnCards);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [inspectedCard, setInspectedCard] = useState<DrawnCard | null>(null);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [deckViewMode, setDeckViewMode] = useState<'fan' | 'grid'>('fan');

  const currentSpread = SPREAD_DEFINITIONS.find((s) => s.id === currentSpreadId) || SPREAD_DEFINITIONS[1];

  // Initialize and shuffle deck
  useEffect(() => {
    shuffleDeck();
  }, [currentSpreadId]);

  useEffect(() => {
    if (initialDrawnCards.length > 0) {
      setDrawnCards(initialDrawnCards);
      const flipped: Record<number, boolean> = {};
      initialDrawnCards.forEach((_, idx) => {
        flipped[idx] = true;
      });
      setFlippedCards(flipped);
    }
  }, [initialDrawnCards]);

  const shuffleDeck = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const copy = [...TAROT_DECK];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      setShuffledDeck(copy);
      setDrawnCards([]);
      setFlippedCards({});
      setIsShuffling(false);
    }, 600);
  };

  const handlePickCard = (card: TarotCard, deckIndex: number) => {
    if (readOnly) return;
    if (drawnCards.length >= currentSpread.cardCount) return;

    // Check if card is already picked
    if (drawnCards.some((dc) => dc.card.id === card.id)) return;

    const nextPositionIndex = drawnCards.length;
    const posDefinition = currentSpread.positions[nextPositionIndex] || {
      name: `Position ${nextPositionIndex + 1}`,
      description: 'Cosmic Influence',
    };

    // 80% chance upright, 20% reversed
    const orientation = Math.random() > 0.22 ? 'Upright' : 'Reversed';

    const newDrawn: DrawnCard = {
      card,
      orientation,
      positionIndex: nextPositionIndex,
      positionName: posDefinition.name,
      positionDescription: posDefinition.description,
      drawnAt: new Date().toISOString(),
    };

    const updated = [...drawnCards, newDrawn];
    setDrawnCards(updated);

    // Auto flip after a brief delay
    setTimeout(() => {
      setFlippedCards((prev) => ({ ...prev, [nextPositionIndex]: true }));
    }, 400);

    // Check if spread is finished
    if (updated.length === currentSpread.cardCount) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#a855f7', '#38bdf8', '#fbbf24'],
      });
      onSpreadComplete?.(updated, currentSpreadId);
    }
  };

  const toggleCardOrientation = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    setDrawnCards((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              orientation: item.orientation === 'Upright' ? 'Reversed' : 'Upright',
            }
          : item
      )
    );
  };

  const handleAutoDraw = () => {
    if (readOnly) return;
    const needed = currentSpread.cardCount - drawnCards.length;
    if (needed <= 0) return;

    const available = shuffledDeck.filter(
      (c) => !drawnCards.some((dc) => dc.card.id === c.id)
    );

    const newDraws: DrawnCard[] = [];
    for (let i = 0; i < needed; i++) {
      const card = available[i];
      if (!card) break;
      const posIdx = drawnCards.length + i;
      const posDef = currentSpread.positions[posIdx] || {
        name: `Position ${posIdx + 1}`,
        description: 'Cosmic Factor',
      };
      newDraws.push({
        card,
        orientation: Math.random() > 0.22 ? 'Upright' : 'Reversed',
        positionIndex: posIdx,
        positionName: posDef.name,
        positionDescription: posDef.description,
        drawnAt: new Date().toISOString(),
      });
    }

    const completed = [...drawnCards, ...newDraws];
    setDrawnCards(completed);

    // Auto flip all
    const flipped: Record<number, boolean> = {};
    completed.forEach((_, idx) => {
      flipped[idx] = true;
    });
    setFlippedCards(flipped);

    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ec4899', '#38bdf8'],
    });

    onSpreadComplete?.(completed, currentSpreadId);
  };

  return (
    <div id="interactive-tarot-sanctum" className="w-full space-y-6">
      
      {/* Spread Selector & Controls Header */}
      {!readOnly && (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 backdrop-blur-md border-none shadow-[0_8px_32px_rgba(168,85,247,0.15)]">
          <div>
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <h2 className="font-cinzel text-xl font-bold text-amber-200">
                {currentSpread.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {currentSpread.cardCount} Cards
              </span>
            </div>
            <p className="font-serif text-amber-300/85 text-base mt-0.5 max-w-xl">
              {currentSpread.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                id="spread-type-select"
                value={currentSpreadId}
                onChange={(e) => setCurrentSpreadId(e.target.value as SpreadType)}
                className="bg-black/40 text-amber-300 text-xs font-medium border border-white/10 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {SPREAD_DEFINITIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.cardCount} Cards)
                  </option>
                ))}
              </select>
            </div>

            <button
              id="shuffle-deck-btn"
              onClick={shuffleDeck}
              disabled={isShuffling}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 hover:border-amber-500/40 transition-all"
            >
              <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin text-amber-400' : ''}`} />
              <span>Shuffle Deck</span>
            </button>

          </div>
        </div>
      )}

      {/* SPREAD MATRIX / SLOTS DISPLAY */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border-none shadow-[0_8px_32px_rgba(168,85,247,0.15)] min-h-[380px] relative overflow-hidden flex flex-col justify-center">
        
        {/* Mystic Background Compass */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <div className="w-96 h-96 rounded-full border-4 border-dashed border-amber-400 animate-[spin_120s_linear_infinite]" />
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-4 z-10">
          <span className="text-xs font-mono text-slate-400">
            SPREAD PROGRESS: <strong className="text-amber-400">{drawnCards.length} / {currentSpread.cardCount}</strong> SELECTED
          </span>
          {drawnCards.length === currentSpread.cardCount && (
            <span className="flex items-center text-xs font-medium text-emerald-400 space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Spread Complete & Balanced</span>
            </span>
          )}
        </div>

        {/* Spread Slots Layout Grid */}
        <div className={`grid gap-4 sm:gap-6 z-10 ${
          currentSpread.cardCount === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
          currentSpread.cardCount <= 3 ? 'grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto' :
          currentSpread.cardCount <= 5 ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 max-w-5xl mx-auto' :
          'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 max-w-6xl mx-auto'
        }`}>
          {Array.from({ length: currentSpread.cardCount }).map((_, idx) => {
            const drawn = drawnCards[idx];
            const posDef = currentSpread.positions[idx] || { name: `Card ${idx + 1}`, description: 'Cosmic Node' };
            const isFlipped = flippedCards[idx] || false;

            return (
              <div 
                key={idx}
                className="flex flex-col items-center space-y-2 group"
              >
                {/* Position Title */}
                <div className="text-center">
                  <span className="text-[11px] font-bold text-amber-300 font-cinzel line-clamp-1">
                    {posDef.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block line-clamp-1">
                    {posDef.description}
                  </span>
                </div>

                {/* Card Container with 3D Flip */}
                <div
                  onClick={() => {
                    if (drawn) {
                      setInspectedCard(drawn);
                    }
                  }}
                  className={`w-36 h-56 sm:w-40 sm:h-60 rounded-xl cursor-pointer perspective-1000 transition-all duration-300 relative ${
                    drawn ? 'hover:scale-105' : 'border-2 border-dashed border-slate-700 bg-slate-900/40 flex items-center justify-center'
                  }`}
                >
                  {!drawn ? (
                    <div className="text-center p-3 text-slate-500">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full border border-slate-700 flex items-center justify-center">
                        <span className="text-xs font-mono font-bold text-slate-400">{idx + 1}</span>
                      </div>
                      <span className="text-[11px] font-sans">Pick card from deck below</span>
                    </div>
                  ) : (
                    <div 
                      className={`w-full h-full duration-500 transform-style-3d relative rounded-xl shadow-2xl ${
                        isFlipped ? '' : 'rotate-y-180'
                      }`}
                    >
                      {/* CARD FRONT */}
                      <div 
                        className={`absolute inset-0 backface-hidden rounded-xl border-2 overflow-hidden bg-[#0c0d18] ${
                          drawn.orientation === 'Reversed' ? 'border-purple-500/50' : 'border-amber-400/60'
                        }`}
                        style={{
                          boxShadow: drawn.orientation === 'Reversed' 
                            ? '0 0 20px rgba(168, 85, 247, 0.25)' 
                            : '0 0 20px rgba(245, 158, 11, 0.25)',
                        }}
                      >
                        {/* Actual RWS Card Image */}
                        <img 
                          src={getCardImageUrl(drawn.card)}
                          alt={drawn.card.name}
                          className={`w-full h-full object-cover transition-transform duration-500 ${
                            drawn.orientation === 'Reversed' ? 'rotate-180' : ''
                          }`}
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                        />

                        {/* Top Gradient Overlay for Badges */}
                        <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/80 to-transparent flex items-start justify-between z-10">
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded backdrop-blur-md ${
                            drawn.orientation === 'Upright'
                              ? 'bg-amber-500/80 text-black shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                              : 'bg-purple-500/80 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                          }`}>
                            {drawn.orientation}
                          </span>
                          {!readOnly && (
                            <button
                              onClick={(e) => toggleCardOrientation(idx, e)}
                              title="Toggle Upright / Reversed"
                              className="p-1 rounded-full bg-black/60 hover:bg-amber-500/80 text-white hover:text-black transition-colors"
                            >
                              <RotateCw className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Bottom Gradient Overlay (Subtle) */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <h4 className="font-cinzel text-[10px] font-bold text-amber-200 truncate drop-shadow-md">
                            {drawn.card.name}
                          </h4>
                          <p className="text-[8px] text-slate-300 truncate">
                            {drawn.card.keywords.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* CARD BACK */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-[#1b1a38] via-[#0f0e24] to-[#12132e] p-2 flex items-center justify-center">
                        <div className="w-full h-full border border-amber-500/30 rounded-lg flex items-center justify-center bg-radial from-purple-900/30 to-transparent">
                          <div className="w-10 h-10 rounded-full border border-amber-400/40 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-amber-400/80" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inspect Link */}
                {drawn && (
                  <button
                    onClick={() => setInspectedCard(drawn)}
                    className="text-[11px] text-amber-400/80 hover:text-amber-300 flex items-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Inspect Meaning</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE 78-CARD DECK SPREAD / FAN PICKER */}
      {!readOnly && drawnCards.length < currentSpread.cardCount && (
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border-none shadow-[0_8px_32px_rgba(168,85,247,0.15)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-cinzel text-sm font-bold text-amber-300 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>The Tarot Deck — Pick Your Next Arcana</span>
              </h3>
              <p className="text-xs text-slate-400">
                Attune to your intuition and select card #{drawnCards.length + 1} ({currentSpread.positions[drawnCards.length]?.name || 'Card'})
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDeckViewMode(deckViewMode === 'fan' ? 'grid' : 'fan')}
                className="text-xs text-slate-400 hover:text-amber-300 px-2.5 py-1 rounded bg-slate-800 border border-slate-700"
              >
                View: {deckViewMode === 'fan' ? 'Arcana Fan' : 'Full Grid'}
              </button>
            </div>
          </div>

          {/* Deck Fan Out Animation */}
          {deckViewMode === 'fan' ? (
            <div className="h-44 relative flex items-center justify-center overflow-x-auto py-8 scrollbar-thin scrollbar-thumb-slate-700">
              <div className="flex items-center justify-center min-w-[700px]">
                {shuffledDeck.slice(0, 32).map((card, idx) => {
                  const isDrawn = drawnCards.some((dc) => dc.card.id === card.id);
                  if (isDrawn) return null;

                  const offset = idx - 16;
                  const rotation = offset * 2.2;
                  const translateY = Math.abs(offset) * 1.8;

                  return (
                    <motion.div
                      key={card.id}
                      onClick={() => handlePickCard(card, idx)}
                      initial={{ rotate: rotation, y: translateY }}
                      animate={{ rotate: rotation, y: translateY }}
                      whileHover={{ scale: 1.2, y: translateY - 25, zIndex: 50 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      style={{ transformOrigin: "bottom center" }}
                      className="w-14 h-24 sm:w-16 sm:h-28 -ml-8 sm:-ml-10 rounded-lg border border-amber-500/50 bg-gradient-to-br from-[#241f47] to-[#0c0d1c] shadow-lg cursor-pointer flex items-center justify-center relative overflow-hidden transition-shadow hover:shadow-amber-400/40 hover:border-amber-300"
                    >
                      <div className="w-full h-full border border-amber-400/20 rounded-md m-1 flex items-center justify-center bg-[#131428]/80">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400/60" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2 p-2 bg-[#0a0b16] rounded-xl border border-slate-800">
              {shuffledDeck.map((card, idx) => {
                const isDrawn = drawnCards.some((dc) => dc.card.id === card.id);
                if (isDrawn) return null;

                return (
                  <div
                    key={card.id}
                    onClick={() => handlePickCard(card, idx)}
                    className="h-20 rounded border border-amber-500/30 bg-slate-900 hover:bg-amber-500/20 hover:border-amber-400 cursor-pointer flex flex-col items-center justify-center p-1 text-center transition-all overflow-hidden relative group"
                  >
                    <img 
                      src={getCardImageUrl(card)}
                      alt={card.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                    <span className="relative z-10 text-[9px] text-white font-bold leading-tight drop-shadow-md bg-black/60 px-1 py-0.5 rounded w-full line-clamp-2">{card.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CARD INSPECTOR MODAL */}
      <AnimatePresence>
        {inspectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(168,85,247,0.15)] p-6 relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setInspectedCard(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/80"
              >
                ✕
              </button>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Visual Card Artwork */}
                <div 
                  className={`relative w-40 h-64 flex-shrink-0 rounded-xl border-2 overflow-hidden bg-[#0c0d18] ${
                    inspectedCard.orientation === 'Reversed' ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  }`}
                >
                  <img 
                    src={getCardImageUrl(inspectedCard.card)}
                    alt={inspectedCard.card.name}
                    className={`w-full h-full object-cover ${
                      inspectedCard.orientation === 'Reversed' ? 'rotate-180' : ''
                    }`}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 right-2 flex justify-between items-start text-xs z-10">
                    <span className="font-mono text-amber-300 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm border border-amber-500/30">#{inspectedCard.card.number}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold backdrop-blur-sm border ${
                      inspectedCard.orientation === 'Upright' ? 'bg-amber-500/80 text-black border-amber-400' : 'bg-purple-500/80 text-white border-purple-400'
                    }`}>
                      {inspectedCard.orientation}
                    </span>
                  </div>
                </div>

                {/* Card Esoteric Details */}
                <div className="space-y-3 flex-1">
                  <div>
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                      Position: {inspectedCard.positionName}
                    </span>
                    <h3 className="font-cinzel text-xl font-bold text-amber-200">
                      {inspectedCard.card.name} ({inspectedCard.orientation})
                    </h3>
                    <p className="text-xs text-slate-400">
                      {inspectedCard.card.keywords.join(' • ')}
                    </p>
                  </div>

                  {/* Esoteric Associations */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Element</span>
                      <strong className="text-slate-200">{inspectedCard.card.elemental || 'Cosmic'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Astrology</span>
                      <strong className="text-slate-200">{inspectedCard.card.astrology || 'Universal'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Archetype</span>
                      <strong className="text-slate-200 truncate block">{inspectedCard.card.archetype || 'The Seeker'}</strong>
                    </div>
                  </div>

                  {/* Active Meaning */}
                  <div>
                    <h5 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5 mb-1">
                      {inspectedCard.orientation === 'Upright' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-purple-400" />}
                      <span>{inspectedCard.orientation} Guidance:</span>
                    </h5>
                    <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                      {inspectedCard.card.meanings[inspectedCard.orientation === 'Upright' ? 'light' : 'shadow'].map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Fortune Telling Aphorism */}
                  {inspectedCard.card.fortuneTelling.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 italic">
                      "{inspectedCard.card.fortuneTelling[0]}"
                    </div>
                  )}

                  {/* Affirmation */}
                  {inspectedCard.card.affirmation && (
                    <div className="text-[11px] text-emerald-300 font-sans">
                      <strong>Affirmation:</strong> "{inspectedCard.card.affirmation}"
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
