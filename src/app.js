import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [serverUrl, setServerUrl] = useState('http://192.168.1.100:3000');
  const [botStatus, setBotStatus] = useState(null);
  const [stats, setStats] = useState({});
  const [mediaList, setMediaList] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState('');
  const [targetNumber, setTargetNumber] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const s = io(serverUrl, { transports: ['websocket', 'polling'] });
    
    s.on('connect', () => { setConnected(true); notify('Connected to bot!'); });
    s.on('disconnect', () => { setConnected(false); notify('Disconnected!', 'error'); });
    
    s.on('bot-status', (status) => { setBotStatus(status); });
    s.on('stats', (s) => { setStats(s); });
    
    s.on('view-once-captured', (data) => {
      setMediaList(prev => [data, ...prev]);
      notify('View-once captured from ' + data.from);
    });
    
    s.on('view-once-list', (list) => { setMediaList(list); });
    s.on('contacts-list', (list) => { setContacts(list); });
    
    s.on('cmd-result', (r) => {
      if (r.success) notify(r.msg);
      else notify('Error: ' + r.error, 'error');
    });
    
    s.on('new-message', (msg) => {
      setLogs(prev => [msg, ...prev].slice(0, 100));
    });
    
    setSocket(s);
    return () => s.close();
  }, [serverUrl]);

  const cmd = (action, params = {}) => {
    if (socket?.connected) socket.emit('dashboard-command', { action, params });
  };

  const s = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      color: '#e0e0e0',
      fontFamily: "'Segoe UI', monospace",
      padding: '20px'
    },
    header: {
      borderBottom: '2px solid #00ff88',
      paddingBottom: '15px',
      marginBottom: '20px'
    },
    title: {
      color: '#00ff88',
      fontSize: '2em',
      fontWeight: 'bold',
      margin: 0,
      textShadow: '0 0 20px rgba(0,255,136,0.3)'
    },
    subtitle: {
      color: '#666',
      fontSize: '0.85em',
      margin: '5px 0 0 0'
    },
    statusBar: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    statBox: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: '10px 15px',
      fontSize: '0.85em'
    },
    dot: (on) => ({
      display: 'inline-block',
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: on ? '#00ff88' : '#ff4444',
      marginRight: '8px',
      boxShadow: on ? '0 0 10px rgba(0,255,136,0.5)' : '0 0 10px rgba(255,68,68,0.5)'
    }),
    nav: {
      display: 'flex',
      gap: '5px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    navBtn: (active) => ({
      padding: '10px 20px',
      border: `1px solid ${active ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
      background: active ? 'rgba(0,255,136,0.1)' : 'transparent',
      color: active ? '#00ff88' : '#888',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '0.85em'
    }),
    card: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px'
    },
    cardTitle: {
      color: '#00ff88',
      fontSize: '1.1em',
      margin: '0 0 15px 0'
    },
    btn: {
      padding: '8px 16px',
      border: '1px solid #00ff88',
      background: 'rgba(0,255,136,0.1)',
      color: '#00ff88',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '0.85em'
    },
    btnRed: {
      padding: '8px 16px',
      border: '1px solid #ff4444',
      background: 'rgba(255,68,68,0.1)',
      color: '#ff4444',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '0.85em'
    },
    input: {
      padding: '8px 12px',
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#e0e0e0',
      borderRadius: '5px',
      fontSize: '0.85em',
      width: '100%',
      boxSizing: 'border-box',
      marginBottom: '10px'
    },
    textarea: {
      padding: '8px 12px',
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#e0e0e0',
      borderRadius: '5px',
      fontSize: '0.85em',
      width: '100%',
      minHeight: '80px',
      boxSizing: 'border-box',
      marginBottom: '10px',
      fontFamily: 'monospace'
    },
    notify: (type) => ({
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      background: type === 'success' ? '#00ff88' : '#ff4444',
      color: '#000',
      zIndex: 9999,
      fontWeight: 'bold',
      fontSize: '14px'
    })
  };

  return (
    <div style={s.container}>
      {notification && (
        <div style={s.notify(notification.type)}>{notification.msg}</div>
      )}

      <div style={s.header}>
        <h1 style={s.title}>ULTRA BOT</h1>
        <p style={s.subtitle}>Owner: +93795430668 | Dashboard v1.0</p>
      </div>

      <div style={s.statusBar}>
        <div style={s.statBox}>
          <span style={s.dot(connected)}></span>
          {connected ? 'Connected' : 'Disconnected'}
        </div>
        <div style={s.statBox}>Media: {stats.mediaCaptured || 0}</div>
        <div style={s.statBox}>Contacts: {stats.contactsHarvested || 0}</div>
        <div style={s.statBox}>Logs: {stats.messagesLogged || 0}</div>
        <div style={s.statBox}>Uptime: {Math.floor((stats.uptime || 0) / 60)}m</div>
      </div>

      {!connected && (
        <div style={s.card}>
          <h3 style={s.cardTitle}>Connect to Server</h3>
          <input
            style={s.input}
            value={serverUrl}
            onChange={e => setServerUrl(e.target.value)}
            placeholder="http://YOUR_ANDROID_IP:3000"
          />
          <button style={s.btn} onClick={() => window.location.reload()}>
            Reconnect
          </button>
          <p style={{ color: '#666', fontSize: '0.8em', marginTop: 10 }}>
            Find your Android IP: In Termux run <b>ifconfig</b> and look for wlan0 inet addr
          </p>
        </div>
      )}

      <div style={s.nav}>
        {['dashboard', 'media', 'contacts', 'messages', 'broadcast'].map(t => (
          <button
            key={t}
            style={s.navBtn(tab === t)}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {tab === 'dashboard' && (
        <div>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Bot Controls</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: 15 }}>
              <button style={s.btn} onClick={() => cmd('toggle-invisible', { value: true })}>
                Go Invisible
              </button>
              <button style={s.btn} onClick={() => cmd('toggle-invisible', { value: false })}>
                Go Visible
              </button>
              <button style={s.btn} onClick={() => cmd('harvest-contacts')}>
                Harvest Contacts
              </button>
              <button style={s.btn} onClick={() => cmd('get-view-once')}>
                Refresh Media
              </button>
              <button style={s.btn} onClick={() => cmd('set-auto-reply', { value: !botStatus?.autoReply })}>
                {botStatus?.autoReply ? 'Disable Auto-Reply' : 'Enable Auto-Reply'}
              </button>
            </div>
            <div style={{ fontSize: '0.85em', lineHeight: 1.8 }}>
              <div>Status: {botStatus?.online ? 'Online' : 'Offline'}</div>
              <div>Invisible: {botStatus?.invisible ? 'YES' : 'NO'}</div>
              <div>Auto-Reply: {botStatus?.autoReply ? 'ON' : 'OFF'}</div>
              <div>Status Saver: {botStatus?.statusSaver ? 'ON' : 'OFF'}</div>
            </div>
          </div>

          <div style={s.card}>
            <h3 style={s.cardTitle}>Send Message</h3>
            <input
              style={s.input}
              value={targetNumber}
              onChange={e => setTargetNumber(e.target.value)}
              placeholder="Number (e.g., 93795430668)"
            />
            <textarea
              style={s.textarea}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Message text..."
            />
            <button style={s.btn} onClick={() => {
              if (targetNumber && message) {
                const num = targetNumber.includes('@c.us') ? targetNumber : targetNumber + '@c.us';
                cmd('send-message', { number: num, message });
                setMessage('');
              }
            }}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* MEDIA TAB */}
      {tab === 'media' && (
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <h3 style={{ ...s.cardTitle, margin: 0 }}>View-Once Media ({mediaList.length})</h3>
            <button style={s.btn} onClick={() => cmd('get-view-once')}>Refresh</button>
          </div>
          {mediaList.length === 0 ? (
            <p style={{ color: '#666' }}>No view-once media captured yet</p>
          ) : (
            mediaList.map((m, i) => (
              <div key={i} style={{
                padding: '12px',
                marginBottom: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                fontSize: '0.85em'
              }}>
                <div>From: {m.from}</div>
                <div>Type: {m.mimetype}</div>
                <div>Time: {new Date(m.timestamp).toLocaleString()}</div>
                <div style={{ marginTop: '8px' }}>
                  <button style={{ ...s.btn, fontSize: '0.8em', padding: '4px 10px' }} onClick={() => {
                    const target = prompt('Forward to number:');
                    if (target) {
                      const num = target.includes('@c.us') ? target : target + '@c.us';
                      cmd('forward-media', { key: m.key, target: num });
                    }
                  }}>Forward</button>
                  <span style={{ color: '#444', marginLeft: '10px', fontSize: '0.8em' }}>
                    Key: {m.key?.substring(0, 25)}...
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CONTACTS TAB */}
      {tab === 'contacts' && (
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <h3 style={{ ...s.cardTitle, margin: 0 }}>Contacts ({contacts.length})</h3>
            <button style={s.btn} onClick={() => cmd('harvest-contacts')}>Harvest Now</button>
          </div>
          <div style={{ maxHeight: '500px', overflow: 'auto' }}>
            {contacts.map((c, i) => (
              <div key={i} style={{
                padding: '8px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.8em',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{c}</span>
                <button style={{ ...s.btn, fontSize: '0.75em', padding: '4px 8px' }} onClick={() => {
                  const msg = prompt('Enter message:');
                  if (msg) cmd('send-message', { number: c, message: msg });
                }}>Message</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MESSAGES TAB */}
      {tab === 'messages' && (
        <div style={s.card}>
          <h3 style={s.cardTitle}>Live Messages</h3>
          <div style={{ maxHeight: '600px', overflow: 'auto' }}>
            {logs.map((l, i) => (
              <div key={i} style={{
                padding: '6px 10px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.8em'
              }}>
                <span style={{ color: '#00ff88' }}>{l.from}</span>
                <span style={{ color: '#666' }}>  </span>
                <span>{(l.body || '').substring(0, 80)}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <p style={{ color: '#666' }}>No messages yet</p>
            )}
          </div>
        </div>
      )}

      {/* BROADCAST TAB */}
      {tab === 'broadcast' && (
        <div style={s.card}>
          <h3 style={s.cardTitle}>Broadcast Message</h3>
          <p style={{ fontSize: '0.8em', color: '#666', marginBottom: 15 }}>
            Send a message to ALL your WhatsApp contacts
          </p>
          <textarea
            style={{ ...s.textarea, minHeight: '120px' }}
            value={broadcastMsg}
            onChange={e => setBroadcastMsg(e.target.value)}
            placeholder="Type your broadcast message here..."
          />
          <button style={s.btnRed} onClick={() => {
            if (broadcastMsg && window.confirm('Send this message to ALL contacts?')) {
              cmd('broadcast', { message: broadcastMsg });
            }
          }}>
            BROADCAST TO ALL
          </button>
        </div>
      )}

      <div style={{
        textAlign: 'center',
        color: '#444',
        fontSize: '0.75em',
        marginTop: '40px',
        padding: '20px',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        Ultra Bot v1.0 | Owner: +93795430668
      </div>
    </div>
  );
}

export default App;
