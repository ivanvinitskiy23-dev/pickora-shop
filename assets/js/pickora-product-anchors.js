/**
 * Assigns stable anchor IDs to category hub product cards for search deep-links.
 */
(function () {
  'use strict';

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.pickora-final-card').forEach(function (card) {
      if (card.id) return;
      var titleEl = card.querySelector('.pickora-final-title');
      if (!titleEl) return;
      var slug = slugify(titleEl.textContent.trim());
      if (slug) card.id = 'pk-prod-' + slug;
    });
  });
})();
