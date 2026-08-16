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

// --- COUNTRY CODES LIST ---
// --- COMPLETE GLOBAL COUNTRY CODES ---
const COUNTRY_CODES = [
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫' }, { code: '+355', country: 'Albania', flag: '🇦🇱' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' }, { code: '+376', country: 'Andorra', flag: '🇦🇩' },
  { code: '+244', country: 'Angola', flag: '🇦🇴' }, { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲' }, { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' }, { code: '+994', country: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' }, { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾' }, { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+501', country: 'Belize', flag: '🇧🇿' }, { code: '+229', country: 'Benin', flag: '🇧🇯' },
  { code: '+975', country: 'Bhutan', flag: '🇧🇹' }, { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+387', country: 'Bosnia & Herzegovina', flag: '🇧🇦' }, { code: '+267', country: 'Botswana', flag: '🇧🇼' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' }, { code: '+673', country: 'Brunei', flag: '🇧🇳' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬' }, { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' }, { code: '+855', country: 'Cambodia', flag: '🇰🇭' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲' }, { code: '+1', country: 'Canada / USA', flag: '🇨🇦/🇺🇸' },
  { code: '+238', country: 'Cape Verde', flag: '🇨🇻' }, { code: '+236', country: 'Central African Rep', flag: '🇨🇫' },
  { code: '+235', country: 'Chad', flag: '🇹🇩' }, { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+86', country: 'China', flag: '🇨🇳' }, { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲' }, { code: '+242', country: 'Congo', flag: '🇨🇬' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' }, { code: '+385', country: 'Croatia', flag: '🇭🇷' },
  { code: '+53', country: 'Cuba', flag: '🇨🇺' }, { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' }, { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯' }, { code: '+1', country: 'Dominican Republic', flag: '🇩🇴' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' }, { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' }, { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+291', country: 'Eritrea', flag: '🇪🇷' }, { code: '+372', country: 'Estonia', flag: '🇪🇪' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' }, { code: '+679', country: 'Fiji', flag: '🇫🇯' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' }, { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦' }, { code: '+220', country: 'Gambia', flag: '🇬🇲' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪' }, { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' }, { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' }, { code: '+224', country: 'Guinea', flag: '🇬🇳' },
  { code: '+592', country: 'Guyana', flag: '🇬🇾' }, { code: '+509', country: 'Haiti', flag: '🇭🇹' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳' }, { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' }, { code: '+354', country: 'Iceland', flag: '🇮🇸' },
  { code: '+91', country: 'India', flag: '🇮🇳' }, { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+98', country: 'Iran', flag: '🇮🇷' }, { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' }, { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' }, { code: '+225', country: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+1876', country: 'Jamaica', flag: '🇯🇲' }, { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' }, { code: '+7', country: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' }, { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬' }, { code: '+856', country: 'Laos', flag: '🇱🇦' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻' }, { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+218', country: 'Libya', flag: '🇱🇾' }, { code: '+423', country: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹' }, { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
  { code: '+853', country: 'Macau', flag: '🇲🇴' }, { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
  { code: '+265', country: 'Malawi', flag: '🇲🇼' }, { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+960', country: 'Maldives', flag: '🇲🇻' }, { code: '+223', country: 'Mali', flag: '🇲🇱' },
  { code: '+356', country: 'Malta', flag: '🇲🇹' }, { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+373', country: 'Moldova', flag: '🇲🇩' }, { code: '+377', country: 'Monaco', flag: '🇲🇨' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳' }, { code: '+382', country: 'Montenegro', flag: '🇲🇪' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' }, { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲' }, { code: '+264', country: 'Namibia', flag: '🇳🇦' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' }, { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' }, { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' }, { code: '+850', country: 'North Korea', flag: '🇰🇵' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' }, { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' }, { code: '+970', country: 'Palestine', flag: '🇵🇸' },
  { code: '+507', country: 'Panama', flag: '🇵🇦' }, { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' }, { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' }, { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' }, { code: '+40', country: 'Romania', flag: '🇷🇴' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' }, { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' }, { code: '+221', country: 'Senegal', flag: '🇸🇳' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸' }, { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰' }, { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴' }, { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' }, { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' }, { code: '+249', country: 'Sudan', flag: '🇸🇩' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' }, { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+963', country: 'Syria', flag: '🇸🇾' }, { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
  { code: '+992', country: 'Tajikistan', flag: '🇹🇯' }, { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' }, { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' }, { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+993', country: 'Turkmenistan', flag: '🇹🇲' }, { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦' }, { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' }, { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+998', country: 'Uzbekistan', flag: '🇺🇿' }, { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' }, { code: '+967', country: 'Yemen', flag: '🇾🇪' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲' }, { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' }
];
// Sort the countries alphabetically so the dropdown looks professional
COUNTRY_CODES.sort((a, b) => a.country.localeCompare(b.country));
// --- AUTHENTICATION COMPONENT ---
// --- AUTHENTICATION COMPONENT (UPDATED FOR ALERT OTP) ---

const AuthScreen = ({ onLogin }) => {
  // Modes: 'login', 'signup', 'forgot_request', 'forgot_verify'
  const [authMode, setAuthMode] = useState('login');

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Contact details
  const [contactType, setContactType] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Forgot password OTP states
  const [resetIdentifier, setResetIdentifier] = useState(''); // username or email/phone
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [targetUser, setTargetUser] = useState(null);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Helper: Get users database from localStorage
  const getUsersDB = () => JSON.parse(localStorage.getItem('oracle_registered_users')) || [];
  const saveUsersDB = (users) => localStorage.setItem('oracle_registered_users', JSON.stringify(users));

  // --- VALIDATION HELPERS ---
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  
  // Updated for international E.164 standards (7 to 15 digits)
  const isValidPhone = (val, code) => {
    const cleanDigits = val.replace(/\D/g, ''); // Strips out dashes/spaces
    return cleanDigits.length >= 7 && cleanDigits.length <= 15;
  };

  // --- HANDLE SIGNUP ---
  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      return setError('Username and password are required.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    let contactValue = '';
    if (contactType === 'email') {
      if (!isValidEmail(email)) {
        return setError('Please enter a valid, authentic email address (e.g. name@domain.com).');
      }
      contactValue = email.trim().toLowerCase();
    } else {
      if (!isValidPhone(phoneNumber, countryCode)) {
        return setError(`Please enter a valid ${countryCode} phone number.`);
      }
      contactValue = `${countryCode} ${phoneNumber.replace(/\D/g, '')}`;
    }

    const users = getUsersDB();
    const existing = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() || u.contact === contactValue
    );
    if (existing) {
      return setError('A user with this username or contact info already exists.');
    }

    const newUser = {
      username: username.trim(),
      password: password,
      contactType,
      contact: contactValue,
      role: 'Seeker',
    };

    users.push(newUser);
    saveUsersDB(users);

    setSuccessMsg('Account created successfully! Please sign in.');
    setAuthMode('login');
    setPassword('');
    setConfirmPassword('');
  };

  // --- HANDLE LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      return setError('Please enter both username and password.');
    }

    const users = getUsersDB();
    const found = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (!found) {
      return setError('Invalid username or secret cipher.');
    }

    // Success! Log the user in
    localStorage.setItem('token', 'simulated_token_' + Date.now());
    localStorage.setItem('username', found.username);
    localStorage.setItem('role', found.role || 'Seeker');
    onLogin(found);
  };

  // --- HANDLE FORGOT PASSWORD: STEP 1 (TRIGGER OTP ALERT) ---
  const handleRequestResetOTP = (e) => {
    e.preventDefault();
    setError('');

    if (!resetIdentifier.trim()) {
      return setError('Please enter your username, registered email, or phone.');
    }

    const users = getUsersDB();
    const found = users.find(
      u => u.username.toLowerCase() === resetIdentifier.trim().toLowerCase() || 
           u.contact.toLowerCase() === resetIdentifier.trim().toLowerCase()
    );

    if (!found) {
      return setError('No mystical account found with that identifier.');
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTargetUser(found);
    setAuthMode('forgot_verify');

    // Pop up the OTP in an alert box
    setTimeout(() => {
      alert(
        `✨ The Oracle has dispatched your verification code ✨\n\n` +
        `Target Account: ${found.username}\n` +
        `Security OTP: ${code}\n\n` +
        `Enter this 6-digit code to reset your secret cipher.`
      );
    }, 400);
  };

  // --- HANDLE FORGOT PASSWORD: STEP 2 (VERIFY & UPDATE PASSWORD) ---
  const handleVerifyAndReset = (e) => {
    e.preventDefault();
    setError('');

    if (otpInput.trim() !== generatedOtp) {
      return setError('The spirits reject this OTP. Please check the code.');
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      return setError('New password must be at least 6 characters long.');
    }

    const users = getUsersDB();
    const updatedUsers = users.map(u => {
      if (u.username === targetUser.username) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    saveUsersDB(updatedUsers);
    setSuccessMsg('Your cipher has been reset successfully! Please log in.');
    setAuthMode('login');
    setOtpInput('');
    setNewPassword('');
    setResetIdentifier('');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
      <div style={{ ...cardStyle, width: '380px', textAlign: 'left' }}>
        
        {/* TAB HEADERS: LOGIN / SIGNUP */}
        {authMode !== 'forgot_request' && authMode !== 'forgot_verify' && (
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(168, 85, 247, 0.3)', marginBottom: '20px' }}>
            <button
              onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                padding: '10px',
                color: authMode === 'login' ? '#d8b4fe' : '#777',
                borderBottom: authMode === 'login' ? '2px solid #a855f7' : 'none',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                padding: '10px',
                color: authMode === 'signup' ? '#d8b4fe' : '#777',
                borderBottom: authMode === 'signup' ? '2px solid #a855f7' : 'none',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              New Seeker (Sign Up)
            </button>
          </div>
        )}

        {/* FEEDBACK MESSAGES */}
        {error && <p style={{ color: '#ff6b6b', margin: '0 0 15px 0', fontSize: '13px' }}>⚠️ {error}</p>}
        {successMsg && <p style={{ color: '#10b981', margin: '0 0 15px 0', fontSize: '13px' }}>✨ {successMsg}</p>}

        {/* ================= VIEW 1: SIGN IN ================= */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Username</label>
              <input
                placeholder="Your Seeker name..."
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Secret Cipher (Password)</label>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                onClick={() => { setAuthMode('forgot_request'); setError(''); setSuccessMsg(''); }}
                style={{ fontSize: '12px', color: '#d8b4fe', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Forgot Password?
              </span>
            </div>

            <button type="submit" style={{ ...btnStyle, background: '#a855f7', width: '100%', margin: '5px 0 0 0' }}>
              Enter Portal
            </button>
          </form>
        )}

        {/* ================= VIEW 2: SIGN UP ================= */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Choose Username</label>
              <input
                placeholder="Seeker name..."
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* CONTACT SELECTION: EMAIL OR PHONE */}
            <div>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Authentication Method</label>
              <select
                value={contactType}
                onChange={e => { setContactType(e.target.value); setError(''); }}
                style={{ ...inputStyle, background: '#1e1b2e', color: 'white' }}
              >
                <option value="email">📧 Email Address</option>
                <option value="phone">📱 Mobile Phone</option>
              </select>
            </div>

            {/* IF EMAIL */}
            {contactType === 'email' ? (
              <div>
                <label style={{ fontSize: '12px', color: '#ccc' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. mystic@oracle.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
            ) : (
              /* IF PHONE: COUNTRY CODE + NUMBER */
              <div>
                <label style={{ fontSize: '12px', color: '#ccc' }}>Phone Number</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    style={{ ...inputStyle, width: '130px', background: '#1e1b2e', color: 'white', padding: '10px 5px' }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} ({c.country})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="Mobile number..."
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    style={{ ...inputStyle, flexGrow: 1 }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Create Password</label>
              <input
                type="password"
                placeholder="Min 6 characters..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter password..."
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button type="submit" style={{ ...btnStyle, background: '#10b981', width: '100%', margin: '10px 0 0 0' }}>
              Create Account
            </button>
          </form>
        )}

        {/* ================= VIEW 3: FORGOT PASSWORD (REQUEST OTP) ================= */}
        {authMode === 'forgot_request' && (
          <form onSubmit={handleRequestResetOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: 0, color: '#d8b4fe' }}>🔮 Recover Your Cipher</h3>
            <p style={{ fontSize: '13px', color: '#ccc', margin: 0 }}>
              Enter your username, registered email, or full phone number with country code.
            </p>

            <input
              placeholder="Username / Email / Phone..."
              value={resetIdentifier}
              onChange={e => setResetIdentifier(e.target.value)}
              style={inputStyle}
            />

            <button type="submit" style={{ ...btnStyle, background: '#a855f7', width: '100%', margin: 0 }}>
              Summon OTP
            </button>

            <p
              onClick={() => { setAuthMode('login'); setError(''); }}
              style={{ cursor: 'pointer', color: '#d8b4fe', fontSize: '12px', textAlign: 'center', margin: 0, textDecoration: 'underline' }}
            >
              ← Back to Sign In
            </p>
          </form>
        )}

        {/* ================= VIEW 4: FORGOT PASSWORD (VERIFY OTP & NEW PASSWORD) ================= */}
        {authMode === 'forgot_verify' && (
          <form onSubmit={handleVerifyAndReset} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: 0, color: '#10b981' }}>🔑 Set New Cipher</h3>
            <p style={{ fontSize: '13px', color: '#ccc', margin: 0 }}>
              An OTP has been revealed via popup. Enter it below to unlock your account.
            </p>

            <input
              placeholder="6-Digit OTP"
              value={otpInput}
              onChange={e => setOtpInput(e.target.value)}
              maxLength="6"
              style={{ ...inputStyle, textAlign: 'center', letterSpacing: '5px', fontSize: '18px' }}
            />

            <input
              type="password"
              placeholder="Enter New Password (min 6 chars)..."
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={inputStyle}
            />

            <button type="submit" style={{ ...btnStyle, background: '#10b981', width: '100%', margin: 0 }}>
              Confirm New Password
            </button>

            <p
              onClick={() => { setAuthMode('forgot_request'); setError(''); }}
              style={{ cursor: 'pointer', color: '#d8b4fe', fontSize: '12px', textAlign: 'center', margin: 0, textDecoration: 'underline' }}
            >
              ← Request a new code
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
    formData.append("user_name", user.username);
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
