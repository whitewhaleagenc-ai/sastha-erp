const BASE = '/api';

function getToken() { return localStorage.getItem('sastha_token'); }

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: 'Bearer ' + getToken() } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (email, password) => req('POST', '/login', { email, password }),
  dashboard: () => req('GET', '/dashboard'),
  batches: { list: () => req('GET', '/batches'), create: b => req('POST', '/batches', b), update: (id, b) => req('PATCH', `/batches/${id}`, b), delete: id => req('DELETE', `/batches/${id}`) },
  deliveries: { list: (s) => req('GET', '/deliveries' + (s ? `?status=${s}` : '')), create: d => req('POST', '/deliveries', d), update: (id, d) => req('PATCH', `/deliveries/${id}`, d), delete: id => req('DELETE', `/deliveries/${id}`) },
  inventory: { list: () => req('GET', '/inventory'), create: i => req('POST', '/inventory', i), update: (id, i) => req('PATCH', `/inventory/${id}`, i), delete: id => req('DELETE', `/inventory/${id}`) },
  machines: { list: () => req('GET', '/machines'), update: (id, m) => req('PATCH', `/machines/${id}`, m) },
  wastage: { list: () => req('GET', '/wastage'), create: w => req('POST', '/wastage', w), update: (id, w) => req('PATCH', `/wastage/${id}`, w) },
  employees: { list: () => req('GET', '/employees'), create: e => req('POST', '/employees', e), update: (id, e) => req('PATCH', `/employees/${id}`, e) },
  approvals: { list: () => req('GET', '/approvals'), create: a => req('POST', '/approvals', a), update: (id, a) => req('PATCH', `/approvals/${id}`, a) },
  reports: () => req('GET', '/reports'),
};
