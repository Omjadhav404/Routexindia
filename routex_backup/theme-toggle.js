/**
 * RouteX Dark Theme Toggle System
 * Persists theme preference via localStorage.
 * Injects a floating toggle button on every page.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'routex-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  // 1. Apply saved theme IMMEDIATELY (before paint) to avoid flash
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === DARK) {
    document.documentElement.setAttribute('data-theme', DARK);
  }

  // 2. Once DOM is ready, inject the toggle button
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark theme');
    btn.setAttribute('title', 'Toggle Dark / Light Mode');
    btn.id = 'theme-toggle-btn';

    function updateIcon() {
      const isDark = document.documentElement.getAttribute('data-theme') === DARK;
      btn.innerHTML = isDark ? '☀️' : '🌙';
    }

    btn.addEventListener('click', function () {
      const isDark = document.documentElement.getAttribute('data-theme') === DARK;
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem(STORAGE_KEY, LIGHT);
      } else {
        document.documentElement.setAttribute('data-theme', DARK);
        localStorage.setItem(STORAGE_KEY, DARK);
      }
      updateIcon();
    });

    document.body.appendChild(btn);
    updateIcon();
  });
})();
