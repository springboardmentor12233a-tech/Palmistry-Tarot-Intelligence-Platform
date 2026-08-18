import React, { useState, useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, Hand, Heart, Brain, Briefcase, Compass, Star } from 'lucide-react';
import { interpretPalm } from '../services/aiService';
import api from '../services/api';

const PalmResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  
  const [viewMode, setViewMode] = useState('features'); // 'original' or 'features'
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState(null);
  
  const readingId = data?.reading_id;

  useEffect(() => {
    if (!data || !data.result) return;
    
    const fetchInterpretation = async () => {
      try {
        const response = await interpretPalm(data.result, readingId);
        setAiResult(response.data);
      } catch (error) {
        console.error("AI Interpretation Error:", error);
        setAiError(true);
      } finally {
        setAiLoading(false);
      }
    };
    
    fetchInterpretation();
  }, [data, readingId]);

  if (!data || !data.result) {
    return <Navigate to="/palm-reading" />;
  }

  const { result, image } = data;
  
  // Prepare features
  const features = [
    { id: 'heart', name: 'Heart Line', icon: Heart, data: result.lines?.heart_line, meaning: 'Emotions, affection, and relationships.', simple: 'This reading suggests that emotional connection and communication may be important themes for you.', reflection: 'How do you usually communicate your emotions to people close to you?' },
    { id: 'head', name: 'Head Line', icon: Brain, data: result.lines?.head_line, meaning: 'Intellect, learning style, and communication.', simple: 'This reading points toward a thoughtful approach to problem-solving and decision-making.', reflection: 'What new ideas or skills are you currently drawn to explore?' },
    { id: 'life', name: 'Life Line', icon: Compass, data: result.lines?.life_line, meaning: 'Vitality, major life changes, and physical energy.', simple: 'Traditionally interpreted as representing your general well-being and life path changes.', reflection: 'What changes in your daily routine would help you feel more energized?' },
    { id: 'fate', name: 'Fate Line', icon: Briefcase, data: result.lines?.fate_line, meaning: 'Career path, destiny, and external influences.', simple: 'This may suggest periods where external events strongly influence your direction.', reflection: 'How do you balance your personal ambitions with unexpected opportunities?' },
    { id: 'sun', name: 'Sun Line', icon: Star, data: result.lines?.sun_line, meaning: 'Public recognition, creativity, and success.', simple: 'Often associated with creative expression and public visibility.', reflection: 'How do you express your unique talents to the world?' }
  ].filter(f => f.data?.detected); // Only show detected lines

  const generatePDF = async () => {
    // Open tab synchronously to bypass popup blockers
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write('Generating PDF...');
    }
    try {
      // Trigger backend PDF generation
      const response = await api.post(`/api/reports/${readingId}/generate`);
      if (response.data.path) {
        const url = api.defaults.baseURL.replace(/\/$/, '') + response.data.path;
        if (newWindow) {
          newWindow.location.href = url;
        } else {
          window.location.href = url;
        }
      } else {
        if (newWindow) newWindow.close();
      }
    } catch (e) {
      if (newWindow) newWindow.close();
      alert("Error generating PDF. Please try again.");
    }
  };

  const steps = ["Palm Captured", "Hand Detected", "Lines Analyzed", "Palm Reading", "Tarot Reading", "AI Insight", "Report Ready"];

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 relative z-10">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* TOP PROGRESS INDICATOR */}
        <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
          <div className="flex items-center justify-between min-w-[700px]">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                {idx > 0 && (
                  <div className={`absolute top-3 right-1/2 left-[-50%] h-0.5 -z-10 ${idx <= 3 ? 'bg-cyan-500' : 'bg-gray-800'}`}></div>
                )}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-cyan-500 text-white' : idx === 3 ? 'bg-white text-cyan-900 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                  {idx + 1}
                </div>
                <span className={`text-xs whitespace-nowrap ${idx === 3 ? 'text-white font-bold' : idx < 3 ? 'text-cyan-500' : 'text-gray-500'}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PALM RESULT HEADER */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 tracking-tight">
            Your Palm Reading
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
            Here's what the detected features of your palm traditionally represent.
          </p>
          <p className="text-xs text-gray-500 max-w-lg mx-auto uppercase tracking-wider">
            AI-generated spiritual interpretation for reflection and entertainment. Palmistry is not scientifically validated.
          </p>
        </div>

        {/* PALM IMAGE SECTION (Two-Panel Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Image */}
          <div className="flex flex-col items-center space-y-6">
            <div className="flex bg-[#0a1128] rounded-full p-1 border border-gray-800 shadow-xl">
              <button onClick={() => setViewMode('original')} className={`px-6 py-2 rounded-full text-sm font-semibold transition ${viewMode === 'original' ? 'bg-cyan-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Original</button>
              <button onClick={() => setViewMode('features')} className={`px-6 py-2 rounded-full text-sm font-semibold transition ${viewMode === 'features' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Analyzed</button>
            </div>
            
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden border border-gray-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
              <img src={image} alt="Original Palm" className="absolute inset-0 w-full h-full object-cover" />
              
              <AnimatePresence>
                {viewMode === 'features' && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                    className="absolute inset-0 z-10"
                  >
                    <img src={result.marked_image || image} alt="Analyzed Palm" className="w-full h-full object-cover mix-blend-lighten" />
                    <motion.div initial={{ top: 0 }} animate={{ top: '100%' }} transition={{ duration: 1.5, ease: 'linear' }} className="absolute left-0 right-0 h-1 bg-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,1)] z-20" />
                    
                    {/* Visual Legend */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex justify-center gap-3 bg-[#0a1128]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700 shadow-xl">
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div><span className="text-[10px] font-bold text-white uppercase tracking-wider">Heart</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div><span className="text-[10px] font-bold text-white uppercase tracking-wider">Head</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div><span className="text-[10px] font-bold text-white uppercase tracking-wider">Life</span></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="bg-[#0a1128]/60 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Hand className="text-cyan-400" /> Palm Analysis Summary
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                <span className="text-gray-400 font-medium">Hand Detected</span>
                <span className="text-green-400 font-bold flex items-center gap-1">✓ Yes</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                <span className="text-gray-400 font-medium">Handedness</span>
                <span className="text-white font-bold">{result.handedness || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                <span className="text-gray-400 font-medium">Palm Shape</span>
                <span className="text-white font-bold">{result.palm_shape?.type || 'Earth'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                <span className="text-gray-400 font-medium">Finger Structure</span>
                <span className="text-white font-bold">{result.finger_structure?.type || 'Balanced'}</span>
              </div>
              
              <div className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 font-medium text-sm uppercase tracking-wider">Reading Confidence</span>
                  <span className="text-cyan-400 font-bold">{result.confidence ? `${(result.confidence * 100).toFixed(0)}%` : 'Unavailable'}</span>
                </div>
                {result.confidence && (
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence * 100}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* YOUR PALM FEATURES */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-white text-center">Your Palm Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div key={feature.id} className="bg-[#0a1128]/80 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:border-purple-500/30">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center border border-purple-500/20">
                      <feature.icon size={18} className="text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">{feature.name}</h3>
                  </div>
                  <span className="text-xs font-bold text-green-400 uppercase tracking-widest px-2 py-1 bg-green-400/10 rounded">Detected</span>
                </div>
                
                <div className="space-y-4 mb-4">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">What it represents</span>
                    <p className="text-sm text-gray-300 mt-1">{feature.meaning}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Your reading</span>
                    <p className="text-sm text-gray-300 mt-1 font-medium">{feature.simple}</p>
                  </div>
                </div>

                {/* Expandable "What does this mean?" */}
                <div className="mt-4 pt-4 border-t border-gray-800/50">
                  <button onClick={() => setExpandedFeature(expandedFeature === feature.id ? null : feature.id)} className="w-full flex justify-between items-center text-sm text-purple-400 font-semibold hover:text-purple-300 transition">
                    What does this mean? {expandedFeature === feature.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <AnimatePresence>
                    {expandedFeature === feature.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-4 space-y-4">
                          <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-900/30">
                            <span className="block text-xs font-bold text-purple-400 mb-1">Traditional palmistry meaning</span>
                            <p className="text-sm text-gray-300 mb-3">{feature.meaning}</p>
                            
                            <span className="block text-xs font-bold text-purple-400 mb-1">AI interpretation</span>
                            <p className="text-sm text-gray-300 mb-3">{feature.simple}</p>

                            <span className="block text-xs font-bold text-cyan-400 mb-1">Reflection</span>
                            <p className="text-sm text-gray-300 italic">"{feature.reflection}"</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI INSIGHTS */}
        {!aiLoading && !aiError && aiResult && (
          <>
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-white text-center">Your Reading at a Glance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 5 Simple Cards */}
                <div className="bg-gradient-to-br from-[#0a1128] to-purple-900/20 border border-purple-500/20 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-pink-400 mb-3 flex items-center gap-2"><Heart size={20}/> Relationships</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{aiResult.relationships.summary.split('.').slice(0, 2).join('. ')}.</p>
                </div>
                
                <div className="bg-gradient-to-br from-[#0a1128] to-blue-900/20 border border-blue-500/20 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2"><Brain size={20}/> Personality</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{aiResult.personality.summary.split('.').slice(0, 2).join('. ')}.</p>
                </div>
                
                <div className="bg-gradient-to-br from-[#0a1128] to-emerald-900/20 border border-emerald-500/20 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-emerald-400 mb-3 flex items-center gap-2"><Briefcase size={20}/> Career</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{aiResult.career.summary.split('.').slice(0, 2).join('. ')}.</p>
                </div>

              </div>
            </div>

            {/* FUTURE / LIFE TRENDS */}
            <div className="bg-[#0a1128]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 md:p-12">
              <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                <Compass className="text-cyan-400" /> Life Trends
              </h2>
              <div className="space-y-8 relative">
                <div className="absolute top-0 bottom-0 left-6 w-px bg-gray-800 hidden md:block"></div>
                
                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                  <div className="md:w-1/4 pt-1">
                    <div className="w-12 h-12 rounded-full bg-cyan-900/30 border border-cyan-500/30 flex items-center justify-center mb-2 mx-auto md:mx-0 shadow-[0_0_15px_rgba(6,182,212,0.2)] text-cyan-400 font-bold text-xs uppercase tracking-widest">Now</div>
                  </div>
                  <div className="md:w-3/4 bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
                    <h4 className="font-bold text-white mb-2 text-lg">Current Energy</h4>
                    <p className="text-gray-400">{aiResult.life_trends.summary}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                  <div className="md:w-1/4 pt-1">
                    <div className="w-12 h-12 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center mb-2 mx-auto md:mx-0 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-purple-400 font-bold text-xs uppercase tracking-widest">Near</div>
                  </div>
                  <div className="md:w-3/4 bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
                    <h4 className="font-bold text-white mb-2 text-lg">Near-Term Themes</h4>
                    <p className="text-gray-400">Traditional interpretation suggests new learning, collaboration, and potential changes in priorities may become important themes.</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                  <div className="md:w-1/4 pt-1">
                    <div className="w-12 h-12 rounded-full bg-pink-900/30 border border-pink-500/30 flex items-center justify-center mb-2 mx-auto md:mx-0 shadow-[0_0_15px_rgba(236,72,153,0.2)] text-pink-400 font-bold text-xs uppercase tracking-widest">Long</div>
                  </div>
                  <div className="md:w-3/4 bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
                    <h4 className="font-bold text-white mb-2 text-lg">Long-Term Reflection</h4>
                    <p className="text-gray-400">Focus on decisions that align with your deepest values and long-term goals.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* OVERALL GUIDANCE */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/40 via-blue-900/20 to-[#0a1128] border border-purple-500/30 rounded-3xl p-8 md:p-12 shadow-[0_0_40px_rgba(168,85,247,0.15)] text-center">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Sparkles size={200} />
               </div>
               <div className="relative z-10">
                 <h2 className="text-3xl font-bold text-white mb-6">✨ Your Overall Guidance</h2>
                 <p className="text-xl text-gray-200 leading-relaxed font-light italic max-w-3xl mx-auto mb-10">
                   "{aiResult.overall_guidance}"
                 </p>
                 
                 <div className="bg-black/20 rounded-2xl p-6 inline-block text-left">
                   <h4 className="font-bold text-purple-300 uppercase tracking-widest text-xs mb-4 text-center">Key Takeaways</h4>
                   <ul className="space-y-3">
                     <li className="flex items-center gap-3 text-gray-300"><span className="text-green-400">✓</span> Focus on personal growth</li>
                     <li className="flex items-center gap-3 text-gray-300"><span className="text-green-400">✓</span> Communicate openly</li>
                     <li className="flex items-center gap-3 text-gray-300"><span className="text-green-400">✓</span> Develop your strengths</li>
                     <li className="flex items-center gap-3 text-gray-300"><span className="text-green-400">✓</span> Stay flexible during change</li>
                   </ul>
                 </div>
               </div>
            </div>
          </>
        )}

        {/* LOADING STATE */}
        {aiLoading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-cyan-400 animate-spin"></div>
            <p className="text-xl font-bold text-cyan-400 animate-pulse">Reading your palm's story...</p>
          </div>
        )}

        {/* CALL TO ACTION */}
        {!aiLoading && !aiError && (
          <div className="flex flex-col items-center justify-center space-y-6 pt-12 border-t border-gray-800">
            <h3 className="text-2xl font-bold text-white">Your palm reading is complete.</h3>
            <p className="text-gray-400 text-center max-w-md">
              Want another perspective? Combine your palm reading with a Tarot reading for a symbolic second layer of reflection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button 
                onClick={() => navigate('/tarot', { state: { reading_id: readingId } })}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2"
              >
                ✨ Continue to Tarot
              </button>
              <button 
                onClick={generatePDF}
                className="px-8 py-4 rounded-2xl bg-[#0a1128] border border-gray-700 hover:border-gray-500 hover:bg-gray-800 text-white font-bold transition flex items-center justify-center gap-2"
              >
                Download Palm Reading
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PalmResults;
