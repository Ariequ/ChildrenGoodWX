// Fix for Node.js v25+: global.localStorage exists but has incompatible API
// with what miniprogram-ci expects (browser-style getItem/setItem).
// This must be loaded via --require so it applies to child processes too.
if (globalThis.localStorage && typeof globalThis.localStorage.getItem !== 'function') {
  delete globalThis.localStorage;
}
