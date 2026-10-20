import { useState } from 'react';
import { useAuth } from '../App';
import { api } from '../api';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const DEMOS = [
    { label:'Admin', email:'admin@sastha.com', password:'admin123', color:'#FF6B35' },
    { label:'Manager', email:'manager@sastha.com', password:'manager123', color:'#2563EB' },
    { label:'Supervisor', email:'supervisor@sastha.com', password:'super123', color:'#16A34A' },
    { label:'Client', email:'client@sastha.com', password:'client123', color:'#7C3AED' },
  ];

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.login(email, password);
      login(res.user, res.token);
    } catch(err) {
      setError(err.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const quickLogin = async (d) => {
    setEmail(d.email); setPassword(d.password);
    setLoading(true); setError('');
    try {
      const res = await api.login(d.email, d.password);
      login(res.user, res.token);
    } catch(err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:10 }}>
            <div style={{ width:44, height:44, background:'var(--bg)', borderRadius:14, boxShadow:'var(--s-out)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="ti ti-circles-relation" style={{ fontSize:22, color:'var(--accent)' }} />
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:20, fontWeight:800, color:'var(--text)', letterSpacing:-.5 }}>Sastha Appalam</div>
              <div style={{ fontSize:11, color:'var(--text3)', fontWeight:500 }}>ERP Management Suite</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background:'var(--bg)', borderRadius:'var(--r20)', boxShadow:'var(--s-card)', padding:28 }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text3)', marginBottom:6, textTransform:'uppercase', letterSpacing:.5 }}>Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="your@email.com" required
                style={{ width:'100%', background:'var(--bg)', border:'none', borderRadius:'var(--r8)', padding:'10px 14px', fontSize:13, color:'var(--text)', outline:'none', fontFamily:'inherit', boxShadow:'var(--s-in)' }} />
            </div>
            <div style={{ marginBottom:22 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5 }}>Password</label>
              </div>
              <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" required
                style={{ width:'100%', background:'var(--bg)', border:'none', borderRadius:'var(--r8)', padding:'10px 14px', fontSize:13, color:'var(--text)', outline:'none', fontFamily:'inherit', boxShadow:'var(--s-in)' }} />
            </div>
            {error && <div style={{ background:'var(--rM)', color:'var(--red)', borderRadius:'var(--r8)', padding:'10px 14px', fontSize:12.5, marginBottom:14, fontWeight:500 }}>⚠️ {error}</div>}
            <button type="submit" disabled={loading} style={{ width:'100%', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--r8)', padding:'12px 0', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'4px 4px 10px rgba(255,107,53,.4),-2px -2px 8px rgba(255,255,255,.8)', opacity: loading ? .7 : 1 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Quick Login */}
        <div style={{ marginTop:20 }}>
          <div style={{ textAlign:'center', fontSize:11.5, color:'var(--text3)', marginBottom:12, fontWeight:500 }}>Quick demo login</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
            {DEMOS.map(d => (
              <button key={d.label} onClick={() => quickLogin(d)} disabled={loading}
                style={{ background:'var(--bg)', border:'none', borderRadius:'var(--r12)', padding:'11px 14px', textAlign:'left', cursor:'pointer', boxShadow:'var(--s-sm)', transition:'all .15s', fontFamily:'inherit' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:26, height:26, borderRadius:'50%', background:d.color, color:'#fff', fontSize:10, fontWeight:700, display:'grid', placeItems:'center', flexShrink:0 }}>{d.label[0]}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{d.label}</div>
                    <div style={{ fontSize:10.5, color:'var(--text3)' }}>{d.email}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
