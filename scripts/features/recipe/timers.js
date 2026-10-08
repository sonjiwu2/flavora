import { showToast } from '../../components/toast.js';
import {
  TIMER_STATUS,
  completeTimer,
  createTimer,
  getRemainingMs,
  isExpired,
  pauseTimer as pauseState,
  resumeTimer as resumeState,
  startTimer as startState,
} from './timer-state.js';

const TICK_MS = 250;
const SIGNAL_FREQUENCY_HZ = 880;
const SIGNAL_VOLUME = 0.2;
const SIGNAL_SILENCE = 0.0001;
const SIGNAL_OFFSETS = [0, 0.32, 0.64];
const SIGNAL_ATTACK = 0.02;
const SIGNAL_LENGTH = 0.24;

const timers = new Map();
const listeners = new Set();
let intervalId = null;
let visibilityBound = false;
let audioContext = null;
let soundEnabled = false;

function notify(key) {
  for (const listener of [...listeners]) listener(key);
}

function hasRunningTimers() {
  for (const timer of timers.values()) {
    if (timer.status === TIMER_STATUS.running) return true;
  }
  return false;
}

function playSignal() {
  if (!soundEnabled || !audioContext) return;
  const startAt = audioContext.currentTime;
  for (const offset of SIGNAL_OFFSETS) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const from = startAt + offset;
    oscillator.frequency.value = SIGNAL_FREQUENCY_HZ;
    gain.gain.setValueAtTime(SIGNAL_SILENCE, from);
    gain.gain.exponentialRampToValueAtTime(SIGNAL_VOLUME, from + SIGNAL_ATTACK);
    gain.gain.exponentialRampToValueAtTime(SIGNAL_SILENCE, from + SIGNAL_LENGTH);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(from);
    oscillator.stop(from + SIGNAL_LENGTH);
  }
}

function describeFinished(timer) {
  if (timer.stepLabel) return `Таймер шага ${timer.stepNumber} завершён: ${timer.stepLabel}`;
  return `Таймер шага ${timer.stepNumber} «${timer.stepTitle}» завершён`;
}

function finish(timer) {
  timers.set(timer.key, completeTimer(timer));
  showToast(describeFinished(timer));
  playSignal();
}

function syncInterval() {
  const running = hasRunningTimers();
  if (running && intervalId === null) intervalId = window.setInterval(tick, TICK_MS);
  if (!running && intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
}

function tick() {
  const now = Date.now();
  for (const timer of [...timers.values()]) {
    if (timer.status !== TIMER_STATUS.running) continue;
    if (isExpired(timer, now)) finish(timer);
    notify(timer.key);
  }
  syncInterval();
}

function bindVisibility() {
  if (visibilityBound) return;
  visibilityBound = true;
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tick();
  });
}

function update(key, transform) {
  const timer = timers.get(key);
  if (!timer) return;
  timers.set(key, transform(timer, Date.now()));
  syncInterval();
  notify(key);
}

export function timerKey(recipeId, stepNumber) {
  return `${recipeId}:${stepNumber}`;
}

export function getTimer(key) {
  return timers.get(key) ?? null;
}

export function getTimerRemainingMs(key) {
  const timer = timers.get(key);
  return timer ? getRemainingMs(timer, Date.now()) : 0;
}

export function startTimer(descriptor, minutes) {
  bindVisibility();
  timers.set(descriptor.key, startState(createTimer(descriptor, minutes), Date.now()));
  syncInterval();
  notify(descriptor.key);
}

export function pauseTimer(key) {
  update(key, pauseState);
}

export function resumeTimer(key) {
  update(key, resumeState);
}

export function resetTimer(key) {
  if (!timers.delete(key)) return;
  syncInterval();
  notify(key);
}

export function subscribeTimers(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function audioContextClass() {
  return window.AudioContext ?? window.webkitAudioContext;
}

export function isTimerSoundSupported() {
  return typeof audioContextClass() === 'function';
}

export function isTimerSoundEnabled() {
  return soundEnabled;
}

export function setTimerSoundEnabled(enabled) {
  soundEnabled = enabled && isTimerSoundSupported();
  if (!soundEnabled) return;
  audioContext ??= new (audioContextClass())();
  audioContext.resume().catch(() => {
    soundEnabled = false;
  });
}
