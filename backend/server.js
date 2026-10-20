const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'sastha_appalam_secret_2026';

app.use(cors());
app.use(express.json());

// ── DATABASE (lowdb - no compiler needed) ─────────────────────────────────────
const dbPath = path.join(__dirname, 'db.json');
const adapter = new FileSync(dbPath);
const db = low(adapter);

// Seed default data
db.defaults({
  users: [
    { id:1, name:'Karthikeyan R.', email:'admin@sastha.com', password: bcrypt.hashSync('admin123',10), role:'admin', initials:'KR' },
    { id:2, name:'Prabhakaran M.', email:'manager@sastha.com', password: bcrypt.hashSync('manager123',10), role:'manager', initials:'PM' },
    { id:3, name:'Selvam K.', email:'supervisor@sastha.com', password: bcrypt.hashSync('super123',10), role:'supervisor', initials:'SK' },
    { id:4, name:'Annapoorna Hotels', email:'client@sastha.com', password: bcrypt.hashSync('client123',10), role:'client', initials:'AH' },
  ],
  batches: [
    { id:1, batch_no:'SA-441', product:'Appalam 200g Regular', quantity:2400, waste_kg:38, status:'complete', started_at:'06:00', completed_at:'11:30', supervisor_name:'Selvam K.' },
    { id:2, batch_no:'SA-442', product:'Appalam 500g Family', quantity:1600, waste_kg:22, status:'in_progress', started_at:'08:30', completed_at:null, supervisor_name:'Meena R.' },
    { id:3, batch_no:'SA-443', product:'Appalam 1 kg Bulk', quantity:980, waste_kg:0, status:'in_progress', started_at:'10:00', completed_at:null, supervisor_name:'Arjun P.' },
    { id:4, batch_no:'SA-444', product:'Appalam 5 kg Hotel Pack', quantity:500, waste_kg:0, status:'queued', started_at:'12:30', completed_at:null, supervisor_name:'Priya M.' },
    { id:5, batch_no:'SA-445', product:'Export Pack 1 kg', quantity:300, waste_kg:0, status:'pending', started_at:null, completed_at:null, supervisor_name:null },
  ],
  deliveries: [
    { id:1, order_no:'SA-086', customer:'Ravi General Stores', product:'Appalam 200g', quantity:500, destination:'Madurai', driver:'Murugan', status:'delivered', eta:'12:00', value:7500 },
    { id:2, order_no:'SA-088', customer:'Ravi Stores', product:'Appalam 200g', quantity:500, destination:'Madurai', driver:'Selvam', status:'enroute', eta:'15:30', value:7500 },
    { id:3, order_no:'SA-089', customer:'Lakshmi Vilas Hotel', product:'Hotel Pack 5 kg', quantity:40, destination:'Trichy', driver:'Manoj', status:'delivered', eta:'13:45', value:28000 },
    { id:4, order_no:'SA-092', customer:'Star Supermart', product:'Appalam Mix 1 kg', quantity:200, destination:'Chennai', driver:'Ravi K.', status:'stuck', eta:null, value:24000 },
    { id:5, order_no:'SA-094', customer:'Annamalai Stores', product:'Appalam 500g', quantity:800, destination:'Salem', driver:'Karthi', status:'packaging', eta:'17:00', value:12000 },
    { id:6, order_no:'SA-096', customer:'Annapoorna Hotels', product:'Bulk 5 kg', quantity:50, destination:'Coimbatore', driver:'Dinesh', status:'delivered', eta:'12:10', value:35000 },
    { id:7, order_no:'SA-097', customer:'Kumari Snacks', product:'Appalam 200g', quantity:600, destination:'Nagercoil', driver:'Balu', status:'delayed', eta:'18:30', value:9000 },
    { id:8, order_no:'SA-098', customer:'Grand Exports', product:'Export Pack 1 kg', quantity:300, destination:'Tirunelveli', driver:null, status:'shortage', eta:null, value:36000 },
  ],
  inventory: [
    { id:1, name:'Urad Dal (split)', category:'raw', quantity:280, unit:'kg', reorder_level:500, value_per_unit:76, zone:'A' },
    { id:2, name:'Rice flour', category:'raw', quantity:340, unit:'kg', reorder_level:200, value_per_unit:28, zone:'A' },
    { id:3, name:'Black pepper', category:'raw', quantity:22, unit:'kg', reorder_level:15, value_per_unit:580, zone:'A' },
    { id:4, name:'Cumin seeds', category:'raw', quantity:16, unit:'kg', reorder_level:10, value_per_unit:220, zone:'A' },
    { id:5, name:'Salt', category:'raw', quantity:120, unit:'kg', reorder_level:50, value_per_unit:12, zone:'A' },
    { id:6, name:'Edible oil', category:'raw', quantity:44, unit:'L', reorder_level:80, value_per_unit:130, zone:'A' },
    { id:7, name:'Appalam 200g Regular', category:'finished', quantity:6000, unit:'packs', reorder_level:2000, value_per_unit:15, zone:'B' },
    { id:8, name:'Appalam 500g Family', category:'finished', quantity:2320, unit:'packs', reorder_level:1000, value_per_unit:35, zone:'B' },
    { id:9, name:'Appalam 1 kg Bulk', category:'finished', quantity:840, unit:'packs', reorder_level:500, value_per_unit:65, zone:'B' },
    { id:10, name:'Hotel Pack 5 kg', category:'finished', quantity:80, unit:'packs', reorder_level:100, value_per_unit:700, zone:'B' },
    { id:11, name:'Export Pack 1 kg', category:'finished', quantity:120, unit:'packs', reorder_level:200, value_per_unit:120, zone:'B' },
    { id:12, name:'200g poly pouches', category:'packaging', quantity:14400, unit:'pcs', reorder_level:5000, value_per_unit:0.8, zone:'C' },
    { id:13, name:'500g pouches', category:'packaging', quantity:8800, unit:'pcs', reorder_level:3000, value_per_unit:1.2, zone:'C' },
    { id:14, name:'1 kg pouches', category:'packaging', quantity:2200, unit:'pcs', reorder_level:3000, value_per_unit:2.0, zone:'C' },
    { id:15, name:'5 kg HDPE bags', category:'packaging', quantity:600, unit:'pcs', reorder_level:200, value_per_unit:8, zone:'C' },
    { id:16, name:'Export cartons', category:'packaging', quantity:180, unit:'pcs', reorder_level:300, value_per_unit:25, zone:'C' },
  ],
  machines: [
    { id:1, name:'Mixer #1', type:'mixer', status:'running', current_batch:'SA-441', started_at:'06:00', uptime_pct:92, output:'2,400 packs', last_event:'Normal', operator:'Selvam K.' },
    { id:2, name:'Mixer #2', type:'mixer', status:'running', current_batch:'SA-442', started_at:'08:30', uptime_pct:76, output:'1,200 packs', last_event:'Normal', operator:'Meena R.' },
    { id:3, name:'Dryer #1', type:'dryer', status:'running', current_batch:'SA-441', started_at:'07:30', uptime_pct:88, output:null, last_event:'Temp 42°C normal', operator:'Arjun P.' },
    { id:4, name:'Dryer #2', type:'dryer', status:'stopped', current_batch:null, started_at:null, uptime_pct:3, output:null, last_event:'Overheat 68°C · 08:15', operator:null },
    { id:5, name:'Packing Line A', type:'packing', status:'running', current_batch:'SA-441', started_at:'07:00', uptime_pct:86, output:'5,200 bags', last_event:'Sealer at 98%', operator:'Priya M.' },
    { id:6, name:'Packing Line B', type:'packing', status:'idle', current_batch:null, started_at:null, uptime_pct:40, output:null, last_event:'Waiting for batch', operator:null },
  ],
  wastage: [
    { id:1, source:'Mixer #1', type:'Dough overflow', quantity_kg:38, reason:'Over-mixing cycle', status:'reused', reporter:'Selvam K.' },
    { id:2, source:'Dryer #2', type:'Burnt appalam', quantity_kg:22, reason:'Temp spike 68°C', status:'discarded', reporter:'Arjun P.' },
    { id:3, source:'Dryer #2', type:'Dough overflow', quantity_kg:52, reason:'Maintenance issue', status:'pending', reporter:'Meena R.' },
    { id:4, source:'Packing Line A', type:'Torn pouches', quantity_kg:8, reason:'Sealer fault', status:'written_off', reporter:'Priya M.' },
    { id:5, source:'Mixer #2', type:'Spill/dust', quantity_kg:22, reason:'Overflow drain', status:'sold', reporter:'Arjun P.' },
  ],
  employees: [
    { id:1, name:'Selvam K.', role:'Supervisor', department:'Production', status:'present', initials:'SK', color:'#FF6B35' },
    { id:2, name:'Meena R.', role:'QA Lead', department:'Quality', status:'present', initials:'MR', color:'#16A34A' },
    { id:3, name:'Arjun P.', role:'Packer', department:'Packing', status:'present', initials:'AP', color:'#2563EB' },
    { id:4, name:'Priya M.', role:'Operator', department:'Production', status:'late', initials:'PM', color:'#7C3AED' },
    { id:5, name:'Murugan D.', role:'Driver', department:'Logistics', status:'present', initials:'MD', color:'#FF6B35' },
    { id:6, name:'Karthi R.', role:'Driver', department:'Logistics', status:'absent', initials:'KR', color:'#DC2626' },
    { id:7, name:'Balu N.', role:'Helper', department:'Production', status:'present', initials:'BN', color:'#0369A1' },
    { id:8, name:'Dinesh V.', role:'Driver', department:'Logistics', status:'present', initials:'DV', color:'#FF6B35' },
    { id:9, name:'Kavitha S.', role:'Packer', department:'Packing', status:'present', initials:'KS', color:'#16A34A' },
    { id:10, name:'Manoj T.', role:'Driver', department:'Logistics', status:'absent', initials:'MT', color:'#2563EB' },
    { id:11, name:'Sundar K.', role:'Mixer Op.', department:'Production', status:'present', initials:'SK', color:'#7C3AED' },
    { id:12, name:'Anbu R.', role:'Helper', department:'Production', status:'late', initials:'AR', color:'#DC2626' },
    { id:13, name:'Geetha M.', role:'Packer', department:'Packing', status:'present', initials:'GM', color:'#FF6B35' },
    { id:14, name:'Velu P.', role:'Operator', department:'Production', status:'absent', initials:'VP', color:'#16A34A' },
    { id:15, name:'Raja C.', role:'QA', department:'Quality', status:'present', initials:'RC', color:'#2563EB' },
    { id:16, name:'Rani S.', role:'Packer', department:'Packing', status:'present', initials:'RS', color:'#D97706' },
    { id:17, name:'Mani K.', role:'Mixer Op.', department:'Production', status:'present', initials:'MK', color:'#FF6B35' },
    { id:18, name:'Kumari P.', role:'Helper', department:'Production', status:'present', initials:'KP', color:'#7C3AED' },
  ],
  approvals: [
    { id:1, ref_no:'W-18', type:'Waste Report', detail:'Dryer #2 overflow — 142 kg total waste', submitted_by:'Selvam K.', status:'pending', priority:'high', amount:0 },
    { id:2, ref_no:'PR-44', type:'Purchase Request', detail:'Urad Dal 500 kg · Supplier: Kovai Dal Mills', submitted_by:'Manager', status:'pending', priority:'urgent', amount:38000 },
    { id:3, ref_no:'OT-12', type:'Overtime', detail:'4 workers · packing weekend shift', submitted_by:'HR', status:'approved', priority:'normal', amount:4800 },
    { id:4, ref_no:'SA-096', type:'Dispatch', detail:'Coimbatore · 50 packs hotel bulk', submitted_by:'Karthi', status:'approved', priority:'normal', amount:35000 },
    { id:5, ref_no:'QA-441', type:'QA Sign-off', detail:'Batch SA-441 passed · 2,400 packs cleared', submitted_by:'Meena R.', status:'approved', priority:'normal', amount:0 },
  ],
  _nextId: { batches:6, deliveries:9, inventory:17, wastage:6, employees:19, approvals:6 }
}).write();

console.log('✅ Database ready (db.json)');

// ── HELPERS ───────────────────────────────────────────────────────────────────
function nextId(table) {
  const id = db.get(`_nextId.${table}`).value();
  db.set(`_nextId.${table}`, id + 1).write();
  return id;
}

// ── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.get('users').find({ email }).value();
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id:user.id, role:user.role, name:user.name, initials:user.initials }, JWT_SECRET, { expiresIn:'8h' });
  res.json({ token, user: { id:user.id, name:user.name, role:user.role, initials:user.initials, email:user.email } });
});

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
app.get('/api/dashboard', auth, (req, res) => {
  const batches = db.get('batches').value();
  const deliveries = db.get('deliveries').value();
  const inventory = db.get('inventory').value();
  const wastage = db.get('wastage').value();
  const approvals = db.get('approvals').value();
  res.json({
    totalPacks: batches.reduce((a,b) => a+(b.quantity||0), 0),
    totalWaste: wastage.reduce((a,b) => a+(b.quantity_kg||0), 0),
    deliveriesCount: deliveries.length,
    delayedCount: deliveries.filter(d => ['delayed','stuck'].includes(d.status)).length,
    shortageCount: deliveries.filter(d => d.status==='shortage').length,
    stockValue: inventory.reduce((a,b) => a+(b.quantity*b.value_per_unit), 0),
    pendingApprovals: approvals.filter(a => a.status==='pending').length,
  });
});

// ── BATCHES ───────────────────────────────────────────────────────────────────
app.get('/api/batches', auth, (req, res) => res.json(db.get('batches').value()));
app.post('/api/batches', auth, (req, res) => {
  const { batch_no, product, quantity, started_at } = req.body;
  if (!batch_no || !product || !quantity) return res.status(400).json({ error:'Missing fields' });
  const item = { id:nextId('batches'), batch_no, product, quantity:Number(quantity), waste_kg:0, status:'pending', started_at:started_at||null, completed_at:null, supervisor_name:req.user.name };
  db.get('batches').push(item).write();
  res.json({ id:item.id, message:'Batch created' });
});
app.patch('/api/batches/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  const updates = {};
  if (req.body.status) updates.status = req.body.status;
  if (req.body.waste_kg != null) updates.waste_kg = req.body.waste_kg;
  if (req.body.completed_at) updates.completed_at = req.body.completed_at;
  db.get('batches').find({ id }).assign(updates).write();
  res.json({ message:'Updated' });
});
app.delete('/api/batches/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error:'Forbidden' });
  db.get('batches').remove({ id:Number(req.params.id) }).write();
  res.json({ message:'Deleted' });
});

// ── DELIVERIES ────────────────────────────────────────────────────────────────
app.get('/api/deliveries', auth, (req, res) => {
  let data = db.get('deliveries').value();
  if (req.user.role === 'client') data = data.filter(d => d.customer.includes('Annapoorna'));
  if (req.query.status) data = data.filter(d => d.status === req.query.status);
  res.json(data);
});
app.post('/api/deliveries', auth, (req, res) => {
  const { order_no, customer, product, quantity, destination, driver, eta, value } = req.body;
  const item = { id:nextId('deliveries'), order_no, customer, product, quantity:Number(quantity), destination, driver:driver||null, status:'pending', eta:eta||null, value:Number(value||0) };
  db.get('deliveries').push(item).write();
  res.json({ id:item.id, message:'Order created' });
});
app.patch('/api/deliveries/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  const updates = {};
  if (req.body.status) updates.status = req.body.status;
  if (req.body.driver) updates.driver = req.body.driver;
  if (req.body.eta) updates.eta = req.body.eta;
  db.get('deliveries').find({ id }).assign(updates).write();
  res.json({ message:'Updated' });
});
app.delete('/api/deliveries/:id', auth, (req, res) => {
  if (!['admin','manager'].includes(req.user.role)) return res.status(403).json({ error:'Forbidden' });
  db.get('deliveries').remove({ id:Number(req.params.id) }).write();
  res.json({ message:'Deleted' });
});

// ── INVENTORY ─────────────────────────────────────────────────────────────────
app.get('/api/inventory', auth, (req, res) => res.json(db.get('inventory').value()));
app.post('/api/inventory', auth, (req, res) => {
  const { name, category, quantity, unit, reorder_level, value_per_unit, zone } = req.body;
  const item = { id:nextId('inventory'), name, category, quantity:Number(quantity), unit, reorder_level:Number(reorder_level||0), value_per_unit:Number(value_per_unit||0), zone:zone||'A' };
  db.get('inventory').push(item).write();
  res.json({ id:item.id, message:'Item added' });
});
app.patch('/api/inventory/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  const updates = {};
  if (req.body.quantity != null) updates.quantity = Number(req.body.quantity);
  if (req.body.value_per_unit != null) updates.value_per_unit = Number(req.body.value_per_unit);
  db.get('inventory').find({ id }).assign(updates).write();
  res.json({ message:'Updated' });
});
app.delete('/api/inventory/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error:'Forbidden' });
  db.get('inventory').remove({ id:Number(req.params.id) }).write();
  res.json({ message:'Deleted' });
});

// ── MACHINES ──────────────────────────────────────────────────────────────────
app.get('/api/machines', auth, (req, res) => res.json(db.get('machines').value()));
app.patch('/api/machines/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  const updates = {};
  if (req.body.status) updates.status = req.body.status;
  if (req.body.last_event) updates.last_event = req.body.last_event;
  if (req.body.current_batch !== undefined) updates.current_batch = req.body.current_batch;
  if (req.body.operator !== undefined) updates.operator = req.body.operator;
  db.get('machines').find({ id }).assign(updates).write();
  res.json({ message:'Updated' });
});

// ── WASTAGE ───────────────────────────────────────────────────────────────────
app.get('/api/wastage', auth, (req, res) => res.json(db.get('wastage').value()));
app.post('/api/wastage', auth, (req, res) => {
  const { source, type, quantity_kg, reason } = req.body;
  const item = { id:nextId('wastage'), source, type, quantity_kg:Number(quantity_kg), reason:reason||null, status:'pending', reporter:req.user.name };
  db.get('wastage').push(item).write();
  res.json({ id:item.id, message:'Waste logged' });
});
app.patch('/api/wastage/:id', auth, (req, res) => {
  db.get('wastage').find({ id:Number(req.params.id) }).assign({ status:req.body.status }).write();
  res.json({ message:'Updated' });
});

// ── EMPLOYEES ─────────────────────────────────────────────────────────────────
app.get('/api/employees', auth, (req, res) => res.json(db.get('employees').value()));
app.post('/api/employees', auth, (req, res) => {
  const { name, role, department } = req.body;
  const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase();
  const item = { id:nextId('employees'), name, role, department:department||'General', status:'present', initials, color:'#FF6B35' };
  db.get('employees').push(item).write();
  res.json({ id:item.id, message:'Employee added' });
});
app.patch('/api/employees/:id', auth, (req, res) => {
  db.get('employees').find({ id:Number(req.params.id) }).assign({ status:req.body.status }).write();
  res.json({ message:'Updated' });
});

// ── APPROVALS ─────────────────────────────────────────────────────────────────
app.get('/api/approvals', auth, (req, res) => {
  const data = db.get('approvals').value();
  res.json([...data.filter(a=>a.status==='pending'), ...data.filter(a=>a.status!=='pending')]);
});
app.post('/api/approvals', auth, (req, res) => {
  const { ref_no, type, detail, priority, amount } = req.body;
  const item = { id:nextId('approvals'), ref_no, type, detail, submitted_by:req.user.name, status:'pending', priority:priority||'normal', amount:Number(amount||0) };
  db.get('approvals').push(item).write();
  res.json({ id:item.id, message:'Submitted' });
});
app.patch('/api/approvals/:id', auth, (req, res) => {
  if (!['admin','manager','supervisor'].includes(req.user.role)) return res.status(403).json({ error:'Forbidden' });
  db.get('approvals').find({ id:Number(req.params.id) }).assign({ status:req.body.status }).write();
  res.json({ message:`Approval ${req.body.status}` });
});

// ── REPORTS ───────────────────────────────────────────────────────────────────
app.get('/api/reports', auth, (req, res) => {
  if (!['admin','manager'].includes(req.user.role)) return res.status(403).json({ error:'Forbidden' });
  const deliveries = db.get('deliveries').value();
  const delivered = deliveries.filter(d=>d.status==='delivered').length;
  const batches = db.get('batches').value();
  res.json({
    totalOutput: batches.reduce((a,b)=>a+(b.quantity||0),0),
    totalWaste: db.get('wastage').value().reduce((a,b)=>a+(b.quantity_kg||0),0),
    onTimeRate: Math.round((delivered/deliveries.length)*100),
    stockValue: db.get('inventory').value().reduce((a,b)=>a+(b.quantity*b.value_per_unit),0),
    revenue: 6200000,
    cost: 4800000,
  });
});

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status:'ok', app:'Sastha Appalam ERP' }));

app.listen(PORT, () => {
  console.log(`\n🌾 Sastha Appalam ERP Backend → http://localhost:${PORT}`);
  console.log(`\n📧 admin@sastha.com     / admin123`);
  console.log(`📧 manager@sastha.com   / manager123`);
  console.log(`📧 supervisor@sastha.com / super123`);
  console.log(`📧 client@sastha.com    / client123\n`);
});
