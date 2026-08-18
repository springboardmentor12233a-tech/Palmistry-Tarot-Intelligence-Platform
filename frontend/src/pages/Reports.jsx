import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Hand, Sparkles, CheckCircle2 } from 'lucide-react';
import { getReadings } from '../services/readingService';
import api from '../services/api';

const Reports = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const response = await getReadings();
        setReadings(response.data.filter(r => r.pdf_report_path));
      } catch (error) {
        console.error('Failed to fetch readings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReadings();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 relative z-10 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-12">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-900/30 rounded-full border border-blue-500/30 mb-2">
            <FileText className="text-blue-400" size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Your Reports</h1>
          <p className="text-gray-400 text-lg">Access your downloaded AI spiritual reading documents.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-gray-800 border-t-blue-400 rounded-full animate-spin"></div></div>
        ) : readings.length === 0 ? (
          <div className="bg-[#0a1128]/80 backdrop-blur-xl border border-gray-800 p-12 rounded-3xl text-center shadow-xl max-w-2xl mx-auto">
             <FileText size={48} className="text-gray-600 mx-auto mb-6" />
             <h3 className="text-xl font-bold text-white mb-2">No Reports Yet</h3>
             <p className="text-gray-400">Generate a PDF at the end of a combined reading to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readings.map(r => (
              <div key={r.id} className="bg-[#0a1128]/80 backdrop-blur border border-gray-800 p-6 rounded-2xl hover:border-blue-500/50 transition-colors shadow-lg group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-900/30 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <FileText size={24} />
                  </div>
                  <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">Combined AI Insight Report</h3>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 size={14} className="text-green-400" /> Palm Analysis Included</div>
                  <div className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 size={14} className="text-green-400" /> Tarot Analysis Included</div>
                  <div className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 size={14} className="text-green-400" /> AI Synthesis Included</div>
                </div>
                <button onClick={() => window.open(api.defaults.baseURL.replace(/\/$/, '') + r.pdf_report_path, '_blank')} className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium text-white transition flex justify-center items-center gap-2">
                  <Download size={16} /> View Document
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
