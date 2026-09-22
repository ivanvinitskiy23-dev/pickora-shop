/**
 * Pickora homepage Top Picks carousel.
 * Loads /assets/data/top-picks.json, swaps product + dual CTAs (Amazon / guide).
 */
(function () {
  'use strict';

  var FALLBACK = {
    picks: [
      {
        id: 'ninja-dz550',
        title: 'Ninja Foodi DZ550',
        badge: 'Top Pick',
        tagline: 'Best overall air fryer',
        category: 'Home & Kitchen',
        image: '/wp-content/uploads/2026/09/top-pick-ninja-dz550.webp',
        imageAlt: 'Ninja Foodi DZ550 dual-basket air fryer with NINJA logo visible',
        pros: ['Dual baskets', 'Family batches', 'Probe cooking'],
        amazonUrl: 'https://amzn.to/4vOr083',
        guideUrl: '/best-air-fryers-of-2026-which-one-should-you-buy/'
      }
    ]
  };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function init(root) {
    var src = root.getAttribute('data-pk-top-picks-src') || '/assets/data/top-picks.json';
    var img = $('.pk-top-pick-img', root);
    var badge = $('.pk-badge-floating-text', root);
    var tagline = $('.pk-year-tag', root);
    var category = $('.pk-pick-category', root);
    var title = $('.pk-product-title', root);
    var pros = $('.pk-check-list', root);
    var amazonBtn = $('.pk-btn-amazon', root);
    var guideBtn = $('.pk-btn-guide', root);
    var dots = $('.pk-pick-dots', root);
    var thumbs = $('.pk-pick-thumbs', root);
    var count = $('.pk-pick-count', root);
    var prevBtn = $('.pk-pick-prev', root);
    var nextBtn = $('.pk-pick-next', root);

    if (!img || !title || !amazonBtn || !guideBtn) return;

    var picks = [];
    var index = 0;
    var timer = null;
    var AUTO_MS = 7000;

    function renderPros(list) {
      pros.innerHTML = (list || [])
        .slice(0, 3)
        .map(function (item) {
          return '<li><span>✓</span> ' + escapeHtml(item) + '</li>';
        })
        .join('');
    }

    function renderChrome() {
      if (!dots || !thumbs) return;
      dots.innerHTML = '';
      thumbs.innerHTML = '';

      var n = picks.length || 1;
      thumbs.style.gridTemplateColumns = 'repeat(' + n + ', minmax(0, 1fr))';

      picks.forEach(function (pick, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'pk-pick-dot' + (i === index ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Show ' + pick.title);
        dot.addEventListener('click', function () {
          show(i, true);
        });
        dots.appendChild(dot);

        var thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.className = 'pk-pick-thumb' + (i === index ? ' is-active' : '');
        thumb.setAttribute('aria-label', pick.title);
        thumb.innerHTML =
          '<img src="' +
          escapeHtml(pick.image) +
          '" alt="" width="160" height="100" loading="lazy" decoding="async">';
        thumb.addEventListener('click', function () {
          show(i, true);
        });
        thumbs.appendChild(thumb);
      });
    }

    function updateChrome() {
      if (dots) {
        Array.prototype.forEach.call(dots.children, function (el, i) {
          el.classList.toggle('is-active', i === index);
        });
      }
      if (thumbs) {
        Array.prototype.forEach.call(thumbs.children, function (el, i) {
          el.classList.toggle('is-active', i === index);
        });
      }
      if (count) {
        count.textContent = index + 1 + ' / ' + picks.length;
      }
    }

    function show(i, userDriven) {
      if (!picks.length) return;
      index = ((i % picks.length) + picks.length) % picks.length;
      var pick = picks[index];

      img.style.opacity = '0.4';
      window.setTimeout(function () {
        img.src = pick.image;
        img.alt = pick.imageAlt || pick.title;
        img.style.opacity = '1';
      }, 120);

      if (badge) badge.textContent = pick.badge || 'Top Pick';
      if (tagline) tagline.textContent = pick.tagline || '';
      if (category) category.textContent = pick.category || '';
      title.textContent = pick.title;
      renderPros(pick.pros);

      amazonBtn.href = pick.amazonUrl;
      guideBtn.href = pick.guideUrl;

      updateChrome();

      if (userDriven) restartAuto();
    }

    function next() {
      show(index + 1, true);
    }

    function prev() {
      show(index - 1, true);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function startAuto() {
      stopAuto();
      if (picks.length < 2) return;
      timer = window.setInterval(function () {
        show(index + 1, false);
      }, AUTO_MS);
    }

    function restartAuto() {
      startAuto();
    }

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    root.addEventListener('mouseenter', stopAuto);
    root.addEventListener('mouseleave', startAuto);
    root.addEventListener('focusin', stopAuto);
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) startAuto();
    });

    var touchX = null;
    root.addEventListener(
      'touchstart',
      function (e) {
        touchX = e.changedTouches[0].screenX;
        stopAuto();
      },
      { passive: true }
    );
    root.addEventListener(
      'touchend',
      function (e) {
        if (touchX == null) return;
        var dx = e.changedTouches[0].screenX - touchX;
        touchX = null;
        if (Math.abs(dx) > 40) {
          if (dx < 0) next();
          else prev();
        } else {
          startAuto();
        }
      },
      { passive: true }
    );

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    });

    function boot(data) {
      picks = (data && data.picks) || FALLBACK.picks;
      root.classList.remove('is-loading');
      renderChrome();
      show(0, false);
      startAuto();
    }

    root.classList.add('is-loading');
    fetch(src, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('top-picks fetch failed');
        return res.json();
      })
      .then(boot)
      .catch(function () {
        boot(FALLBACK);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('pk-top-picks');
    if (root) init(root);
  });
})();
