import { initEngine } from './engine/engine.js';

function boot() {
  const canvas = document.getElementById('game');
  initEngine(canvas);
}

window.addEventListener('DOMContentLoaded', boot);
