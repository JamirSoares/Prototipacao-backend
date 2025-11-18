// Simple in-memory cache with TTL
const cache = new Map();

function set(key, value, ttlMs = 300000) { // default 5 minutes
  const expiresAt = Date.now() + ttlMs;
  cache.set(key, { value, expiresAt });
}

function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function del(key) {
  cache.delete(key);
}

export default { set, get, del };
