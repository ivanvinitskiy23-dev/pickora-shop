/**
 * pickora-consent.js — compact consent banner + Google Consent Mode v2.
 * Usage: <script src="/assets/js/pickora-consent.js" defer></script>
 */
(function () {
  'use strict';
  var KEY = 'pk_consent';
  if (localStorage.getItem(KEY)) return;

  var css = '' +
    '#pk-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;' +
    'background:#15223B;color:#fff;border-radius:12px;padding:14px 16px;' +
    'font:14px/1.45 system-ui,-apple-system,sans-serif;' +
    'box-shadow:0 10px 32px rgba(0,0,0,.32);display:flex;gap:12px 16px;' +
    'align-items:center;flex-wrap:wrap;max-width:720px;margin:0 auto;' +
    'width:auto;height:auto;max-height:none;box-sizing:border-box}' +
    '#pk-consent p{margin:0;flex:1 1 220px;min-height:0;max-width:100%}' +
    '#pk-consent a{color:#6EC1E4}' +
    '#pk-consent .pk-actions{display:flex;gap:8px;flex:0 0 auto;flex-wrap:nowrap;' +
    'align-items:center;margin:0}' +
    '#pk-consent button{min-height:40px;padding:8px 16px;border-radius:8px;border:0;' +
    'cursor:pointer;font-size:14px;font-weight:600;line-height:1.2}' +
    '#pk-accept{background:#2075d2;color:#fff}' +
    '#pk-reject{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.45)}' +
    /* Phones + tablets: compact bottom bar, no giant empty flex gap */
    '@media(max-width:991px){' +
    '#pk-consent{left:12px;right:12px;bottom:12px;padding:12px 14px;gap:10px;' +
    'flex-direction:column;align-items:stretch;flex-wrap:nowrap;' +
    'max-width:none;border-radius:12px}' +
    '#pk-consent p{flex:0 0 auto;font-size:13px;line-height:1.4}' +
    '#pk-consent .pk-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}' +
    '#pk-consent .pk-actions button{width:100%;min-height:42px}' +
    '}' +
    '@media(max-width:380px){' +
    '#pk-consent .pk-actions{grid-template-columns:1fr}' +
    '}';

  var style = document.createElement('style');
  style.id = 'pk-consent-css';
  style.textContent = css;
  document.head.appendChild(style);

  var box = document.createElement('div');
  box.id = 'pk-consent';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-live', 'polite');
  box.setAttribute('aria-label', 'Cookie consent');
  box.innerHTML =
    '<p>We use cookies to measure traffic and improve our reviews. ' +
    'Read our <a href="/privacy-policy/">Privacy Policy</a>.</p>' +
    '<div class="pk-actions">' +
      '<button id="pk-reject" type="button">Reject</button>' +
      '<button id="pk-accept" type="button">Accept</button>' +
    '</div>';
  document.body.appendChild(box);

  function decide(granted) {
    var state = {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    };
    localStorage.setItem(KEY, JSON.stringify(state));
    if (typeof gtag === 'function') gtag('consent', 'update', state);
    box.remove();
  }

  document.getElementById('pk-accept').addEventListener('click', function () { decide(true); });
  document.getElementById('pk-reject').addEventListener('click', function () { decide(false); });
})();
