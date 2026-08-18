import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import { getReading, shuffleDeck, selectCard, getCards } from '../api/tarot';

const TarotReading = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const spreadDef = location.state?.spreadDef;
  const globalReadingId = location.state?.global_reading_id;

  const [reading, setReading] = useState(null);
  const [deck, setDeck] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [shuffling, setShuffling] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  
  // Animation states
  const [drawnCardId, setDrawnCardId] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealStep, setRevealStep] = useState(0); // 0: None, 1: Rising, 2: Flipping, 3: Revealed

  useEffect(() => {
    if (!spreadDef) {
      navigate('/tarot');
      return;
    }

    const init = async () => {
      try {
        const [readRes, cardsRes] = await Promise.all([
          getReading(id),
          getCards()
        ]);
        
        setReading(readRes.data);
        setAllCards(cardsRes.data);
        setSelectedCards(readRes.data.cards || []);

        setShuffling(true);
        const shuffleRes = await shuffleDeck(id);
        setDeck(shuffleRes.data.shuffled_deck);
        setShuffling(false);
      } catch (err) {
        console.error("Initialization error", err);
        setShuffling(false);
      }
    };
    init();
  }, [id, spreadDef, navigate]);

  const handleDrawCard = async (cardId) => {
    if (selectedCards.length >= spreadDef.positions.length || drawnCardId) return;
    
    setDrawnCardId(cardId);
    setRevealStep(1); // Rising
    
    const nextPosition = spreadDef.positions[selectedCards.length];
    
    try {
      const res = await selectCard(id, {
        card_id: cardId,
        position_id: nextPosition.id
      });
      
      setTimeout(() => setRevealStep(2), 1000); // Flipping
      setTimeout(() => {
        setReading(res.data);
        setSelectedCards(res.data.cards);
        setDeck(deck.filter(id => id !== cardId));
        setRevealStep(3); // Revealed
        setIsRevealed(true);
        setDrawnCardId(null); // Allow next draw
        setRevealStep(0);
      }, 2000);
      
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to select card");
      setDrawnCardId(null);
      setRevealStep(0);
    }
  };

  const handleNextDraw = () => {
    setDrawnCardId(null);
    setIsRevealed(false);
    setRevealStep(0);
  };

  if (!reading || !spreadDef || shuffling) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050b14] relative z-10">
        <div className="w-16 h-16 border-4 border-gray-800 border-t-gold-400 rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(212,175,55,0.4)]"></div>
        <p className="text-xl font-bold text-gold-300 animate-pulse tracking-widest uppercase text-sm">
          {shuffling ? "Shuffling the Deck..." : "Preparing Reading..."}
        </p>
      </div>
    );
  }

  const isReadingComplete = selectedCards.length === spreadDef.positions.length;
  const currentPosition = !isReadingComplete ? spreadDef.positions[selectedCards.length] : null;

  // The card currently being revealed or the last one revealed
  const lastSelectedCardData = selectedCards[selectedCards.length - 1];

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 relative z-10 flex flex-col items-center">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-6xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-widest uppercase">
            {spreadDef.name}
          </h1>
          {reading.question && (
            <div className="inline-block px-6 py-2 rounded-full bg-purple-900/30 border border-purple-500/30">
              <p className="text-gray-300 font-medium italic">"{reading.question}"</p>
            </div>
          )}
        </div>

        {/* DRAWING EXPERIENCE */}
        {!isReadingComplete && (
          <div className="flex flex-col items-center py-12">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gold-400 mb-2">Focus your intention</h2>
              <p className="text-gray-400">Your spread has {spreadDef?.positions?.length} positions. Draw {spreadDef?.positions?.length - selectedCards.length} more card(s).</p>
              <p className="text-sm text-purple-400 mt-2 font-medium">Click on a card to manually draw, or use Auto-Draw below.</p>
            </div>
            
            <div className="relative w-full max-w-4xl h-[300px] perspective-1000 flex items-center justify-center mb-8">
               <div className="flex flex-wrap justify-center gap-[-20px] max-w-3xl">
                 {deck.slice(0, 22).map((cardId, index) => {
                   return (
                     <motion.div
                       key={cardId}
                       initial={{ y: 50, opacity: 0 }}
                       animate={{ 
                         y: drawnCardId === cardId ? -150 : 0, 
                         opacity: 1, 
                         zIndex: drawnCardId === cardId ? 100 : index,
                         scale: drawnCardId === cardId ? 1.2 : 1
                       }}
                       transition={{ duration: 0.5, type: 'spring' }}
                       className={`w-20 h-32 md:w-28 md:h-44 rounded-xl shadow-xl absolute cursor-pointer hover:-translate-y-4 transition-transform duration-300`}
                       onClick={() => handleDrawCard(cardId)}
                       style={{
                         marginLeft: `${(index % 11) * 30 - 150}px`,
                         marginTop: `${Math.floor(index / 11) * 40 - 20}px`,
                         transformOrigin: 'bottom center'
                       }}
                     >
                       <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#1c1c38] to-[#0a1128] border-2 border-gold-500/30 p-1 flex items-center justify-center">
                          <div className="w-full h-full border border-gold-500/20 rounded-lg flex items-center justify-center">
                            <Sparkles size={16} className="text-gold-500/50" />
                          </div>
                       </div>
                     </motion.div>
                   );
                 })}
               </div>
            </div>
            
            <button 
               onClick={async () => {
                 let currentDeck = [...deck];
                 const needed = spreadDef.positions.length - selectedCards.length;
                 setRevealStep(1);
                 
                 for(let i=0; i<needed; i++) {
                     const nextPosition = spreadDef.positions[selectedCards.length + i];
                     const randomCardId = currentDeck[Math.floor(Math.random() * currentDeck.length)];
                     currentDeck = currentDeck.filter(c => c !== randomCardId);
                     
                     try {
                       const res = await selectCard(id, { card_id: randomCardId, position_id: nextPosition.id });
                       setReading(res.data);
                       setSelectedCards(res.data.cards);
                     } catch(e) {}
                 }
                 setDeck(currentDeck);
                 setIsRevealed(true);
               }}
               className="px-10 py-4 rounded-xl bg-gradient-to-r from-gold-600 to-yellow-600 hover:from-gold-500 hover:to-yellow-500 text-white font-bold transition shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center gap-2 text-lg"
            >
              <Sparkles size={24} /> Auto-Draw Spread
            </button>
          </div>
        )}

        {/* CARD REVEAL / RESULT */}
        <AnimatePresence mode="wait">
          {isReadingComplete && (
            <motion.div 
              key="reveal" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
              className="flex flex-col gap-12 w-full max-w-5xl mx-auto"
            >
              {selectedCards.map((sc, index) => (
                <div key={index} className="flex flex-col lg:flex-row gap-8 items-center lg:items-start bg-[#0a1128]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Sparkles size={120} />
                   </div>
                   
                   <div className="w-full lg:w-1/3 flex flex-col items-center">
                     <div className="perspective-1000 w-56 md:w-64 aspect-[2/3] relative">
                       <div className={`w-full h-full rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border-2 border-gold-500/40 transform-style-3d ${sc.orientation === 'reversed' ? 'rotate-180' : ''}`}>
                         <img src={sc.card.image_url} alt={sc.card.name} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
                       </div>
                     </div>
                   </div>

                   <div className="w-full lg:w-2/3 relative z-10 space-y-4">
                     <div>
                       <span className="text-gold-400 font-bold uppercase tracking-widest text-sm mb-1 block">Position: {sc.position}</span>
                       <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
                         {sc.card.name}
                         <span className="text-xs px-2 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-400 font-medium">
                           {sc.orientation.toUpperCase()}
                         </span>
                       </h2>
                     </div>

                     <div className="flex flex-wrap gap-2">
                       {sc.card.keywords.map((kw, i) => (
                         <span key={i} className="px-3 py-1 bg-purple-900/30 border border-purple-500/30 rounded-full text-purple-300 text-xs font-medium">
                           {kw}
                         </span>
                       ))}
                     </div>

                     <div className="space-y-4 pt-4 border-t border-gray-800/50">
                       <div>
                         <h4 className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-1">Traditional Meaning</h4>
                         <p className="text-gray-300 leading-relaxed text-sm">
                           {sc.orientation === 'upright' ? sc.card.upright_meaning : sc.card.reversed_meaning}
                         </p>
                       </div>
                       <div>
                         <h4 className="text-cyan-400 uppercase tracking-widest text-xs font-bold mb-1">Reflection</h4>
                         <p className="text-gray-300 italic text-sm">
                           "How does the concept of '{sc.card.keywords[0]}' manifest for you in this context?"
                         </p>
                       </div>
                     </div>
                   </div>
                </div>
              ))}
              
              <div className="pt-6 border-t border-gray-800 flex justify-center">
                {globalReadingId ? (
                  <button onClick={() => navigate(`/combined-reading/${globalReadingId}`)} className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 text-lg">
                    ✨ Generate Complete Synthesis
                  </button>
                ) : (
                  <button onClick={() => navigate('/dashboard')} className="px-8 py-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition flex items-center justify-center gap-2">
                    Back to Dashboard
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SPREAD OVERVIEW (BOTTOM) */}
        {selectedCards.length > 0 && (
          <div className="mt-24 pt-12 border-t border-gray-800/50">
            <h3 className="text-center text-gray-500 uppercase tracking-widest text-sm font-bold mb-8">Spread Overview</h3>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {spreadDef.positions.map((pos, idx) => {
                const sc = selectedCards.find(c => c.position === pos.name);
                return (
                  <div key={pos.id} className="flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-500 mb-2 uppercase">{pos.name}</span>
                    <div className="w-20 h-32 md:w-24 md:h-36 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center relative perspective">
                       {sc ? (
                         <div className={`w-full h-full rounded-lg overflow-hidden transform-style-3d ${sc.orientation === 'reversed' ? 'rotate-180' : ''}`}>
                            <img src={sc.card.image_url} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Card" />
                         </div>
                       ) : (
                         <span className="text-gray-700 font-bold opacity-50">{idx + 1}</span>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TarotReading;
