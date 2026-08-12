/**
 * pickora-analytics.js
 * Affiliate click, read-depth, and outbound tracking for GA4.
 * Usage: <script src="/assets/js/pickora-analytics.js" defer></script>
 */
(function () {
  'use strict';

  if (window.__pkAnalyticsLoaded) return;
  window.__pkAnalyticsLoaded = true;

  if (typeof window.gtag !== 'function') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
  }

  var AFFILIATE_HOSTS = ['amzn.to', 'amazon.com', 'www.amazon.com', 'amazon.co.uk', 'geni.us'];

  function isAffiliate(url) {
    try {
      return AFFILIATE_HOSTS.indexOf(new URL(url, location.href).hostname) !== -1;
    } catch (e) {
      return false;
    }
  }

  /** Resolve product name from nearest card heading, link text, or image alt. */
  function resolveProductName(link) {
    var card = link.closest('article, .pk-product-card, .elementor-widget-container, li, tr, section');
    if (card) {
      var h = card.querySelector('h2, h3, h4');
      if (h && h.textContent.trim()) return h.textContent.trim().slice(0, 100);
    }
    var label = (link.textContent || '').trim();
    if (label && label.length > 2) return label.slice(0, 100);
    var img = link.querySelector('img');
    return (img && img.alt) ? img.alt.slice(0, 100) : 'unknown';
  }

  // ---- 1. Affiliate link clicks --------------------------------
  var affiliateLinks = Array.prototype.slice.call(document.querySelectorAll('a[href]'))
    .filter(function (a) { return isAffiliate(a.href); });

  affiliateLinks.forEach(function (link, index) {
    link.addEventListener('click', function () {
      var name = resolveProductName(link);

      // Standard GA4 ecommerce event — Monetization reports
      gtag('event', 'select_item', {
        item_list_name: document.title.slice(0, 100),
        items: [{
          item_id: link.href.split('/').pop().split('?')[0],
          item_name: name,
          item_brand: 'Amazon',
          item_category: (location.pathname.split('/')[1] || 'home'),
          index: index + 1
        }]
      });

      // Extra event for custom reporting
      gtag('event', 'affiliate_click', {
        product_name: name,
        destination_url: link.href,
        source_page: location.pathname,
        link_position: index + 1,
        link_text: (link.textContent || '').trim().slice(0, 80)
      });
    }, { passive: true });
  });

  // ---- 2. Read depth ----------------------------------------------
  var milestones = [25, 50, 75, 90, 100];
  var reached = {};
  var ticking = false;

  function checkScroll() {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var pct = Math.round((window.scrollY / scrollable) * 100);
    milestones.forEach(function (m) {
      if (pct >= m && !reached[m]) {
        reached[m] = true;
        gtag('event', 'read_depth', { percent: m, page_path: location.pathname });
      }
    });
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(checkScroll);
      ticking = true;
    }
  }, { passive: true });

  // ---- 3. Engaged reading time ------------------------------------
  var seconds = 0;
  var timer = setInterval(function () {
    if (document.visibilityState !== 'visible') return;
    seconds += 15;
    if (seconds === 30 || seconds === 60 || seconds === 180) {
      gtag('event', 'engaged_read', { seconds: seconds, page_path: location.pathname });
    }
    if (seconds >= 180) clearInterval(timer);
  }, 15000);

  // ---- 4. Other outbound links ----------------------------------------
  document.querySelectorAll('a[href^="http"]').forEach(function (a) {
    try {
      var host = new URL(a.href).hostname;
      if (host === location.hostname || isAffiliate(a.href)) return;
      a.addEventListener('click', function () {
        gtag('event', 'outbound_click', { destination: host, url: a.href });
      }, { passive: true });
    } catch (e) {}
  });
})();
