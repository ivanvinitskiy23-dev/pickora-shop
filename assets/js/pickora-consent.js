/**
 * pickora-consent.js — minimalistic consent banner compatible with Google Consent Mode v2.
 * Usage: <script src="/assets/js/pickora-consent.js" defer></script>
 */
(function () {
  'use strict';
  var KEY = 'pk_consent';
  if (localStorage.getItem(KEY)) return;

  var css = '' +
    '#pk-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;background:#15223B;' +
    'color:#fff;border-radius:14px;padding:20px 24px;font:15px/1.55 system-ui,-apple-system,sans-serif;' +
    'box-shadow:0 12px 40px rgba(0,0,0,.35);display:flex;gap:18px;align-items:center;flex-wrap:wrap;' +
    'max-width:920px;margin:0 auto}' +
    '#pk-consent p{margin:0;flex:1 1 320px}' +
    '#pk-consent a{color:#6EC1E4}' +
    '#pk-consent .pk-actions{display:flex;gap:10px;flex-wrap:wrap}' +
    '#pk-consent button{min-height:44px;padding:11px 20px;border-radius:9px;border:0;cursor:pointer;' +
    'font-size:15px;font-weight:600}' +
    '#pk-accept{background:#2075d2;color:#fff}' +
    '#pk-reject{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.45)}' +
    '@media(max-width:600px){#pk-consent{flex-direction:column;align-items:stretch}' +
    '#pk-consent .pk-actions button{width:100%}}';

  var style = document.createElement('style');
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
