/**
 * Pickora articles category chips — multi-tag filter via data-categories.
 * One article can match several chips (e.g. "audio electronics").
 * Shareable: ?cat=audio
 * Taxonomy: .cursor/skills/pickora-article/chips.md
 */
(function () {
  'use strict';

  var VALID = {
    all: true,
    audio: true,
    electronics: true,
    mobile: true,
    kitchen: true,
    cleaning: true,
    'smart-home': true,
    fitness: true,
    wearables: true,
    pets: true,
    home: true
  };

  /* Legacy hub / old chip slugs → current vocabulary */
  var ALIASES = {
    'consumer-electronics': 'electronics',
    'home-kitchen': 'kitchen',
    'fitness-health': 'fitness',
    'pet-supplies': 'pets'
  };

  function normalizeCat(raw) {
    var cat = String(raw || '').toLowerCase().trim();
    if (ALIASES[cat]) return ALIASES[cat];
    return cat;
  }

  function cardCategories(card) {
    var raw =
      card.getAttribute('data-categories') ||
      card.getAttribute('data-category') ||
      '';
    return String(raw)
      .toLowerCase()
      .split(/[\s,]+/)
      .map(normalizeCat)
      .filter(function (c) {
        return c && c !== 'all';
      });
  }

  function cardMatches(card, cat) {
    if (cat === 'all') return true;
    return cardCategories(card).indexOf(cat) !== -1;
  }

  function readCatFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      var q = normalizeCat(params.get('cat') || '');
      if (VALID[q]) return q;
    } catch (e) { /* ignore */ }

    var hash = (window.location.hash || '').replace(/^#/, '');
    if (hash.indexOf('cat=') === 0) {
      var h = normalizeCat(hash.slice(4));
      if (VALID[h]) return h;
    }
    return 'all';
  }

  function writeCatToUrl(cat) {
    try {
      var url = new URL(window.location.href);
      if (!cat || cat === 'all') {
        url.searchParams.delete('cat');
      } else {
        url.searchParams.set('cat', cat);
      }
      url.hash = '';
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch (e) { /* ignore */ }
  }

  function init() {
    var grid = document.getElementById('pk-grid-feed');
    var bar = document.getElementById('pk-filter-bar');
    if (!grid || !bar) return;

    var chips = Array.from(bar.querySelectorAll('.pk-filter-btn'));
    var empty = document.getElementById('pk-filter-empty');
    var cards = Array.from(grid.querySelectorAll('article.pk-card'));

    function countFor(cat) {
      return cards.filter(function (card) {
        return cardMatches(card, cat);
      }).length;
    }

    function updateCounts() {
      chips.forEach(function (btn) {
        var cat = btn.getAttribute('data-filter') || 'all';
        var badge = btn.querySelector('.pk-filter-count');
        if (badge) badge.textContent = String(countFor(cat));
      });
    }

    function applyFilter(cat, pushUrl) {
      cat = normalizeCat(cat);
      if (!VALID[cat]) cat = 'all';

      chips.forEach(function (btn) {
        var active = (btn.getAttribute('data-filter') || 'all') === cat;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      var visible = 0;
      cards.forEach(function (card) {
        var match = cardMatches(card, cat);
        card.classList.toggle('is-filter-hidden', !match);
        if (match) visible += 1;
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }

      if (pushUrl !== false) writeCatToUrl(cat);
    }

    chips.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyFilter(btn.getAttribute('data-filter') || 'all', true);
      });
    });

    updateCounts();
    applyFilter(readCatFromUrl(), false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
