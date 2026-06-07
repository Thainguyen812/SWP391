const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080/api';

export async function fetchUsers(){
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
}

export async function fetchVehicles(){
  const res = await fetch(`${API_BASE}/vehicles`);
  return res.json();
}

export async function fetchSessions(){
  const res = await fetch(`${API_BASE}/sessions`);
  return res.json();
}
