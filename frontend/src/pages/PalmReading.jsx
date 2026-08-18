import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Hand, Scan, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const PalmReading = () => {
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  const readingId = location.state?.reading_id;

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const analyzePalm = async () => {
    if (!file) return;
    setLoading(true);
    setLoadingStep(1); // Image received
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    if (readingId) {
      formData.append('reading_id', readingId);
    }

    try {
      // Simulate cinematic processing steps
      setTimeout(() => setLoadingStep(2), 1000); // Hand detected
      setTimeout(() => setLoadingStep(3), 2000); // Landmarks detected
      setTimeout(() => setLoadingStep(4), 3000); // Palm lines analyzed
      
      const response = await api.post('/api/palm/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setLoadingStep(5); // Reading prepared
      setTimeout(() => {
        navigate('/palm-results', { state: { result: response.data, image: preview, reading_id: readingId } });
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Palm analysis could not be completed.');
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const loadingSteps = [
    "Initializing Scanner...",
    "Image Received",
    "Hand Detected",
    "Mapping Landmarks",
    "Analyzing Palm Lines",
    "Preparing Reading..."
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 relative z-10 flex flex-col items-center">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-cyan-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-cyan-900/30 rounded-full border border-cyan-500/30 mb-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Hand className="text-cyan-400" size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Palm Scanner
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Let AI examine the visual features of your palm for a traditional palmistry interpretation.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-[#0a1128]/80 backdrop-blur-xl border border-gray-800 p-8 md:p-12 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div 
                key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl transition-all duration-300 ${isDragging ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-700 hover:border-cyan-500/50 hover:bg-[#0f1730]'}`}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              >
                <div className="relative mb-6 group">
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl group-hover:bg-cyan-400/30 transition-colors"></div>
                  <div className="relative w-20 h-20 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center">
                    <Scan className="w-10 h-10 text-cyan-400" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Place your palm here</h3>
                <p className="text-gray-400 text-sm mb-8 text-center max-w-sm">
                  Upload an image of your palm. Make sure the lighting is clear and lines are visible.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <Upload size={18} /> Upload Image
                  </button>
                  <button className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition border border-gray-700">
                    <Camera size={18} /> Open Camera
                  </button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
              </motion.div>
            ) : loading ? (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12">
                <div className="relative w-48 h-64 mb-8">
                   <img src={preview} className="w-full h-full object-cover rounded-xl opacity-50 grayscale" alt="Processing" />
                   <div className="absolute inset-0 rounded-xl border border-cyan-500/50 overflow-hidden">
                     <motion.div 
                       animate={{ top: ['0%', '100%', '0%'] }} 
                       transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                       className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,1)]"
                     />
                   </div>
                </div>
                
                <div className="space-y-3 w-full max-w-xs">
                  {loadingSteps.map((step, idx) => (
                    <div key={idx} className={`flex items-center gap-3 transition-opacity duration-300 ${idx <= loadingStep ? 'opacity-100' : 'opacity-30'}`}>
                      {idx < loadingStep ? (
                        <CheckCircle2 size={16} className="text-cyan-400" />
                      ) : idx === loadingStep ? (
                        <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
                      )}
                      <span className={`text-sm ${idx <= loadingStep ? 'text-cyan-300' : 'text-gray-500'}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <div className="relative rounded-2xl overflow-hidden mb-8 border border-gray-700 max-w-md w-full shadow-2xl">
                  <img src={preview} alt="Palm Preview" className="w-full object-cover aspect-[3/4]" />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
                    <span className="text-white text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="text-green-400" size={16} /> Image Ready
                    </span>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl mb-8 w-full max-w-md flex items-start gap-3">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div className="text-sm">{error}</div>
                  </div>
                )}
                
                <div className="flex gap-4 w-full max-w-md">
                  <button onClick={() => setFile(null)} className="flex-1 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition border border-gray-700">
                    Retake
                  </button>
                  <button onClick={analyzePalm} className="flex-[2] px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    Analyze Palm
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default PalmReading;
