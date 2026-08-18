import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CosmicBackground from '../components/landing/CosmicBackground';
import AnimatedHero from '../components/landing/AnimatedHero';
import { Camera, Brain, Sparkles, Star, Target, Compass, Users, Scan } from 'lucide-react';

const FadeInWhenVisible = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 40 }
      }}
    >
      {children}
    </motion.div>
  );
};

const Landing = () => {
  return (
    <div className="relative min-h-screen bg-[#050b14] text-gray-100 overflow-x-hidden">
      {/* Background Layer */}
      <CosmicBackground />

      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Section 1: Hero */}
        <section id="hero-section" className="min-h-screen flex items-center justify-center">
          <AnimatedHero />
        </section>

        {/* Section 2: How It Works */}
        <section className="py-24 bg-[#0a0f1d]/80 backdrop-blur-sm border-t border-gray-800/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">How It Works</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">A seamless journey from physical capture to spiritual insight.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Capture", desc: "Upload your palm or use your device's camera.", icon: Camera, color: "blue" },
                { step: "02", title: "Analyze", desc: "Our neural engine detects and traces your unique palm lines.", icon: Scan, color: "purple" },
                { step: "03", title: "Discover", desc: "Draw Tarot cards to reveal current energetic influences.", icon: Star, color: "gold" },
                { step: "04", title: "Reflect", desc: "Receive a personalized AI spiritual interpretation.", icon: Brain, color: "pink" }
              ].map((item, i) => (
                <FadeInWhenVisible key={i} delay={i * 0.1}>
                  <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                    <div className="text-6xl font-black text-gray-800/50 absolute -top-4 -right-2 transition-transform group-hover:scale-110">{item.step}</div>
                    <item.icon className={`text-${item.color}-400 mb-6`} size={32} />
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeInWhenVisible>
              ))}
            </div>
          </div>
        </section>
        
        {/* Section 3: What AI Can Explore */}
        <section className="py-24 bg-[#050b14]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-purple-400">What AI Can Explore</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Gain deep insights into various facets of your life journey.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Relationships", icon: Users, color: "pink" },
                { title: "Personality", icon: Brain, color: "indigo" },
                { title: "Career", icon: Target, color: "blue" },
                { title: "Life Themes", icon: Compass, color: "purple" },
                { title: "Personal Growth", icon: Sparkles, color: "emerald" },
                { title: "Tarot Insights", icon: Star, color: "gold" }
              ].map((item, i) => (
                <FadeInWhenVisible key={i} delay={i * 0.1}>
                  <div className="bg-gray-900/40 hover:bg-gray-800/60 border border-gray-800 hover:border-purple-500/30 p-6 rounded-2xl flex items-center gap-4 transition-all cursor-default">
                    <div className={`p-3 bg-${item.color}-900/20 rounded-xl text-${item.color}-400`}>
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{item.title}</h3>
                    </div>
                  </div>
                </FadeInWhenVisible>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Palm + Tarot Diagram */}
        <section className="py-24 bg-gradient-to-b from-[#050b14] to-[#0a0f1d] border-t border-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <FadeInWhenVisible>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                  Ancient Wisdom. <br/> Modern Intelligence.
                </h2>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
                {/* Connecting Lines (Desktop) */}
                <div className="hidden md:block absolute top-1/2 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-cyan-500/20 via-purple-500 to-gold-500/20 -translate-y-1/2 z-0">
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-purple-500 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ping opacity-50"></div>
                </div>

                <div className="bg-gray-900/80 backdrop-blur border border-cyan-500/30 p-8 rounded-3xl w-full md:w-1/3 text-center z-10 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                  <h3 className="text-cyan-400 font-bold mb-2">Palm Analysis</h3>
                  <p className="text-sm text-gray-400">Structural foundation, inherent traits, and life patterns.</p>
                </div>

                <div className="bg-purple-900/20 backdrop-blur border border-purple-500/50 p-8 rounded-full w-48 h-48 flex flex-col items-center justify-center z-10 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                  <Brain size={40} className="text-white mb-2" />
                  <span className="text-white font-bold text-sm tracking-widest">AI CORE</span>
                </div>

                <div className="bg-gray-900/80 backdrop-blur border border-gold-500/30 p-8 rounded-3xl w-full md:w-1/3 text-center z-10 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                  <h3 className="text-gold-400 font-bold mb-2">Tarot Insight</h3>
                  <p className="text-sm text-gray-400">Current energetic influences, symbolism, and spiritual guidance.</p>
                </div>
              </div>
            </FadeInWhenVisible>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#050b14] border-t border-gray-900 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-4">
             <p className="text-purple-500/50 font-bold tracking-[0.2em] text-sm uppercase">AI-Generated Spiritual Interpretation</p>
             <p className="text-gray-500 text-xs max-w-3xl mx-auto leading-relaxed">
               This platform is designed for spiritual reflection and entertainment. Palmistry and Tarot interpretations are not scientifically validated predictions and should not replace professional medical, financial, legal, or psychological advice.
             </p>
             <p className="text-gray-600 text-xs mt-8">© {new Date().getFullYear()} AI Palmistry & Tarot Intelligence Platform.</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Landing;
