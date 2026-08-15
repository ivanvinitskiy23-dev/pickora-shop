/**
 * Pickora mobile/tablet nav — no MutationObserver, no resize storm.
 */
(function () {
  'use strict';

  var MQ = '(max-width: 991px)';

  function isMobileNav() {
    return window.matchMedia(MQ).matches;
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

  function setOpen(container, openBtn, open) {
    if (!container) return;
    if (open && !isMobileNav()) return;

    container.classList.toggle('is-menu-open', open);
    container.classList.toggle('has-modal-open', open);
    document.documentElement.classList.toggle('pk-nav-open', open);
    document.documentElement.classList.toggle('has-modal-open', open);

    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');

    if (open) {
      if (container.dataset.pkNavPortaled !== 'true') {
        container.__pkNavParent = container.parentNode;
        container.__pkNavNext = container.nextSibling;
        document.body.appendChild(container);
        container.dataset.pkNavPortaled = 'true';
      }
      ensureBrand(container);
    } else if (container.dataset.pkNavPortaled === 'true') {
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
  }

  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('header.site-header .wp-block-navigation');
    if (!nav) return;

    var container = nav.querySelector('.wp-block-navigation__responsive-container');
    var openBtn = nav.querySelector('.wp-block-navigation__responsive-container-open');
    var closeBtn = nav.querySelector('.wp-block-navigation__responsive-container-close');
    if (!container) return;

    container.classList.remove('is-menu-open', 'has-modal-open');
    document.documentElement.classList.remove('pk-nav-open', 'has-modal-open');

    if (openBtn) {
      openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(container, openBtn, true);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(container, openBtn, false);
      });
    }

    container.addEventListener('click', function (e) {
      if (e.target === container) setOpen(container, openBtn, false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(container, openBtn, false);
    });

    var mq = window.matchMedia(MQ);
    function onMq(e) {
      if (!e.matches) setOpen(container, openBtn, false);
    }
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq);
  });
})();
