const failureListeners = new Set();
const sessionValues = new Map();

function reportFailure(error) {
  for (const listener of failureListeners) listener(error);
}

function getLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function onStorageFailure(listener) {
  failureListeners.add(listener);
  return () => failureListeners.delete(listener);
}

export function readText(key) {
  if (sessionValues.has(key)) return sessionValues.get(key);
  const storage = getLocalStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function readJson(key, fallback) {
  const text = readText(key);
  if (text === null) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export function writeText(key, text) {
  const storage = getLocalStorage();
  try {
    if (!storage) throw new Error('localStorage is unavailable');
    storage.setItem(key, text);
    sessionValues.delete(key);
    return true;
  } catch (error) {
    sessionValues.set(key, text);
    reportFailure(error);
    return false;
  }
}

export function writeJson(key, value) {
  return writeText(key, JSON.stringify(value));
}

export function removeValue(key) {
  sessionValues.delete(key);
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch (error) {
    reportFailure(error);
  }
}
