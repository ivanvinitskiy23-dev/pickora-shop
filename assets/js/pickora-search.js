/**
 * Pickora client-side search — articles (navigate) & products (scroll to card).
 */
(function () {
  'use strict';

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function appendHighlightedTitle(h4, title, query) {
    h4.textContent = '';
    if (!query) {
      h4.textContent = title;
      return;
    }
    const lower = title.toLowerCase();
    const q = query.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx === -1) {
      h4.textContent = title;
      return;
    }
    if (idx > 0) {
      h4.appendChild(document.createTextNode(title.slice(0, idx)));
    }
    const mark = document.createElement('mark');
    mark.className = 'pk-highlight';
    mark.textContent = title.slice(idx, idx + q.length);
    h4.appendChild(mark);
    if (idx + q.length < title.length) {
      h4.appendChild(document.createTextNode(title.slice(idx + q.length)));
    }
  }

  function collectArticles(config) {
    const root = document.querySelector(config.source);
    if (!root) return [];
    const cards = root.querySelectorAll('article');
    return Array.from(cards).map(function (el) {
      const titleEl = el.querySelector(config.titleSelector);
      const linkEl = el.querySelector('a[href]');
      const imgEl = el.querySelector('img');
      const tagEl = el.querySelector(config.tagSelector || '.pk-card-tag, .pk-rev-category, span');
      const title = titleEl ? titleEl.textContent.trim() : '';
      if (!title) return null;
      return {
        title: title,
        url: linkEl ? linkEl.href : '#',
        img: imgEl ? imgEl.src : '',
        tag: tagEl ? tagEl.textContent.trim() : 'Article',
        element: el
      };
    }).filter(Boolean);
  }

  function collectProducts(config) {
    const items = [];
    document.querySelectorAll(config.source + ' [data-pk-product]').forEach(function (el) {
      const titleEl = el.querySelector(config.titleSelector || 'h3');
      const imgEl = el.querySelector('img');
      const title = titleEl ? titleEl.textContent.trim() : '';
      const keywords = (el.getAttribute('data-pk-product-keywords') || '').toLowerCase();
      if (!title) return;
      items.push({
        title: title,
        keywords: keywords,
        img: imgEl ? imgEl.src : '',
        tag: el.getAttribute('data-pk-product-tag') || 'Product',
        element: el,
        anchor: el.id || null
      });
    });
    return items;
  }

  function matchesQuery(item, query, mode) {
    const q = query.toLowerCase();
    if (mode === 'articles') {
      return item.title.toLowerCase().includes(q);
    }
    const haystack = (item.title + ' ' + item.keywords).toLowerCase();
    return haystack.includes(q);
  }

  function scrollToProduct(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('pk-search-flash');
    window.setTimeout(function () {
      el.classList.remove('pk-search-flash');
    }, 2200);
  }

  function initWidget(root) {
    const mode = root.getAttribute('data-pk-search-mode') || 'articles';
    const config = {
      source: root.getAttribute('data-pk-search-source') || '#pk-grid-feed',
      titleSelector: root.getAttribute('data-pk-search-title') || '.pk-card-title, .pk-rev-title, h3',
      tagSelector: root.getAttribute('data-pk-search-tag') || '.pk-card-tag, .pk-rev-category'
    };

    const input = root.querySelector('#pk-realtime-search');
    const dropdown = root.querySelector('#pk-search-suggestions');
    const clearBtn = root.querySelector('#pk-search-clear');
    if (!input || !dropdown) return;

    let activeIndex = -1;

    function getItems() {
      return mode === 'products' ? collectProducts(config) : collectArticles(config);
    }

    function renderDropdown(matches, query) {
      dropdown.innerHTML = '';
      activeIndex = -1;
      if (!matches.length) {
        dropdown.innerHTML = '<div class="pk-suggest-empty">No results found…</div>';
        dropdown.style.display = 'block';
        return;
      }

      matches.slice(0, 6).forEach(function (item, index) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pk-suggest-item';
        btn.setAttribute('role', 'option');

        if (item.img) {
          const img = document.createElement('img');
          img.className = 'pk-suggest-img';
          img.src = item.img;
          img.alt = '';
          img.width = 55;
          img.height = 55;
          img.loading = 'lazy';
          img.decoding = 'async';
          img.onerror = function () {
            this.style.display = 'none';
          };
          btn.appendChild(img);
        }

        const info = document.createElement('div');
        info.className = 'pk-suggest-info';
        const tag = document.createElement('span');
        tag.textContent = item.tag;
        const h4 = document.createElement('h4');
        appendHighlightedTitle(h4, item.title, query);
        info.appendChild(tag);
        info.appendChild(h4);
        btn.appendChild(info);

        btn.addEventListener('click', function () {
          if (mode === 'products') {
            scrollToProduct(item.element);
            dropdown.style.display = 'none';
            input.value = item.title;
            clearBtn.style.display = 'flex';
          } else {
            window.location.href = item.url;
          }
        });

        btn.addEventListener('mouseenter', function () {
          activeIndex = index;
          updateActive(dropdown.querySelectorAll('.pk-suggest-item'));
        });

        dropdown.appendChild(btn);
      });
      dropdown.style.display = 'block';
    }

    function updateActive(items) {
      items.forEach(function (el, i) {
        el.classList.toggle('is-active', i === activeIndex);
      });
    }

    input.addEventListener('input', function () {
      const query = this.value.trim();
      clearBtn.style.display = query.length > 0 ? 'flex' : 'none';

      if (query.length < 2) {
        dropdown.innerHTML = '';
        dropdown.style.display = 'none';
        return;
      }

      const matches = getItems().filter(function (item) {
        return matchesQuery(item, query, mode);
      });
      renderDropdown(matches, query);
    });

    input.addEventListener('keydown', function (e) {
      const items = dropdown.querySelectorAll('.pk-suggest-item');
      if (e.key === 'ArrowDown' && dropdown.style.display === 'block' && items.length) {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
        updateActive(items);
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp' && dropdown.style.display === 'block' && items.length) {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        updateActive(items);
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && activeIndex >= 0 && items[activeIndex]) {
        e.preventDefault();
        items[activeIndex].click();
      } else if (e.key === 'Escape') {
        dropdown.style.display = 'none';
      }
    });

    clearBtn.addEventListener('click', function () {
      input.value = '';
      input.focus();
      dropdown.style.display = 'none';
      clearBtn.style.display = 'none';
    });

    document.addEventListener('click', function (e) {
      if (!root.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#pk-search-system[data-pk-search-mode]').forEach(initWidget);
  });
})();
