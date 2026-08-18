import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Hand, Layers, BarChart3, FileText, Database, Wand2, X, Send 
} from 'lucide-react';
import { UserProfile, SynthesisReadingReport } from './types';
import { Navbar } from './components/Navbar';
import { FullReadingStudio } from './components/FullReadingStudio';
import { PalmScannerModal } from './components/PalmScannerModal';
import { InteractiveTarotSpread } from './components/InteractiveTarotSpread';
import { ReportArchive } from './components/ReportArchive';
import { ReportViewerModal } from './components/ReportViewerModal';
import { UserProfileModal } from './components/UserProfileModal';

import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const DEFAULT_USER = (name: string, email: string): UserProfile => ({
  id: '',
  name,
  email,
  zodiacSign: 'Scorpio',
  role: 'user',
  spiritualGoals: ['Third Eye Awakening', 'Career Manifestation', 'Heart Chakra Healing'],
  createdAt: serverTimestamp(),
});

const AppInner: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'studio' | 'palm' | 'tarot' | 'reports'>('studio');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [reports, setReports] = useState<SynthesisReadingReport[]>([]);

  const [viewingReport, setViewingReport] = useState<SynthesisReadingReport | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Quick Oracle Chat Assistant Drawer
  const [isOracleOpen, setIsOracleOpen] = useState<boolean>(false);
  const [oracleQuestion, setOracleQuestion] = useState<string>('');
  const [oracleChat, setOracleChat] = useState<Array<{ role: 'user' | 'oracle'; text: string }>>([
    {
      role: 'oracle',
      text: 'Greetings, seeker of cosmic wisdom. Speak your query, or ask for guidance on your palm lines and tarot spread.',
    },
  ]);
  const [askingOracle, setAskingOracle] = useState<boolean>(false);

  // Fetch User Profile
  useEffect(() => {
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
      } else {
        const newUser = DEFAULT_USER(user.displayName || 'Seeker', user.email || '');
        const { id, ...userPayload } = newUser;
        setDoc(userDocRef, {
          ...userPayload,
          updatedAt: serverTimestamp(),
        }).catch((err) => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));
    return () => unsubscribe();
  }, [user]);

  // Fetch Reports
  useEffect(() => {
    const reportsRef = collection(db, 'users', user.uid, 'reports');
    const q = query(reportsRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SynthesisReadingReport));
      // Sort client side by date, since we don't have an index guaranteed yet.
      fetchedReports.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : Date.now());
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : Date.now());
        return timeB - timeA;
      });
      setReports(fetchedReports);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/reports`));
    return () => unsubscribe();
  }, [user]);

  const handleSaveProfile = async (updated: UserProfile) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        name: updated.name,
        zodiacSign: updated.zodiacSign,
        spiritualGoals: updated.spiritualGoals,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleSaveReport = async (newReport: SynthesisReadingReport) => {
    try {
      const reportRef = doc(collection(db, 'users', user.uid, 'reports'));
      
      // Strip large base64 image data URIs from palmData to avoid exceeding Firestore's 1MB document size limit
      const palmDataToSave = newReport.palmData ? {
        ...newReport.palmData,
        rawImageUrl: '',
        annotatedImageUrl: '',
        skeletonImageUrl: '',
        claheImageUrl: ''
      } : null;

      const { id, createdAt, palmData, ...restReport } = newReport;

      await setDoc(reportRef, {
        ...restReport,
        palmData: palmDataToSave,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/reports`);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'reports', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/reports/${id}`);
    }
  };

  const handleAskOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleQuestion.trim() || askingOracle || !userProfile) return;

    const userQ = oracleQuestion.trim();
    setOracleChat((prev) => [...prev, { role: 'user', text: userQ }]);
    setOracleQuestion('');
    setAskingOracle(true);

    try {
      const response = await fetch('/api/gemini/oracle-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQ,
          userProfile,
          recentReport: reports[0] || null,
        }),
      });

      if (!response.ok) throw new Error('Oracle API error');
      const data = await response.json();
      setOracleChat((prev) => [...prev, { role: 'oracle', text: data.answer }]);
    } catch (err) {
      setOracleChat((prev) => [
        ...prev,
        {
          role: 'oracle',
          text: `Trust the quiet knowing within your solar plexus. The cards suggest patient discernment and courageous alignment with your authentic truth.`,
        },
      ]);
    } finally {
      setAskingOracle(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center text-amber-200">
        <Sparkles className="w-8 h-8 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Mystical Background Atmospheric Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-amber-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[32rem] h-[32rem] bg-blue-900/15 rounded-full blur-3xl" />
      </div>

      {/* Main Global Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 space-y-8">
        
        {/* VIEW 1: FULL READING STUDIO (Master Wizard) */}
        {activeTab === 'studio' && (
          <FullReadingStudio
            userProfile={userProfile}
            onSaveReport={handleSaveReport}
          />
        )}

        {/* VIEW 2: STANDALONE PALM SCANNER */}
        {activeTab === 'palm' && (
          <div className="space-y-6">
            <PalmScannerModal
              onAnalysisComplete={() => {}}
            />
          </div>
        )}

        {/* VIEW 3: STANDALONE TAROT SANCTUM */}
        {activeTab === 'tarot' && (
          <div className="space-y-6">
            <InteractiveTarotSpread />
          </div>
        )}

        {/* VIEW 4: REPORT ARCHIVE */}
        {activeTab === 'reports' && (
          <ReportArchive
            reports={reports}
            onViewReport={(r) => setViewingReport(r)}
            onDeleteReport={handleDeleteReport}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#060812] py-6 z-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-cinzel font-bold text-amber-300">MYSTIQ</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={onLogout} className="hover:text-amber-400 transition-colors">Sign Out</button>
            <p className="font-mono text-[11px] text-slate-500">
              78 RWS Arcana • 5-Factor Spiritual Scoring
            </p>
          </div>
        </div>
      </footer>

      {/* FLOATING ORACLE ASSISTANT BUTTON */}
      <button
        id="floating-oracle-btn"
        onClick={() => setIsOracleOpen(!isOracleOpen)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-tr from-amber-600 via-purple-600 to-amber-500 text-white shadow-2xl gold-glow hover:scale-105 transition-transform flex items-center justify-center"
        title="Consult Mystiq Oracle"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
      </button>

      {/* ORACLE CHAT DRAWER */}
      {isOracleOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-full max-w-sm rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col h-96">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#171936] to-[#0f1124] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span className="font-cinzel text-sm font-bold text-amber-200">
                Mystiq Oracle
              </span>
            </div>
            <button
              onClick={() => setIsOracleOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {oracleChat.map((msg, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl ${
                  msg.role === 'oracle'
                    ? 'bg-[#181b3a] border border-amber-500/20 text-slate-200 mr-4'
                    : 'bg-amber-500/20 border border-amber-500/40 text-amber-100 ml-4 text-right'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {askingOracle && (
              <div className="text-[11px] text-amber-400/80 italic animate-pulse p-2">
                Consulting celestial knowledge graph...
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleAskOracle} className="p-2 border-t border-slate-800 flex gap-1.5 bg-[#0a0b16]">
            <input
              type="text"
              placeholder="Ask the oracle anything..."
              value={oracleQuestion}
              onChange={(e) => setOracleQuestion(e.target.value)}
              className="flex-1 bg-[#13152d] text-slate-200 px-3 py-1.5 rounded-xl text-xs border border-slate-700 focus:border-amber-400 outline-none"
            />
            <button
              type="submit"
              disabled={askingOracle}
              className="p-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* REPORT VIEWER MODAL (When viewing an archived report) */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-5xl my-8 relative">
            <button
              onClick={() => setViewingReport(null)}
              className="absolute -top-3 -right-3 z-50 text-slate-200 hover:text-white p-2 rounded-full bg-slate-800 border border-slate-700 shadow-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <ReportViewerModal
              report={viewingReport}
              onClose={() => setViewingReport(null)}
            />
          </div>
        </div>
      )}

      {/* USER PROFILE MODAL */}
      {isProfileOpen && (
        <UserProfileModal
          userProfile={userProfile}
          onSave={handleSaveProfile}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(console.error);
  };

  const handleLogout = () => {
    signOut(auth).catch(console.error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center text-amber-200">
        <Sparkles className="w-8 h-8 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center text-center p-4 space-y-6">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-amber-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-[32rem] h-[32rem] bg-blue-900/15 rounded-full blur-3xl" />
        </div>
        <div className="z-10 bg-white/5 backdrop-blur-xl p-10 rounded-3xl border-none shadow-[0_8px_32px_rgba(168,85,247,0.15)] max-w-md w-full relative">
          <Wand2 className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-bounce" />
          <h1 className="font-cinzel text-3xl font-bold text-amber-200 mb-2">Mystiq</h1>
          <p className="text-slate-400 mb-8 font-serif text-xl">Enter the realm of celestial knowledge.</p>
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold shadow-lg transition-all"
          >
            <span>Continue with Google</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return <AppInner user={user} onLogout={handleLogout} />;
};

export default App;
