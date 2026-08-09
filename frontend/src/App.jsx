import React, { useState } from 'react';
// 1. IMPORT THE NEW COMPONENT HERE
import AuraReveal from './components/AuraReveal'; 

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
    } catch (e) {
      console.error("Chat error:", e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '500px', width: '100%' }}>
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
const Palmistry = ({ goBack }) => {
  const [imgData, setImgData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      alert("Error analyzing palm. Make sure the Python backend is running on port 8001!");
    }
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
          <div style={{ flex: '1', minWidth: '300px' }}>
            <img src={imgData} alt="Annotated Palm" style={{ width: '100%', borderRadius: '10px' }} />
          </div>
          <div style={{ flex: '2', minWidth: '300px' }}>
             <ChatBox history={history} setHistory={setHistory} isLoading={loading} />
          </div>
        </div>
      )}
    </div>
  );
};

// --- TAROT COMPONENT ---
// --- TAROT COMPONENT ---
const Tarot = ({ goBack }) => {
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  
  const [cards, setCards] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [chatActive, setChatActive] = useState(false);

  const drawCard = async () => {
    if (!name || !question) return alert("Please enter your name and question.");
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:8001/api/tarot/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_name: name, 
          user_question: question,
          session_id: sessionId
        })
      });
      const data = await res.json();
      
      setCards(prevCards => [...prevCards, data]);
      setHistory(data.history);
      if (!sessionId) setSessionId(data.session_id);
      
    } catch (err) {
      alert("Error drawing card. Make sure the Python backend is running on port 8001!");
    }
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
          <input placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          <input placeholder="What is your question?" value={question} onChange={e => setQuestion(e.target.value)} style={inputStyle} />
          <button onClick={drawCard} disabled={loading} style={btnStyle}>
            {loading ? "Shuffling Deck..." : "Draw a Card"}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
          
          {!chatActive && (
            <h3 style={{ textAlign: 'center', color: '#d8b4fe', margin: '0' }}>
               ✨ Scratch the card's aura to reveal your reading... ✨
            </h3>
          )}

          {/* THE CARD SPREAD (Responsive Flexbox Layout) */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', // Magic! Centers all cards dynamically in the box
            alignItems: 'center',
            overflowX: 'auto', 
            padding: '20px', 
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            minHeight: '310px', 
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {cards.map((card, index) => (
              <div 
                key={index} 
                style={{
                  // Negative margin creates the overlap, flex shrink prevents squishing
                  marginLeft: index > 0 ? '-50px' : '0',
                  zIndex: index, 
                  position: 'relative',
                  flexShrink: 0, 
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-15px)';
                  // Brings the hovered card to the absolute front!
                  e.currentTarget.style.zIndex = 100; 
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  // Puts it back into its normal stacking order
                  e.currentTarget.style.zIndex = index; 
                }}
              >
                <AuraReveal 
                  base64Image={card.image_base64} 
                  cardName={card.card_name}
                  onRevealComplete={() => {
                    if (index === 0) setChatActive(true); 
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* CHAT SECTION */}
          <div style={{ 
            opacity: chatActive ? 1 : 0, 
            transition: 'opacity 1.5s ease',
            pointerEvents: chatActive ? 'auto' : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            flexGrow: 1
          }}>
            <button 
               onClick={drawCard} 
               disabled={loading} 
               style={{...btnStyle, background: '#a855f7', width: '100%', margin: '0', flexShrink: 0}}
            >
               {loading ? "Drawing..." : "Draw Another Card to Continue the Story"}
            </button>
            
            <div style={{ flexGrow: 1, minHeight: '400px' }}>
              <ChatBox history={history} setHistory={setHistory} isLoading={loading} />
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [mode, setMode] = useState('home');

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      {mode === 'home' && (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h1>✨ The Mystical Oracle Portal ✨</h1>
          <p>Choose your path of divination.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '40px' }}>
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
        </div>
      )}

      {mode === 'palm' && <Palmistry goBack={() => setMode('home')} />}
      {mode === 'tarot' && <Tarot goBack={() => setMode('home')} />}
    </div>
  );
}

// --- BASIC STYLES ---
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
const inputStyle = { padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' };
