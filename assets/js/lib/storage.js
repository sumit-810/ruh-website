/**
 * localStorage wrapper. Storage can be unavailable (private mode, blocked
 * site data) — every call is guarded and falls back to memory, so the site
 * keeps working; data simply won't persist across visits in that case.
 */
const memory = new Map();
let available = null;

const check = () => {
  if (available !== null) return available;
  try {
    const k = '__ruh_probe__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    available = true;
  } catch {
    available = false;
  }
  return available;
};

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = check() ? localStorage.getItem(key) : memory.get(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    const raw = JSON.stringify(value);
    try {
      if (check()) localStorage.setItem(key, raw);
      else memory.set(key, raw);
    } catch {
      memory.set(key, raw);
    }
  },
  remove(key) {
    try {
      if (check()) localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    memory.delete(key);
  },
};
