/**
 * Port mobile nav overlay to <body> so position:fixed covers the full viewport
 * (escapes header/grid containing blocks).
 */
(function () {
  'use strict';

  var MQ = '(max-width: 991px)';

  function isMobileNav() {
    return window.matchMedia(MQ).matches;
  }

  function isOpen(container) {
    return container.classList.contains('is-menu-open') ||
      container.classList.contains('has-modal-open');
  }

  function portal(container) {
    if (!container || container.dataset.pkNavPortaled === 'true') return;
    container.__pkNavParent = container.parentNode;
    container.__pkNavNext = container.nextSibling;
    document.body.appendChild(container);
    container.dataset.pkNavPortaled = 'true';
  }

  function restore(container) {
    if (!container || container.dataset.pkNavPortaled !== 'true') return;
    var parent = container.__pkNavParent;
    if (parent) {
      if (container.__pkNavNext) {
        parent.insertBefore(container, container.__pkNavNext);
      } else {
        parent.appendChild(container);
      }
    }
    delete container.dataset.pkNavPortaled;
  }

  function syncContainer(container) {
    if (!isMobileNav()) {
      restore(container);
      return;
    }
    if (isOpen(container)) {
      portal(container);
    } else {
      restore(container);
    }
  }

  function syncAll() {
    document.querySelectorAll('.wp-block-navigation__responsive-container').forEach(syncContainer);
  }

  document.addEventListener('DOMContentLoaded', function () {
    syncAll();

    document.querySelectorAll('.wp-block-navigation__responsive-container').forEach(function (container) {
      new MutationObserver(function () {
        syncContainer(container);
      }).observe(container, {
        attributes: true,
        attributeFilter: ['class']
      });
    });

    window.addEventListener('resize', syncAll);
  });
})();
