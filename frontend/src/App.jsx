import React, { useState, useEffect } from 'react';
import AuraReveal from './components/AuraReveal'; 

// --- STYLES ---
const cardStyle = {
  border: '1px solid rgba(168, 85, 247, 0.4)', 
  borderRadius: '16px',
  padding: '30px',
  width: '260px',
  cursor: 'pointer',
  background: 'rgba(30, 27, 46, 0.7)', 
  backdropFilter: 'blur(10px)', 
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  color: '#f3e8ff', 
  transition: 'all 0.3s ease',
  textAlign: 'center'
};
const btnStyle = { padding: '10px 20px', background: '#333', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '5px', marginBottom: '20px' };
const inputStyle = { padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' };

// --- UNIVERSAL ARCHIVE FUNCTION ---
const saveToArchive = (username, type, sessionId, history) => {
  if (!history || history.length === 0) return; // Don't save empty sessions
  
  const key = `oracle_archive_${username}`;
  let archive = JSON.parse(localStorage.getItem(key)) || [];
  
  // Look for the first AI response to use as a preview snippet
  const aiMessage = history.find(m => m.role === 'assistant')?.content || "";
  const preview = aiMessage.substring(0, 60) + (aiMessage.length > 60 ? "..." : "Reading started...");

  const sessionData = {
    sessionId,
    type,
    date: new Date().toLocaleString(),
    preview,
    history
  };

  // Check if this session already exists in the array
  const existingIndex = archive.findIndex(s => s.sessionId === sessionId);
  if (existingIndex >= 0) {
    archive[existingIndex] = sessionData; // Update existing chat
  } else {
    archive.unshift(sessionData); // Add new chat to the very top
  }
  
  localStorage.setItem(key, JSON.stringify(archive));
};

// --- AUTHENTICATION COMPONENT ---
const AuthScreen = ({ onLogin }) => {
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!contact) return setError("Please enter an email or phone number.");
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8001/api/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setOtpSent(true); 
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return setError("Please enter the 6-digit code.");
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8001/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ ...cardStyle, width: '350px' }}>
        <h2 style={{ marginTop: 0 }}>Enter the Portal</h2>
        {!otpSent ? (
          <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <p style={{ fontSize: '14px', color: '#ccc', margin: 0 }}>Enter your Email or Phone Number to receive a secure code.</p>
            <input placeholder="Email or Phone..." value={contact} onChange={e => setContact(e.target.value)} style={inputStyle} />
            {error && <p style={{ color: '#ff6b6b', margin: 0, fontSize: '14px' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{...btnStyle, background: '#a855f7', width: '100%', margin: 0}}>
              {loading ? "Summoning Code..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <p style={{ fontSize: '14px', color: '#ccc', margin: 0 }}>A code has been sent to your terminal. Enter it below.</p>
            <input placeholder="6-Digit Code" value={otp} onChange={e => setOtp(e.target.value)} style={{ ...inputStyle, textAlign: 'center', letterSpacing: '5px', fontSize: '20px' }} maxLength="6" />
            {error && <p style={{ color: '#ff6b6b', margin: 0, fontSize: '14px' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{...btnStyle, background: '#10b981', width: '100%', margin: 0}}>
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <p onClick={() => { setOtpSent(false); setOtp(''); setError(''); }} style={{ cursor: 'pointer', color: '#d8b4fe', fontSize: '12px', marginTop: '10px', textDecoration: 'underline' }}>
              ← Use a different contact
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

// --- SHARED CHAT COMPONENT ---
const ChatBox = ({ history, setHistory, isLoading }) => {
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    const currentHistory = [...history, { role: 'user', content: input }];
    setHistory(currentHistory);
    setInput('');
    try {
      const res = await fetch("http://localhost:8001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: currentHistory })
      });
      const data = await res.json();
      setHistory(data.history);
    } catch (e) { console.error("Chat error:", e); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '15px', border: '1px solid #444', borderRadius: '8px', background: '#1e1e2f', color: '#fff' }}>
        {history.filter(h => h.role !== 'system').map((msg, i) => (
          <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '10px 0' }}>
            <span style={{ padding: '10px 15px', borderRadius: '15px', display: 'inline-block', maxWidth: '80%', background: msg.role === 'user' ? '#6b4c9a' : '#2d2d44', whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </span>
          </div>
        ))}
        {isLoading && <p style={{ color: '#aaa', fontStyle: 'italic' }}>The spirits are typing...</p>}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <input style={{ flexGrow: 1, padding: '10px', borderRadius: '5px' }} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask the oracle..." />
        <button onClick={sendMessage} style={{ padding: '10px 20px', cursor: 'pointer', background: '#6b4c9a', color: 'white', border: 'none', borderRadius: '5px' }}>Send</button>
      </div>
    </div>
  );
};

// --- PALMISTRY COMPONENT ---
const Palmistry = ({ goBack, user }) => {
  const [imgData, setImgData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(Date.now()); 

  useEffect(() => {
    saveToArchive(user.username, 'Palmistry', sessionId, history);
  }, [history, user.username, sessionId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://localhost:8001/api/palm/analyze", { method: "POST", body: formData });
      const data = await res.json();
      setImgData(`data:image/jpeg;base64,${data.image_base64}`);
      setHistory(data.history);
    } catch (err) { alert("Error analyzing palm."); }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={goBack} style={btnStyle}>← Back to Portal</button>
      <h2>✋ Master Palm Reader</h2>
      {!imgData ? (
        <div>
          <p>Upload a clear photo of your inner palm.</p>
          <input type="file" accept="image/*" onChange={handleUpload} />
          {loading && <p>Analyzing lines...</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}><img src={imgData} alt="Annotated Palm" style={{ width: '100%', borderRadius: '10px' }} /></div>
          <div style={{ flex: '2', minWidth: '300px', minHeight: '500px' }}><ChatBox history={history} setHistory={setHistory} isLoading={loading} /></div>
        </div>
      )}
    </div>
  );
};

// --- TAROT COMPONENT ---
const Tarot = ({ goBack, user }) => {
  const [question, setQuestion] = useState('');
  const [cards, setCards] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [chatActive, setChatActive] = useState(false);

  useEffect(() => {
    if (sessionId && history.length > 0) {
      saveToArchive(user.username, 'Tarot', sessionId, history);
    }
  }, [history, user.username, sessionId]);

  const drawCard = async () => {
    if (!question) return alert("Please enter your question.");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8001/api/tarot/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: user.username, user_question: question, session_id: sessionId })
      });
      const data = await res.json();
      setCards(prev => [...prev, data]);
      setHistory(data.history);
      if (!sessionId) setSessionId(data.session_id);
    } catch (err) { alert("Error drawing card."); }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '85vh' }}>
      <div style={{ flexShrink: 0, marginBottom: '20px' }}>
        <button onClick={goBack} style={btnStyle}>← Back to Portal</button>
        <h2 style={{ marginTop: 0 }}>🃏 AI Tarot Reader</h2>
      </div>
      
      {cards.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
          <input placeholder="What is your question?" value={question} onChange={e => setQuestion(e.target.value)} style={inputStyle} />
          <button onClick={drawCard} disabled={loading} style={btnStyle}>{loading ? "Shuffling Deck..." : "Draw a Card"}</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
          {!chatActive && <h3 style={{ textAlign: 'center', color: '#d8b4fe', margin: '0' }}>✨ Scratch the card's aura to reveal your reading... ✨</h3>}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'auto', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', minHeight: '310px', width: '100%', boxSizing: 'border-box' }}>
            {cards.map((card, index) => (
              <div key={index} style={{ marginLeft: index > 0 ? '-50px' : '0', zIndex: index, position: 'relative', flexShrink: 0, transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-15px)'; e.currentTarget.style.zIndex = 100; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.zIndex = index; }}>
                <AuraReveal base64Image={card.image_base64} cardName={card.card_name} onRevealComplete={() => { if (index === 0) setChatActive(true); }} />
              </div>
            ))}
          </div>
          <div style={{ opacity: chatActive ? 1 : 0, transition: 'opacity 1.5s ease', pointerEvents: chatActive ? 'auto' : 'none', display: 'flex', flexDirection: 'column', gap: '15px', flexGrow: 1 }}>
            <button onClick={drawCard} disabled={loading} style={{...btnStyle, background: '#a855f7', width: '100%', margin: '0', flexShrink: 0}}>{loading ? "Drawing..." : "Draw Another Card to Continue the Story"}</button>
            <div style={{ flexGrow: 1, minHeight: '400px' }}><ChatBox history={history} setHistory={setHistory} isLoading={loading} /></div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [mode, setMode] = useState('home');
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { username: localStorage.getItem("username"), role: localStorage.getItem("role") } : null;
  });

  const [archiveData, setArchiveData] = useState([]);
  const [viewingSession, setViewingSession] = useState(null); 

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setMode('home');
  };

  const handleOpenArchive = () => {
    const data = JSON.parse(localStorage.getItem(`oracle_archive_${user.username}`)) || [];
    setArchiveData(data);
    setMode('archive');
  };

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation(); 
    
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this mystical record?");
    if (!confirmDelete) return;

    const updatedArchive = archiveData.filter(s => s.sessionId !== sessionId);
    setArchiveData(updatedArchive);
    localStorage.setItem(`oracle_archive_${user.username}`, JSON.stringify(updatedArchive));
    
    if (viewingSession && viewingSession.sessionId === sessionId) {
      setViewingSession(null);
    }
  };

  const handleArchiveHistoryUpdate = (newHistory) => {
    const updatedSession = { ...viewingSession, history: newHistory };
    setViewingSession(updatedSession);
    
    const updatedArchive = archiveData.map(s => 
      s.sessionId === viewingSession.sessionId ? updatedSession : s
    );
    setArchiveData(updatedArchive);
    localStorage.setItem(`oracle_archive_${user.username}`, JSON.stringify(updatedArchive));
  };

  if (!user) {
    return (
      <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>✨ The Mystical Oracle ✨</h1>
        <AuthScreen onLogin={(data) => setUser({ username: data.username, role: data.role })} />
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
        <div>
          <span style={{ color: '#d8b4fe', fontWeight: 'bold' }}>Logged in as: {user.username} </span>
          <span style={{ fontSize: '12px', background: '#333', padding: '3px 8px', borderRadius: '12px', marginLeft: '10px' }}>{user.role.toUpperCase()}</span>
        </div>
        <button onClick={handleLogout} style={{ ...btnStyle, margin: 0, padding: '5px 15px', background: 'transparent', border: '1px solid #d8b4fe', color: '#d8b4fe' }}>Disconnect</button>
      </div>

      {mode === 'home' && (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <h1>✨ The Mystical Oracle Portal ✨</h1>
          <p>Choose your path of divination.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '40px', flexWrap: 'wrap' }}>
            <div onClick={() => setMode('palm')} style={cardStyle}>
              <h2 style={{fontSize:'40px', margin:'0'}}>✋</h2>
              <h3>Palmistry</h3>
              <p>Scan your palm to reveal your life path.</p>
            </div>
            <div onClick={() => setMode('tarot')} style={cardStyle}>
              <h2 style={{fontSize:'40px', margin:'0'}}>🃏</h2>
              <h3>Tarot Reading</h3>
              <p>Ask a question and draw a card from the deck.</p>
            </div>
          </div>

          <button 
            onClick={handleOpenArchive} 
            style={{ ...btnStyle, background: '#a855f7', marginTop: '40px', padding: '15px 30px', fontSize: '16px' }}
          >
            📜 View Past Readings & Chats
          </button>
        </div>
      )}

      {mode === 'archive' && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '75vh' }}>
          
          {!viewingSession ? (
            <div>
              <button onClick={() => setMode('home')} style={btnStyle}>← Back to Portal</button>
              <h2>📜 Your Mystical Archive</h2>
              
              {archiveData.length === 0 ? (
                <p style={{ color: '#aaa' }}>You have no past readings yet. Consult the oracle to begin your journey.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {archiveData.map((session) => (
                    <div 
                      key={session.sessionId} 
                      onClick={() => setViewingSession(session)}
                      style={{ ...cardStyle, width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div style={{ flexGrow: 1, paddingRight: '15px' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: session.type === 'Tarot' ? '#a855f7' : '#10b981' }}>
                          {session.type === 'Tarot' ? '🃏 Tarot Session' : '✋ Palmistry Session'}
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#ccc', lineHeight: '1.4' }}>{session.preview}</p>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', minWidth: '130px' }}>
                        <span style={{ fontSize: '12px', color: '#888' }}>{session.date}</span>
                        <button 
                          onClick={(e) => handleDeleteSession(e, session.sessionId)}
                          style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ff8a8a', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' }}
                          onMouseOver={(e) => e.target.style.background = '#ef4444'}
                          onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                        >
                          Delete Record
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <h2 style={{ margin: 0 }}>
                    {viewingSession.type === 'Tarot' ? '🃏 Continuing Tarot Reading' : '✋ Continuing Palmistry'}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#aaa', marginTop: '5px', marginBottom: '15px' }}>
                    Session from: {viewingSession.date}
                  </p>
                </div>
                <button onClick={() => setViewingSession(null)} style={{ ...btnStyle, margin: 0, background: '#444' }}>← Back to Archive</button>
              </div>
              
              <div style={{ flexGrow: 1, minHeight: '500px' }}>
                <ChatBox 
                  history={viewingSession.history} 
                  setHistory={handleArchiveHistoryUpdate} 
                  isLoading={false} 
                />
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'palm' && <Palmistry goBack={() => setMode('home')} user={user} />}
      {mode === 'tarot' && <Tarot goBack={() => setMode('home')} user={user} />}
    </div>
  ); 
}
