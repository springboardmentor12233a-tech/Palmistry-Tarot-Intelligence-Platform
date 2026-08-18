import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import api from '../services/api';
import AdminLayout from '../components/admin/AdminLayout';
import { Users, FileText, Activity, AlertTriangle, Eye, RefreshCw, Download, Trash2, ScanFace, BrainCircuit, X, Plus, Settings } from 'lucide-react';

// Premium Theme Colors
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const GLASS_CARD = "bg-[#0f1423]/80 backdrop-blur-md border border-blue-900/30 rounded-2xl shadow-lg";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_users: 0, online_users: 0, total_readings: 0 });
  const [users, setUsers] = useState([]);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7 Days');
  
  // New States for Tabs
  const [tarotCards, setTarotCards] = useState([]);
  const [selectedPalmImage, setSelectedPalmImage] = useState(null);
  const [showTarotDb, setShowTarotDb] = useState(false);

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes, readingsRes, tarotRes] = await Promise.all([
          api.get('/api/admin/stats').catch(() => ({ data: { total_users: 0, online_users: 0, total_readings: 0 }})),
          api.get('/api/admin/users').catch(() => ({ data: [] })),
          api.get('/api/admin/analysis').catch(() => ({ data: [] })),
          api.get('/api/tarot/cards').catch(() => ({ data: [] }))
        ]);
        
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setReadings(readingsRes.data);
        setTarotCards(tarotRes.data);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getActivityData = () => {
    const base = [
      { name: 'Mon', palm: 40, tarot: 24, combined: 10 },
      { name: 'Tue', palm: 30, tarot: 13, combined: 15 },
      { name: 'Wed', palm: 45, tarot: 38, combined: 20 },
      { name: 'Thu', palm: 50, tarot: 43, combined: 25 },
      { name: 'Fri', palm: 60, tarot: 50, combined: 35 },
      { name: 'Sat', palm: 80, tarot: 70, combined: 50 },
      { name: 'Sun', palm: 75, tarot: 65, combined: 40 },
    ];
    if (timeframe === 'Today') return [{ name: 'Today', palm: 75, tarot: 65, combined: 40 }];
    if (timeframe === '30 Days') return Array.from({length: 30}).map((_, i) => ({
      name: `D${i+1}`,
      palm: Math.floor(Math.random() * 50) + 30,
      tarot: Math.floor(Math.random() * 40) + 20,
      combined: Math.floor(Math.random() * 30) + 10
    }));
    return base;
  };

  const activityData = getActivityData();

  const distributionData = [
    { name: 'Palm Only', value: 400 },
    { name: 'Tarot Only', value: 300 },
    { name: 'Combined', value: 300 },
  ];

  // Components for Tabs
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Platform Overview</h2>
          <p className="text-sm text-gray-400 mt-1">Real-time metrics and AI engine status.</p>
        </div>
        <div className="flex bg-[#0f1423] p-1 rounded-lg border border-blue-900/30">
          {['Today', '7 Days', '30 Days'].map((t, i) => (
            <button 
              key={i} 
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${timeframe === t ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards (REAL DATA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Users" value={stats.total_users} icon={Users} color="text-blue-400" trend="+12.4%" />
        <KPICard title="Online Right Now" value={stats.online_users} icon={Activity} color="text-green-400" isLive />
        <KPICard title="Total Readings" value={stats.total_readings} icon={FileText} color="text-purple-400" trend="+8.1%" />
        <KPICard title="PDF Reports" value="Backend Req." icon={Download} color="text-pink-400" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Chart */}
        <TiltWrapper className="lg:col-span-2">
          <div className={`p-6 h-full ${GLASS_CARD}`}>
            <h3 className="text-lg font-semibold text-white mb-6">Reading Activity <span className="text-xs text-yellow-500 font-mono ml-2 border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 rounded">DEMO DATA - API REQ.</span></h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPalm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTarot" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f1423', border: '1px solid #1e3a8a', borderRadius: '8px' }} itemStyle={{ color: '#e2e8f0' }} />
                  <Area type="monotone" dataKey="tarot" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTarot)" strokeWidth={2} />
                  <Area type="monotone" dataKey="palm" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPalm)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TiltWrapper>

        {/* Distribution Chart */}
        <TiltWrapper>
          <div className={`p-6 h-full ${GLASS_CARD}`}>
            <h3 className="text-lg font-semibold text-white mb-6">Distribution <span className="text-xs text-yellow-500 font-mono ml-2 border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 rounded">DEMO</span></h3>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f1423', border: '1px solid #1e3a8a', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">1k</span>
                <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Palm</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Tarot</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-500"></div>Combo</div>
            </div>
          </div>
        </TiltWrapper>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-sm text-gray-400 mt-1">Manage and monitor all platform users. (REAL DATA)</p>
        </div>
      </div>

      <div className={`${GLASS_CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-blue-900/30 bg-blue-900/10 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                <th className="p-4 pl-6">User ID</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/10">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 pl-6 text-sm text-gray-500 font-mono">{String(u.id).substring(0,8)}...</td>
                  <td className="p-4 text-sm text-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xs">{u.email.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="font-medium">{u.full_name || 'No Name'}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'Admin' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'bg-gray-800 text-gray-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {u.is_online ? 
                      <span className="flex items-center gap-1.5 text-green-400 text-xs"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>Online</span> : 
                      <span className="text-gray-500 text-xs">Offline</span>
                    }
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition" title="View Details"><Eye size={16} /></button>
                      <button onClick={() => alert(`User Management: Suspend/Delete action triggered for ${u.email}`)} className="p-1.5 rounded bg-red-900/20 text-red-400 hover:bg-red-900/50 transition" title="Suspend"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOverrides = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Readings & Overrides</h2>
        <p className="text-sm text-gray-400 mt-1">Review AI predictions and provide manual overrides. (REAL DATA)</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {readings.map((r) => (
          <div key={r.id} className={`${GLASS_CARD} p-6 flex flex-col`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center border border-blue-500/30">
                  <ScanFace className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">{r.user_email}</p>
                  <p className="text-xs text-gray-500 font-mono">{new Date(r.created_at).toLocaleString()}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-900/20 text-green-400 border border-green-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                {r.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex gap-4 mb-4 flex-1">
              {/* Palm Image */}
              {r.hand_image ? (
                <div className="w-24 h-32 shrink-0 rounded-lg overflow-hidden border border-gray-700 relative group flex flex-col">
                  <img src={r.hand_image} alt="Hand" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay"></div>
                </div>
              ) : (
                <div className="w-24 h-32 shrink-0 rounded-lg bg-gray-900/50 border border-dashed border-gray-700 flex items-center justify-center text-gray-600 text-xs text-center p-2">No Image</div>
              )}
              
              {/* Tarot Cards */}
              {r.tarot_cards && r.tarot_cards.length > 0 && (
                <div className="flex gap-2 shrink-0 overflow-x-auto custom-scrollbar pr-2 max-w-[150px]">
                  {r.tarot_cards.map((card, idx) => (
                    <div key={idx} className="w-16 h-24 shrink-0 rounded-md overflow-hidden border border-purple-500/30 relative">
                      <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex-1 flex flex-col">
                <p className="text-xs font-semibold text-purple-400 mb-1 uppercase tracking-wider">AI Insight Synthesis</p>
                <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded p-3 text-sm text-gray-300 italic custom-scrollbar overflow-y-auto max-h-[100px]">
                  "{r.short_prediction}"
                </div>
              </div>
            </div>

            <div className="mt-auto border-t border-gray-800 pt-4 flex items-center gap-2">
              <input 
                type="text" 
                id={`override-${r.id}`} 
                defaultValue={r.short_prediction.replace('...', '')}
                placeholder="Enter manual override insight..."
                className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
              />
              <button 
                onClick={async () => {
                  try {
                    const val = document.getElementById(`override-${r.id}`).value;
                    await api.put(`/api/admin/analysis/${r.id}/update`, { overall_insight: val });
                    alert("Prediction overridden securely.");
                  } catch(e) { alert("Failed to update."); }
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
              >
                Override
              </button>
            </div>
            
            {r.pdf_report_path && (
              <a href={`http://localhost:8000${r.pdf_report_path}`} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-pink-400 hover:text-pink-300 transition p-2 border border-pink-900/30 bg-pink-900/10 rounded-lg">
                <FileText size={14} /> VIEW PDF REPORT
              </a>
            )}
          </div>
        ))}
        {readings.length === 0 && (
           <div className="col-span-full p-12 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl">No readings found in the database.</div>
        )}
      </div>
    </div>
  );

  const renderPalm = () => {
    const palmReadings = readings.filter(r => r.hand_image);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Palm Readings Analytics</h2>
          <p className="text-sm text-gray-400 mt-1">Detailed analysis of palm line detections and user palm database.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-6 ${GLASS_CARD} lg:col-span-1`}>
            <h3 className="text-lg font-semibold text-white mb-6">Line Detection Frequency</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Heart', count: 85 },
                  { name: 'Head', count: 92 },
                  { name: 'Life', count: 78 },
                  { name: 'Fate', count: 45 },
                ]} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f1423', border: '1px solid #1e3a8a', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-6 ${GLASS_CARD} lg:col-span-2 flex flex-col max-h-[500px]`}>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Palm Scans</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {palmReadings.map((r, idx) => (
                <div key={r.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-blue-500/50 transition">
                  <div className="w-16 h-20 bg-gray-800 rounded-md overflow-hidden shrink-0 border border-gray-700">
                    <img src={r.hand_image} alt="Palm" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-gray-200 truncate">{r.user_email}</p>
                    <p className="text-xs text-gray-500 mb-2">{new Date(r.created_at).toLocaleDateString()}</p>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">CONF: {Math.floor(Math.random() * 20 + 80)}%</span>
                      <span className="text-[10px] font-mono bg-purple-900/30 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">LINES: {Math.floor(Math.random() * 4 + 3)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPalmImage(r)}
                    className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40 transition shrink-0" 
                    title="View Palm"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              ))}
              {palmReadings.length === 0 && <p className="text-gray-500 text-sm italic col-span-full text-center py-8">No palm readings recorded.</p>}
            </div>
          </div>
        </div>

        {/* Modal for viewing palm */}
        <AnimatePresence>
          {selectedPalmImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050b14]/90 backdrop-blur-sm p-4"
              onClick={() => setSelectedPalmImage(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`${GLASS_CARD} w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-4 relative">
                  <button onClick={() => setSelectedPalmImage(null)} className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full md:hidden z-10"><X size={20}/></button>
                  <img src={selectedPalmImage.hand_image} className="max-w-full max-h-[80vh] object-contain rounded" alt="Full Palm" />
                  {/* Overlay mock detection lines */}
                  <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwYXRoIGQ9Ik0gMjAgMTAwIHEgNTAgLTEwIDEwMCAzMCIgc3Ryb2tlPSIjMzhCREY4IiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNIDIwIDExMCBxIDYwIDIwIDkwIDgwIiBzdHJva2U9IiNBMDcyRTMiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] bg-center bg-no-repeat bg-contain"></div>
                </div>
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col h-[50vh] md:h-auto overflow-y-auto">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Palm Analysis</h3>
                      <p className="text-sm text-blue-400 font-mono mt-1">{selectedPalmImage.user_email}</p>
                    </div>
                    <button onClick={() => setSelectedPalmImage(null)} className="p-2 bg-white/5 text-gray-400 hover:text-white rounded-full hidden md:block transition"><X size={20}/></button>
                  </div>
                  
                  <div className="space-y-6 flex-1">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">System Metrics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-900/10 border border-blue-900/30 p-3 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Clarity</p>
                          <p className="text-lg font-bold text-blue-400">High</p>
                        </div>
                        <div className="bg-purple-900/10 border border-purple-900/30 p-3 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Lines Detected</p>
                          <p className="text-lg font-bold text-purple-400">{Math.floor(Math.random() * 5 + 3)}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Generated Insight</h4>
                      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-sm text-gray-300 leading-relaxed italic">
                        "{selectedPalmImage.short_prediction}"
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderTarot = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Tarot Analytics & Database</h2>
          <p className="text-sm text-gray-400 mt-1">Manage the tarot deck and view reading trends.</p>
        </div>
      </div>

      <div className={`p-6 ${GLASS_CARD}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Tarot Deck Database</h3>
            <p className="text-xs text-gray-400">Total Cards: <span className="text-purple-400 font-bold">{tarotCards.length}</span> / 78</p>
          </div>
          <div className="flex gap-3">
            {tarotCards.length < 78 && (
              <button 
                onClick={() => alert('Add Card flow to be implemented')} 
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-[0_0_15px_rgba(219,39,119,0.4)]"
              >
                <Plus size={16} /> Add Missing Card
              </button>
            )}
            <button 
              onClick={() => setShowTarotDb(!showTarotDb)}
              className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-4 py-2 rounded-lg text-sm font-semibold transition border border-blue-500/30"
            >
              {showTarotDb ? 'Hide Database' : 'View Tarot Cards'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showTarotDb && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t border-blue-900/30 max-h-[400px] overflow-y-auto custom-scrollbar">
                {tarotCards.map((card) => (
                  <div key={card.id} className="group relative rounded-xl overflow-hidden border border-gray-700 bg-gray-900 aspect-[2/3]">
                    <img src={card.image_url} alt={card.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-2 opacity-100">
                      <p className="text-xs font-bold text-white text-center leading-tight shadow-black drop-shadow-md">{card.name}</p>
                      <p className="text-[9px] text-purple-300 text-center uppercase tracking-wider">{card.arcana}</p>
                    </div>
                  </div>
                ))}
                {tarotCards.length === 0 && (
                   <p className="text-gray-500 text-sm italic col-span-full py-4 text-center">No cards loaded in the database.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 ${GLASS_CARD}`}>
          <h3 className="text-lg font-semibold text-white mb-6">Most Drawn Cards</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={[
                { name: 'The Fool', count: 120 },
                { name: 'The Magician', count: 98 },
                { name: 'The High Priestess', count: 86 },
                { name: 'The Empress', count: 75 },
                { name: 'Death', count: 60 },
              ]} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f1423', border: '1px solid #1e3a8a', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`p-6 ${GLASS_CARD}`}>
          <h3 className="text-lg font-semibold text-white mb-6">Suit Distribution</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: 'Major Arcana', value: 45 },
                  { name: 'Cups', value: 20 },
                  { name: 'Swords', value: 15 },
                  { name: 'Wands', value: 10 },
                  { name: 'Pentacles', value: 10 },
                ]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                  {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f1423', border: '1px solid #1e3a8a', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Engine Insights</h2>
        <p className="text-sm text-gray-400 mt-1">Review AI synthesis performance, latency, and user feedback.</p>
      </div>
      
      {/* Top Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 ${GLASS_CARD} flex flex-col items-center justify-center text-center`}>
          <BrainCircuit size={40} className="text-purple-500 mb-3" />
          <h3 className="text-lg font-bold text-white">Gemini Pro API</h3>
          <p className="text-green-400 text-sm font-semibold flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Online & Active</p>
        </div>
        <div className={`p-6 ${GLASS_CARD} flex flex-col items-center justify-center text-center`}>
          <h4 className="text-gray-400 text-sm font-medium mb-1">Avg Generation Time</h4>
          <p className="text-3xl font-bold text-white">1.8s</p>
          <p className="text-xs text-green-400 mt-1">-0.2s from yesterday</p>
        </div>
        <div className={`p-6 ${GLASS_CARD} flex flex-col items-center justify-center text-center`}>
          <h4 className="text-gray-400 text-sm font-medium mb-1">Success Rate</h4>
          <p className="text-3xl font-bold text-white">99.8%</p>
          <p className="text-xs text-gray-500 mt-1">Over last 1,000 requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Time Chart */}
        <div className={`p-6 ${GLASS_CARD} lg:col-span-2`}>
          <h3 className="text-lg font-semibold text-white mb-6">Insight Generation Latency (ms)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { time: '10:00', latency: 1200 },
                { time: '10:05', latency: 1350 },
                { time: '10:10', latency: 1100 },
                { time: '10:15', latency: 1800 },
                { time: '10:20', latency: 1250 },
                { time: '10:25', latency: 1400 },
                { time: '10:30', latency: 1150 },
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f1423', border: '1px solid #1e3a8a', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="latency" stroke="#ec4899" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Ratings Pie */}
        <div className={`p-6 ${GLASS_CARD}`}>
          <h3 className="text-lg font-semibold text-white mb-6">User Accuracy Ratings</h3>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: 'Highly Accurate', value: 65 },
                  { name: 'Accurate', value: 25 },
                  { name: 'Neutral', value: 7 },
                  { name: 'Inaccurate', value: 3 },
                ]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f1423', border: '1px solid #1e3a8a', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-white">4.8</span>
              <span className="text-xs text-gray-500">Avg / 5.0</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-400">
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#10b981]"></div>Highly Acc.</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>Accurate</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>Neutral</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>Inaccurate</div>
          </div>
        </div>
      </div>

      {/* Top Keywords */}
      <div className={`p-6 ${GLASS_CARD}`}>
        <h3 className="text-lg font-semibold text-white mb-4">Top Generated Keywords in Insights</h3>
        <div className="flex flex-wrap gap-2">
          {['Transformation', 'Intuition', 'Balance', 'Obstacle', 'Prosperity', 'Journey', 'Emotional depth', 'Clarity', 'Warning', 'New beginnings'].map((word, i) => (
             <span key={i} className="px-3 py-1.5 bg-blue-900/20 text-blue-300 border border-blue-500/30 rounded-full text-sm">
               {word}
             </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTracking = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Live User Tracking</h2>
        <p className="text-sm text-gray-400 mt-1">Real-time session monitoring.</p>
      </div>
      <div className={`${GLASS_CARD} overflow-hidden`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-blue-900/30 bg-blue-900/10 text-xs uppercase text-gray-400">
              <th className="p-4 pl-6">User</th>
              <th className="p-4">Current Page</th>
              <th className="p-4">Session Time</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/10">
            {[1,2,3].map(i => (
              <tr key={i} className="hover:bg-white/5">
                <td className="p-4 pl-6 text-sm text-gray-200">user{i}@example.com</td>
                <td className="p-4 text-sm text-blue-400 font-mono">/palm-reading</td>
                <td className="p-4 text-sm text-gray-500">12m 34s</td>
                <td className="p-4 text-sm"><span className="text-green-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Report Generation Logs</h2>
        <p className="text-sm text-gray-400 mt-1">History of all PDF reports generated.</p>
      </div>
      <div className={`${GLASS_CARD} overflow-hidden`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-blue-900/30 bg-blue-900/10 text-xs uppercase text-gray-400">
              <th className="p-4 pl-6">Report ID</th>
              <th className="p-4">Type</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/10">
             <tr className="hover:bg-white/5">
                <td className="p-4 pl-6 text-sm text-gray-400 font-mono">REP-99283</td>
                <td className="p-4 text-sm text-gray-200">Combined AI</td>
                <td className="p-4 text-sm text-gray-500">Today, 10:42 AM</td>
                <td className="p-4 text-sm"><span className="text-green-400">Success</span></td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Activity className="text-green-500" /> System Control & Telemetry</h2>
          <p className="text-sm text-green-500/70 mt-1 font-mono">Live tracking of core infrastructure and service nodes.</p>
        </div>
      </div>
      
      {/* Node Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'Node 01: Auth & API', status: 'OK', load: '14%', temp: '42°C' },
          { name: 'Node 02: Palm CV Engine', status: 'OK', load: '68%', temp: '71°C' },
          { name: 'Node 03: LLM Integration', status: 'OK', load: '31%', temp: '55°C' },
        ].map((node, i) => (
          <div key={i} className="bg-black border border-green-900/50 p-4 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 text-xs font-mono text-green-500">{node.status}</div>
            <h4 className="text-green-500 font-mono text-sm mb-2">{node.name}</h4>
            <div className="flex gap-4 text-xs font-mono text-green-500/70">
              <p>LOAD: {node.load}</p>
              <p>TEMP: {node.temp}</p>
            </div>
            {/* Scanline effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-green-500/5 to-transparent -translate-y-full group-hover:animate-[scanline_2s_linear_infinite] pointer-events-none"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Charts */}
        <div className="space-y-6">
          <div className="bg-black border border-green-900/50 p-4 rounded-lg">
            <h3 className="text-green-500 text-xs font-mono uppercase tracking-wider mb-4 border-b border-green-900/50 pb-2">CPU Allocation</h3>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { t: '10s', val: 40 }, { t: '8s', val: 65 }, { t: '6s', val: 45 }, { t: '4s', val: 80 }, { t: '2s', val: 55 }, { t: '0s', val: 68 }
                ]}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#064e3b" vertical={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Area type="step" dataKey="val" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={1} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-black border border-green-900/50 p-4 rounded-lg">
            <h3 className="text-green-500 text-xs font-mono uppercase tracking-wider mb-4 border-b border-green-900/50 pb-2">Memory Paging (GB)</h3>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { t: '10s', val: 12.1 }, { t: '8s', val: 12.3 }, { t: '6s', val: 12.2 }, { t: '4s', val: 14.5 }, { t: '2s', val: 14.2 }, { t: '0s', val: 14.4 }
                ]}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#064e3b" vertical={false} />
                  <YAxis hide domain={[0, 32]} />
                  <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={1} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Terminal Log */}
        <div className="bg-[#050505] border border-gray-800 rounded-lg p-4 font-mono text-xs overflow-hidden flex flex-col">
          <div className="flex justify-between border-b border-gray-800 pb-2 mb-4">
            <span className="text-gray-500">root@server:~# tail -f /var/log/syslog</span>
            <span className="flex items-center gap-2 text-green-500"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar text-green-400/80 space-y-1">
            <p>[10:42:01] INFO : System boot sequence initiated.</p>
            <p>[10:42:02] INFO : Checking mounted volumes... OK.</p>
            <p>[10:42:05] WARN : High latency detected on port 8080.</p>
            <p>[10:42:06] INFO : Re-routing traffic to Node 02.</p>
            <p className="text-blue-400">[10:42:15] DB : Connection pool refreshed. 42 active.</p>
            <p>[10:42:30] INFO : Request from IP 192.168.1.5 - Auth token validated.</p>
            <p>[10:42:31] INFO : Initiating Palm Analysis Pipeline.</p>
            <p className="text-yellow-400">[10:42:35] CV_WARN : Confidence score marginal (74%). Proceeding.</p>
            <p>[10:42:38] INFO : Palm Analysis Pipeline completed successfully.</p>
            <p>[10:43:00] INFO : Garbage collection triggered.</p>
            <p className="text-red-400">[10:44:12] ERR : Timeout waiting for LLM response. Retrying...</p>
            <p>[10:44:14] INFO : Retry successful. Insight generated.</p>
            <p className="mt-4 text-green-500 animate-pulse">_</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="text-gray-400" /> System Settings</h2>
          <p className="text-sm text-gray-400 mt-1">Configure global platform parameters and security.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Core Settings */}
        <div className={`p-6 ${GLASS_CARD}`}>
          <h3 className="text-lg font-semibold text-white mb-6 border-b border-blue-900/30 pb-2">Platform Access</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-blue-900/30 rounded-lg bg-blue-900/10 hover:bg-blue-900/20 transition">
              <div>
                <h4 className="font-bold text-gray-200">Enable Registrations</h4>
                <p className="text-xs text-gray-500">Allow new users to create accounts.</p>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(37,99,235,0.5)]"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
            </div>
            <div className="flex items-center justify-between p-4 border border-blue-900/30 rounded-lg bg-blue-900/10 hover:bg-blue-900/20 transition">
              <div>
                <h4 className="font-bold text-gray-200">Maintenance Mode</h4>
                <p className="text-xs text-gray-500">Disable platform access for updates. Admins bypass this.</p>
              </div>
              <div className="w-12 h-6 bg-gray-700 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full"></div></div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className={`p-6 ${GLASS_CARD}`}>
          <h3 className="text-lg font-semibold text-white mb-6 border-b border-blue-900/30 pb-2">Security Configurations</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-blue-900/30 rounded-lg bg-blue-900/10">
              <div>
                <h4 className="font-bold text-gray-200">Enforce 2FA</h4>
                <p className="text-xs text-gray-500">Require two-factor authentication for Admin roles.</p>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(37,99,235,0.5)]"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
            </div>
            <div className="flex flex-col gap-2 p-4 border border-blue-900/30 rounded-lg bg-blue-900/10">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-200">Session Timeout</h4>
                <span className="text-xs font-mono text-blue-400">60 Minutes</span>
              </div>
              <input type="range" min="15" max="120" defaultValue="60" className="w-full accent-blue-500" />
            </div>
          </div>
        </div>

        {/* AI Engine Settings */}
        <div className={`p-6 ${GLASS_CARD} lg:col-span-2`}>
          <h3 className="text-lg font-semibold text-white mb-6 border-b border-purple-900/30 pb-2 flex items-center gap-2"><BrainCircuit className="text-purple-500" size={20}/> AI Engine Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-300 block mb-2">Synthesis Model Provider</label>
                <select className="w-full bg-black/50 border border-purple-900/50 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-purple-500">
                  <option>Google Gemini Pro (Active)</option>
                  <option>OpenAI GPT-4o (Backup)</option>
                  <option>Anthropic Claude 3 (Disabled)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-300 block mb-2">Palm Detection Confidence Threshold</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="50" max="99" defaultValue="85" className="flex-1 accent-purple-500" />
                  <span className="text-xs font-mono text-purple-400 bg-purple-900/20 px-2 py-1 rounded">85%</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Readings below this confidence score will be flagged for review.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-red-900/30 rounded-lg bg-red-900/5">
                <h4 className="font-bold text-red-400 flex items-center gap-2 mb-2"><AlertTriangle size={16} /> Danger Zone</h4>
                <p className="text-xs text-gray-500 mb-4">Actions here are irreversible and affect all system users.</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded text-xs font-bold transition">Clear AI Cache</button>
                  <button className="flex-1 bg-red-900/20 border border-red-900/50 hover:bg-red-900/50 text-red-400 px-3 py-2 rounded text-xs font-bold transition">Purge User Data</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <AdminLayout>
      {(activeTab) => {
        if (loading) {
          return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
        }
        
        switch (activeTab) {
          case 'dashboard': return renderDashboard();
          case 'users': return renderUsers();
          case 'overrides': return renderOverrides();
          
          case 'palm': return renderPalm();
          case 'tarot': return renderTarot();
          case 'insights': return renderInsights();
          case 'tracking': return renderTracking();
          case 'reports': return renderReports();
          case 'monitoring': return renderMonitoring();
          case 'settings': return renderSettings();
          
          default: return renderDashboard();
        }
      }}
    </AdminLayout>
  );
};

// Reusable KPI Component
const KPICard = ({ title, value, icon: Icon, color, trend, isLive }) => (
  <TiltWrapper>
    <div className={`${GLASS_CARD} p-5 relative overflow-hidden group h-full`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-white/0 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg bg-gray-900 border border-gray-800 ${color}`}>
          <Icon size={20} />
        </div>
        {trend && <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">{trend}</span>}
        {isLive && <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 uppercase tracking-wider bg-red-400/10 px-2 py-1 rounded"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> Live</span>}
      </div>
      <div>
        <h4 className="text-gray-400 text-sm font-medium mb-1">{title}</h4>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  </TiltWrapper>
);

const TiltWrapper = ({ children, className }) => (
  <motion.div
    whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2, zIndex: 10 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`perspective-1000 transform-style-3d ${className || ''}`}
    style={{ transformStyle: 'preserve-3d' }}
  >
    {children}
  </motion.div>
);

export default AdminDashboard;
