import { useState, useEffect } from 'react';

const s = {
  card: { background:'var(--bg)', borderRadius:'var(--r20)', boxShadow:'var(--s-card)', padding:'18px 20px' },
  cardInset: { background:'var(--bg)', borderRadius:'var(--r12)', boxShadow:'var(--s-in)', padding:'14px 16px' },
  kpi: { background:'var(--bg)', borderRadius:'var(--r20)', boxShadow:'var(--s-card)', padding:'16px 18px' },
  btn: { display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:'var(--r8)', fontSize:12.5, fontWeight:600, cursor:'pointer', border:'none', fontFamily:'inherit', boxShadow:'var(--s-sm)', transition:'all .15s' },
  btnSm: { padding:'5px 12px', fontSize:11.5 },
  input: { width:'100%', background:'var(--bg)', border:'none', borderRadius:'var(--r8)', padding:'9px 13px', fontSize:13, color:'var(--text)', outline:'none', fontFamily:'inherit', boxShadow:'var(--s-in)' },
  label: { display:'block', fontSize:11, fontWeight:600, color:'var(--text3)', marginBottom:5, textTransform:'uppercase', letterSpacing:.5 },
  tag: { display:'inline-flex', alignItems:'center', gap:3, padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:600, whiteSpace:'nowrap', boxShadow:'var(--s-sm)' },
  row: { display:'flex', alignItems:'center', gap:11, padding:'10px 0', borderBottom:'1px solid var(--bg2)' },
  skRow: { display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid var(--bg2)' },
};

export const Card = ({ children, style }) => <div style={{ ...s.card, ...style }}>{children}</div>;
export const CardInset = ({ children, style }) => <div style={{ ...s.cardInset, ...style }}>{children}</div>;

export const KPI = ({ label, value, sub, tag, tagType, accent, onClick }) => (
  <div style={{ ...s.kpi, borderTop: accent ? '2px solid var(--accent)' : '2px solid transparent', cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
    <div style={{ fontSize:10.5, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>{label}</div>
    <div style={{ fontSize:24, fontWeight:800, color: accent ? 'var(--accent)' : 'var(--text)', letterSpacing:-.5, lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:'var(--text3)', marginTop:5 }}>{sub}</div>}
    {tag && <Tag label={tag} type={tagType || 'gray'} style={{ marginTop:7 }} />}
  </div>
);

export const Tag = ({ label, type = 'gray', style }) => {
  const map = {
    green: { background:'var(--gM)', color:'var(--green)' },
    red: { background:'var(--rM)', color:'var(--red)' },
    amber: { background:'var(--amM)', color:'var(--amber)' },
    blue: { background:'var(--bM)', color:'var(--blue)' },
    accent: { background:'var(--aM)', color:'var(--accent)' },
    gray: { background:'var(--bg2)', color:'var(--text3)' },
  };
  return <span style={{ ...s.tag, ...map[type], ...style }}>{label}</span>;
};

export const Btn = ({ children, variant = 'primary', onClick, style, disabled, type = 'button' }) => {
  const variants = {
    primary: { background:'var(--accent)', color:'#fff', boxShadow:'4px 4px 10px rgba(255,107,53,0.4),-2px -2px 8px rgba(255,255,255,.8)' },
    secondary: { background:'var(--bg)', color:'var(--text2)', boxShadow:'var(--s-sm)' },
    danger: { background:'var(--bg)', color:'var(--red)', boxShadow:'var(--s-sm)' },
    success: { background:'var(--bg)', color:'var(--green)', boxShadow:'var(--s-sm)' },
    ghost: { background:'transparent', color:'var(--text3)', boxShadow:'none' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...s.btn, ...variants[variant], opacity: disabled ? .5 : 1, ...style }}>
      {children}
    </button>
  );
};

export const BtnSm = (props) => <Btn {...props} style={{ ...s.btnSm, ...props.style }} />;

export const Input = ({ label, ...props }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={s.label}>{label}</label>}
    <input style={s.input} {...props} />
  </div>
);

export const Select = ({ label, children, ...props }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={s.label}>{label}</label>}
    <select style={{ ...s.input, cursor:'pointer' }} {...props}>{children}</select>
  </div>
);

export const Row = ({ children, last }) => (
  <div style={{ ...s.row, borderBottom: last ? 'none' : '1px solid var(--bg2)' }}>{children}</div>
);

export const SkRow = ({ name, pct, value, low, last }) => (
  <div style={{ ...s.skRow, borderBottom: last ? 'none' : '1px solid var(--bg2)' }}>
    <div style={{ flex:1, fontSize:12.5, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
    <div style={{ width:80, height:5, background:'var(--bg2)', borderRadius:3, overflow:'hidden', boxShadow:'var(--s-in)' }}>
      <div style={{ width:`${pct}%`, height:'100%', background: low ? 'var(--red)' : 'var(--accent)', borderRadius:3 }} />
    </div>
    <div style={{ fontSize:12, fontWeight:600, color: low ? 'var(--red)' : 'var(--text2)', minWidth:60, textAlign:'right' }}>{value}{low ? ' ↓' : ''}</div>
  </div>
);

export const ProgressBar = ({ value, color = 'var(--accent)', height = 6 }) => (
  <div style={{ width:'100%', height, background:'var(--bg2)', borderRadius:height, overflow:'hidden', boxShadow:'var(--s-in)' }}>
    <div style={{ width:`${Math.min(value,100)}%`, height:'100%', background:color, borderRadius:height, transition:'width .5s' }} />
  </div>
);

export const SectionHeader = ({ title, action, onAction }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
    <div style={{ fontSize:13.5, fontWeight:700, color:'var(--text)' }}>{title}</div>
    {action && <button onClick={onAction} style={{ background:'none', border:'none', color:'var(--accent)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{action}</button>}
  </div>
);

export const Modal = ({ open, title, onClose, children, onSubmit }) => {
  if (!open) return null;
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position:'fixed', inset:0, background:'rgba(200,202,210,.65)', backdropFilter:'blur(4px)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'var(--bg)', borderRadius:'var(--r20)', padding:24, width:420, maxWidth:'100%', boxShadow:'var(--s-card)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text3)', lineHeight:1 }}>×</button>
        </div>
        {children}
        {onSubmit && (
          <div style={{ display:'flex', gap:10, marginTop:6 }}>
            <Btn onClick={onSubmit} style={{ flex:1, justifyContent:'center' }}>Submit</Btn>
            <Btn variant="secondary" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
          </div>
        )}
      </div>
    </div>
  );
};

export const Spinner = () => <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner" /></div>;

export const Toast = ({ messages }) => (
  <div style={{ position:'fixed', bottom:24, right:24, display:'flex', flexDirection:'column', gap:8, zIndex:999 }}>
    {messages.map((m, i) => (
      <div key={i} className="toast" style={{ background:'var(--bg)', borderRadius:'var(--r12)', padding:'12px 18px', fontSize:13, fontWeight:600, color:'var(--text)', boxShadow:'var(--s-card)', maxWidth:320 }}>{m}</div>
    ))}
  </div>
);

export function useToast() {
  const [msgs, setMsgs] = useState([]);
  const show = (msg) => {
    setMsgs(prev => [...prev, msg]);
    setTimeout(() => setMsgs(prev => prev.slice(1)), 3500);
  };
  return { msgs, show };
}

export const Table = ({ cols, rows, onDelete, onEdit }) => (
  <div style={{ background:'var(--bg)', borderRadius:'var(--r14)', boxShadow:'var(--s-card)', overflow:'hidden' }}>
    <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
      <thead style={{ background:'var(--bg2)' }}>
        <tr>{cols.map(c => <th key={c.key} style={{ padding:'10px 14px', textAlign:'left', fontSize:10.5, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5, borderBottom:'2px solid var(--bg2)', width:c.w||'auto', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.label}</th>)}
          {(onDelete||onEdit) && <th style={{ padding:'10px 14px', width:90 }}>Action</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderBottom:'1px solid var(--bg2)' }} onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
            {cols.map(c => <td key={c.key} style={{ padding:'10px 14px', fontSize:12.5, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.render ? c.render(r) : r[c.key]}</td>)}
            {(onDelete||onEdit) && (
              <td style={{ padding:'10px 14px' }}>
                <div style={{ display:'flex', gap:5 }}>
                  {onEdit && <BtnSm variant="secondary" onClick={()=>onEdit(r)}><i className="ti ti-edit" /></BtnSm>}
                  {onDelete && <BtnSm variant="danger" onClick={()=>onDelete(r)}><i className="ti ti-trash" /></BtnSm>}
                </div>
              </td>
            )}
          </tr>
        ))}
        {rows.length === 0 && <tr><td colSpan={cols.length+2} style={{ padding:40, textAlign:'center', color:'var(--text3)' }}>No data found</td></tr>}
      </tbody>
    </table>
  </div>
);
