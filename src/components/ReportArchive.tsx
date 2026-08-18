import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Sparkles, 
  Trash2, 
  Search, 
  Hand, 
  Layers 
} from 'lucide-react';
import { SynthesisReadingReport } from '../types';
import { generateMysticalPDFReport, exportReadingAsExcelCSV } from '../services/pdfReportGenerator';

interface ReportArchiveProps {
  reports: SynthesisReadingReport[];
  onViewReport: (report: SynthesisReadingReport) => void;
  onDeleteReport: (id: string) => void;
}

export const ReportArchive: React.FC<ReportArchiveProps> = ({
  reports,
  onViewReport,
  onDeleteReport,
}) => {
  const [search, setSearch] = useState('');
  const [exportingId, setExportingId] = useState<string | null>(null);

  const filteredReports = reports.filter(
    (r) =>
      (r.seekerName || 'Unknown').toLowerCase().includes(search.toLowerCase()) ||
      (r.tarotSpread?.spreadType || r.spreadType || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.id || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadPDF = async (report: SynthesisReadingReport, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setExportingId(report.id);
      await generateMysticalPDFReport(report);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div id="report-archive-page" className="w-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-rose-400" />
            <h2 className="font-cinzel text-lg font-bold text-amber-200">
              Synthesis Report Archive
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Access, view, search, and export multi-page PDF certificates and Excel archives for all past readings.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by seeker or spread..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-slate-200 pl-9 pr-3 py-2 border-b border-slate-700 focus:border-amber-400 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <Sparkles className="w-10 h-10 text-amber-400/40 mx-auto" />
          <h3 className="font-cinzel text-base text-slate-300">No Synthesized Readings Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Completed readings from the Reading Studio are permanently indexed here with dynamic PDF generation ready at any moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onViewReport(report)}
              className="pb-6 border-b border-white/10 hover:border-amber-500/30 transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {(report.tarotSpread?.spreadType || report.spreadType || 'past_present_future').replace('_', ' ')} Spread
                  </span>
                  <h3 className="font-cinzel text-base font-bold text-slate-100 group-hover:text-amber-200 transition-colors mt-1.5">
                    {report.seekerName || 'Seeker'}
                  </h3>
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{report.createdAt?.toDate ? report.createdAt.toDate().toLocaleString() : new Date(report.createdAt).toLocaleString()}</span>
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-cinzel text-amber-300">
                    {report.scoreData?.final_score || 'N/A'}
                  </div>
                  <div className="text-[9px] font-mono text-emerald-400">
                    {report.scoreData?.ratingBand || 'Legacy Format'}
                  </div>
                </div>
              </div>

              {/* Summary Snippet */}
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {report.executiveSummary || (report as any).synthesis?.executiveSummary || 'No summary available.'}
              </p>

              {/* Metadata tags */}
              <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center space-x-1">
                  <Hand className="w-3 h-3 text-cyan-400" />
                  <span>{report.palmData?.palmShape || (report as any).palmReading?.palmShape || 'Unknown'} Hand</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Layers className="w-3 h-3 text-purple-400" />
                  <span>{report.drawnCards?.length || (report as any).tarotSpread?.cards?.length || 0} Cards Drawn</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewReport(report);
                  }}
                  className="flex items-center space-x-1 text-xs text-amber-300 hover:text-amber-200"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Reading Details</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => handleDownloadPDF(report, e)}
                    disabled={exportingId === report.id}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>{exportingId === report.id ? 'Generating...' : 'PDF Report'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteReport(report.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete reading"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
