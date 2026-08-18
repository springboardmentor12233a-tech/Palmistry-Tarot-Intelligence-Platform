import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, CheckCircle2, ChevronRight, Sparkles, Brain, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InteractiveDemoModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [activeLine, setActiveLine] = useState(null);

  const steps = [
    { id: 1, title: "CAPTURE YOUR PALM" },
    { id: 2, title: "AI DETECTS YOUR HAND" },
    { id: 3, title: "AI READS YOUR PALM" },
    { id: 4, title: "TAROT INSIGHT" },
    { id: 5, title: "YOUR READING" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl h-[85vh] bg-[#0a0f1d] border border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#0a0f1d] z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-purple-400" size={20} />
              SEE HOW YOUR READING WORKS
            </h2>
            <p className="text-sm text-gray-400 mt-1">Interactive Demo Mode</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-gray-900 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-900 h-2">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CAPTURE */}
            {step === 1 && (
              <motion.div key="step1" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="h-full flex flex-col items-center justify-center">
                <h3 className="text-3xl font-bold text-white mb-2">1. Capture Your Palm</h3>
                <p className="text-gray-400 mb-12">Place your palm inside the frame.</p>
                
                <div className="relative w-72 h-96 border-2 border-dashed border-purple-500/50 rounded-3xl flex items-center justify-center bg-gray-900/50 mb-12">
                   {/* Scanning corners */}
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-400 rounded-tl-3xl z-10"></div>
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-400 rounded-tr-3xl z-10"></div>
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-400 rounded-bl-3xl z-10"></div>
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-400 rounded-br-3xl z-10"></div>
                   
                   <div className="absolute inset-4 bg-[url('/palm-silhouette.png')] bg-cover bg-center opacity-40 mix-blend-screen"></div>
                </div>
                
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium flex items-center gap-2 z-10">
                    <Camera size={20} /> Use Camera
                  </button>
                  <button onClick={() => setStep(2)} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-medium flex items-center gap-2 z-10">
                    <Upload size={20} /> Upload Image
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DETECT */}
            {step === 2 && (
              <motion.div key="step2" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="h-full flex flex-col items-center justify-center">
                <h3 className="text-3xl font-bold text-white mb-8">2. AI Detects Your Hand</h3>
                
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="relative w-64 h-80 bg-gray-900 rounded-2xl overflow-hidden border border-gray-700">
                    <div className="absolute inset-0 bg-[url('/palm-silhouette.png')] bg-cover bg-center opacity-60 mix-blend-screen drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    {/* Points */}
                    {[...Array(15)].map((_, i) => (
                      <motion.div key={i} initial={{scale:0}} animate={{scale:1}} transition={{delay: i*0.1}} className="absolute w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa] z-10" style={{ left: `${20 + Math.random()*60}%`, top: `${20 + Math.random()*60}%` }} />
                    ))}
                    {/* Bounding Box */}
                    <motion.div initial={{opacity:0, scale:1.1}} animate={{opacity:1, scale:1}} transition={{delay: 1}} className="absolute inset-4 border-2 border-dashed border-blue-500/50 rounded-lg z-10"></motion.div>
                  </div>
                  
                  <div className="space-y-4">
                    <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:0.5}} className="flex items-center gap-3 text-white bg-gray-800 px-6 py-4 rounded-xl border border-green-500/30">
                      <CheckCircle2 className="text-green-400" /> <span>Hand detected</span>
                    </motion.div>
                    <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:1.0}} className="flex items-center gap-3 text-white bg-gray-800 px-6 py-4 rounded-xl border border-green-500/30">
                      <CheckCircle2 className="text-green-400" /> <span>Palm localized</span>
                    </motion.div>
                    <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:1.5}} className="flex items-center gap-3 text-white bg-gray-800 px-6 py-4 rounded-xl border border-green-500/30">
                      <CheckCircle2 className="text-green-400" /> <span>Image quality acceptable</span>
                    </motion.div>
                    
                    <motion.button initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.0}} onClick={() => setStep(3)} className="mt-8 px-8 py-3 w-full bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition">
                      Continue Analysis
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: READ LINES */}
            {step === 3 && (
              <motion.div key="step3" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="h-full flex flex-col items-center">
                <h3 className="text-3xl font-bold text-white mb-2">3. AI Reads Your Palm</h3>
                <p className="text-gray-400 mb-8">Click each detected feature to explore its meaning.</p>
                
                <div className="flex flex-col md:flex-row gap-12 w-full max-w-4xl">
                  {/* Palm Viz */}
                  <div className="relative w-64 h-80 bg-gray-900 rounded-2xl mx-auto md:mx-0 overflow-hidden border border-gray-700">
                    <div className="absolute inset-0 bg-[url('/palm-silhouette.png')] bg-cover bg-center opacity-40 mix-blend-screen"></div>
                    <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full z-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                      
                      <path d="M 25,60 Q 50,70 80,50" fill="transparent" stroke={activeLine === 'heart' ? '#f472b6' : '#f472b640'} strokeWidth={activeLine === 'heart' ? '2' : '1'} className="transition-all duration-300" />
                      <path d="M 25,75 Q 50,85 75,100" fill="transparent" stroke={activeLine === 'head' ? '#818cf8' : '#818cf840'} strokeWidth={activeLine === 'head' ? '2' : '1'} className="transition-all duration-300" />
                      <path d="M 25,75 Q 40,110 60,140" fill="transparent" stroke={activeLine === 'life' ? '#c084fc' : '#c084fc40'} strokeWidth={activeLine === 'life' ? '2' : '1'} className="transition-all duration-300" />
                      <path d="M 60,140 Q 60,100 65,40" fill="transparent" stroke={activeLine === 'fate' ? '#34d399' : '#34d39940'} strokeWidth={activeLine === 'fate' ? '2' : '1'} className="transition-all duration-300" />
                    </svg>
                  </div>
                  
                  {/* Line Cards */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'heart', name: 'Heart Line', color: 'pink', desc: 'Emotional processing and relationships.' },
                      { id: 'head', name: 'Head Line', color: 'indigo', desc: 'Intellect, learning style, and communication.' },
                      { id: 'life', name: 'Life Line', color: 'purple', desc: 'Vitality, life transitions, and energy.' },
                      { id: 'fate', name: 'Fate Line', color: 'emerald', desc: 'Career path and life purpose.' },
                    ].map(line => (
                      <div 
                        key={line.id} 
                        onMouseEnter={() => setActiveLine(line.id)}
                        onMouseLeave={() => setActiveLine(null)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border ${activeLine === line.id ? `bg-${line.color}-900/40 border-${line.color}-500` : 'bg-gray-800 border-gray-700 hover:bg-gray-750'}`}
                      >
                        <h4 className={`text-${line.color}-400 font-bold mb-1`}>{line.name}</h4>
                        <p className="text-sm text-gray-300">{line.desc}</p>
                      </div>
                    ))}
                    
                    <div className="col-span-1 sm:col-span-2 pt-4">
                      <button onClick={() => setStep(4)} className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold transition flex justify-center items-center gap-2">
                        Continue to Tarot <ChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: TAROT */}
            {step === 4 && (
              <motion.div key="step4" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="h-full flex flex-col items-center">
                <h3 className="text-3xl font-bold text-white mb-8">4. Tarot Insight</h3>
                
                <div className="flex justify-center gap-4 md:gap-8 mb-12">
                  {[1, 2, 3].map((card, i) => (
                    <motion.div 
                      key={i}
                      initial={{y: 50, opacity:0}} animate={{y: 0, opacity:1}} transition={{delay: i*0.2}}
                      className="w-24 h-36 md:w-40 md:h-64 rounded-xl bg-gray-800 border border-purple-500/50 shadow-xl overflow-hidden relative"
                    >
                      {i === 1 ? (
                        <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg')] bg-cover relative">
                          <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2 backdrop-blur">
                             <p className="text-xs font-bold text-gold-400 uppercase text-center">The Fool</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1c1c38] to-[#0a1128] border-2 border-gold-500/30 p-1 flex items-center justify-center">
                          <Sparkles className="text-gold-500/30" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                
                <div className="max-w-2xl text-center bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
                  <h4 className="text-purple-400 font-bold mb-2">The Fool (Present)</h4>
                  <p className="text-gray-300 text-sm md:text-base">
                    Traditionally representing new beginnings, spontaneity, and a leap of faith. The AI interprets this as a strong current theme of entering a new phase of learning or taking an unexpected opportunity in your life right now.
                  </p>
                </div>
                
                <button onClick={() => setStep(5)} className="mt-8 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold transition">
                  Combine Insights
                </button>
              </motion.div>
            )}

            {/* STEP 5: SYNTHESIS */}
            {step === 5 && (
              <motion.div key="step5" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="h-full flex flex-col items-center">
                <h3 className="text-3xl font-bold text-white mb-6">5. Your AI Spiritual Reading</h3>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-gray-800 px-4 py-2 rounded-lg text-sm text-cyan-400 font-bold border border-gray-700">PALM INSIGHT</div>
                  <div className="text-gray-500">+</div>
                  <div className="bg-gray-800 px-4 py-2 rounded-lg text-sm text-gold-400 font-bold border border-gray-700">TAROT INSIGHT</div>
                  <div className="text-purple-500">→</div>
                  <div className="bg-purple-900/40 px-4 py-2 rounded-lg text-sm text-white font-bold border border-purple-500 flex items-center gap-2"><Brain size={16}/> AI SYNTHESIS</div>
                </div>

                <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                    <h4 className="text-pink-400 font-bold mb-2 text-sm uppercase">❤️ Relationships</h4>
                    <p className="text-gray-300 text-sm">Your deep heart line combined with The Fool suggests you are opening up to new, spontaneous connections while remaining emotionally grounded.</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                    <h4 className="text-blue-400 font-bold mb-2 text-sm uppercase">💼 Career</h4>
                    <p className="text-gray-300 text-sm">A strong fate line intersecting with new beginnings points toward an upcoming shift in your professional trajectory that requires a leap of faith.</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl md:col-span-2">
                    <h4 className="text-purple-400 font-bold mb-2 text-sm uppercase">✨ Life Themes</h4>
                    <p className="text-gray-300 text-sm">Overall, you are in a phase of significant transition. The structural stability shown in your palm provides the foundation needed to embrace the unpredictable but rewarding energy of The Fool.</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center pb-8">
                  <p className="text-gold-400 font-bold mb-4 uppercase tracking-widest text-sm">Your complete reading is ready.</p>
                  <button onClick={() => navigate('/login')} className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition hover:scale-105">
                    START MY REAL READING
                  </button>
                </div>
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default InteractiveDemoModal;
