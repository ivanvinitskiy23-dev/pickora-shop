/**
 * Pickora mobile/tablet nav — Variant C drawer helpers.
 * - Portal overlay to <body> (fixed escapes header/grid)
 * - Inject brand row (logo + close)
 * - Backdrop click + Escape to close
 * - html.pk-nav-open so burger stays hidden after portal
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

  function headerContainers() {
    return document.querySelectorAll(
      'header.site-header .wp-block-navigation__responsive-container, ' +
      'body > .wp-block-navigation__responsive-container[data-pk-nav-portaled="true"]'
    );
  }

  function anyOpen() {
    var found = false;
    headerContainers().forEach(function (c) {
      if (isOpen(c)) found = true;
    });
    return found;
  }

  function syncHtmlFlag() {
    document.documentElement.classList.toggle('pk-nav-open', anyOpen() && isMobileNav());
  }

  function homeHref() {
    var a = document.querySelector('header.site-header .wp-block-site-title a, header.site-header .hostinger-ai-site-title a');
    return (a && a.getAttribute('href')) || '/';
  }

  function ensureBrand(container) {
    var dialog = container.querySelector('.wp-block-navigation__responsive-dialog');
    if (!dialog) return;

    var closeBtn = container.querySelector('.wp-block-navigation__responsive-container-close');

    var brand = dialog.querySelector('.pk-nav-drawer-brand');
    if (!brand) {
      brand = document.createElement('div');
      brand.className = 'pk-nav-drawer-brand';
      brand.innerHTML = '<a class="pk-nav-drawer-logo" href="' + homeHref() + '">Pickora</a>';
      dialog.insertBefore(brand, dialog.firstChild);
    }

    if (closeBtn && closeBtn.parentNode !== brand) {
      brand.appendChild(closeBtn);
    }
  }

  function teardownBrand(container) {
    var dialog = container.querySelector('.wp-block-navigation__responsive-dialog');
    if (!dialog) return;
    var brand = dialog.querySelector('.pk-nav-drawer-brand');
    if (!brand) return;
    var closeBtn = brand.querySelector('.wp-block-navigation__responsive-container-close');
    if (closeBtn) {
      dialog.insertBefore(closeBtn, dialog.firstChild);
    }
    brand.remove();
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
      if (container.__pkNavNext && container.__pkNavNext.parentNode === parent) {
        parent.insertBefore(container, container.__pkNavNext);
      } else {
        parent.appendChild(container);
      }
    }
    delete container.dataset.pkNavPortaled;
  }

  function closeContainer(container) {
    var btn = container.querySelector('.wp-block-navigation__responsive-container-close');
    if (btn) btn.click();
  }

  function syncContainer(container) {
    if (!isMobileNav()) {
      teardownBrand(container);
      restore(container);
      syncHtmlFlag();
      return;
    }
    if (isOpen(container)) {
      portal(container);
      ensureBrand(container);
    } else {
      teardownBrand(container);
      restore(container);
    }
    syncHtmlFlag();
  }

  function syncAll() {
    headerContainers().forEach(syncContainer);
    syncHtmlFlag();
  }

  function bindBackdrop(container) {
    if (container.dataset.pkNavBackdropBound === 'true') return;
    container.dataset.pkNavBackdropBound = 'true';
    container.addEventListener('click', function (e) {
      if (!isOpen(container) || !isMobileNav()) return;
      // Click on dimmed backdrop (not inside the white drawer)
      if (e.target === container) {
        closeContainer(container);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var containers = document.querySelectorAll(
      'header.site-header .wp-block-navigation__responsive-container'
    );

    containers.forEach(function (container) {
      bindBackdrop(container);
      new MutationObserver(function () {
        syncContainer(container);
      }).observe(container, {
        attributes: true,
        attributeFilter: ['class']
      });
    });

    syncAll();

    window.addEventListener('resize', syncAll);

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !anyOpen()) return;
      headerContainers().forEach(function (c) {
        if (isOpen(c)) closeContainer(c);
      });
    });
  });
})();
