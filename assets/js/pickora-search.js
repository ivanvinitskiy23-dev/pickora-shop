/**
 * Pickora client-side search — articles (autocomplete + navigate) & products (Enter → scroll).
 */
(function () {
  'use strict';

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
    return Array.from(root.querySelectorAll('article')).map(function (el) {
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
      const title = titleEl ? titleEl.textContent.trim() : '';
      const keywords = (el.getAttribute('data-pk-product-keywords') || '').toLowerCase();
      if (!title) return;
      items.push({
        title: title,
        keywords: keywords,
        tag: el.getAttribute('data-pk-product-tag') || 'Product',
        element: el
      });
    });
    return items;
  }

  function matchesArticle(item, query) {
    return item.title.toLowerCase().includes(query.toLowerCase());
  }

  function matchesProduct(item, query) {
    const q = query.toLowerCase().trim();
    if (!q) return false;
    const haystack = (item.title + ' ' + item.keywords).toLowerCase();
    if (haystack.includes(q)) return true;
    return q.split(/\s+/).every(function (word) {
      return word.length >= 2 && haystack.includes(word);
    });
  }

  function rankProductMatch(item, query) {
    const q = query.toLowerCase().trim();
    const title = item.title.toLowerCase();
    const keywords = item.keywords;
    if (title === q) return 100;
    if (title.startsWith(q)) return 90;
    if (title.includes(q)) return 75;
    if (keywords.includes(q)) return 60;
    const words = q.split(/\s+/).filter(function (w) { return w.length >= 2; });
    if (words.length && words.every(function (w) { return keywords.includes(w) || title.includes(w); })) {
      return 50;
    }
    return 0;
  }

  function scrollToProduct(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('pk-search-flash');
    window.setTimeout(function () {
      el.classList.remove('pk-search-flash');
    }, 2200);
  }

  function setDropdownOpen(root, open) {
    root.classList.toggle('is-open', open);
  }

  function initArticleSearch(root, config, input, dropdown, clearBtn) {
    let activeIndex = -1;

    function renderDropdown(matches, query) {
      dropdown.innerHTML = '';
      activeIndex = -1;
      if (!matches.length) {
        dropdown.innerHTML = '<div class="pk-suggest-empty">No guides found…</div>';
        dropdown.style.display = 'block';
        setDropdownOpen(root, true);
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
          img.onerror = function () { this.style.display = 'none'; };
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
          window.location.href = item.url;
        });

        btn.addEventListener('mouseenter', function () {
          activeIndex = index;
          updateActive(dropdown.querySelectorAll('.pk-suggest-item'));
        });

        dropdown.appendChild(btn);
      });
      dropdown.style.display = 'block';
      setDropdownOpen(root, true);
    }

    function updateActive(items) {
      items.forEach(function (el, i) {
        el.classList.toggle('is-active', i === activeIndex);
      });
    }

    function hideDropdown() {
      dropdown.style.display = 'none';
      setDropdownOpen(root, false);
    }

    input.addEventListener('input', function () {
      const query = this.value.trim();
      clearBtn.style.display = query.length > 0 ? 'flex' : 'none';

      if (query.length < 2) {
        dropdown.innerHTML = '';
        hideDropdown();
        return;
      }

      const matches = collectArticles(config).filter(function (item) {
        return matchesArticle(item, query);
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
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && items[activeIndex]) {
          e.preventDefault();
          items[activeIndex].click();
        } else if (dropdown.style.display === 'block' && items.length === 1) {
          e.preventDefault();
          items[0].click();
        }
      } else if (e.key === 'Escape') {
        hideDropdown();
      }
    });

    clearBtn.addEventListener('click', function () {
      input.value = '';
      input.focus();
      hideDropdown();
      clearBtn.style.display = 'none';
    });

    document.addEventListener('click', function (e) {
      if (!root.contains(e.target)) {
        hideDropdown();
      }
    });
  }

  function initProductSearch(root, config, input, clearBtn) {
    function runProductSearch() {
      const query = input.value.trim();
      if (query.length < 2) return false;

      const ranked = collectProducts(config)
        .map(function (item) {
          return { item: item, score: rankProductMatch(item, query) };
        })
        .filter(function (entry) { return entry.score > 0; })
        .sort(function (a, b) { return b.score - a.score; });

      if (!ranked.length) return false;
      scrollToProduct(ranked[0].item.element);
      return true;
    }

    input.addEventListener('input', function () {
      clearBtn.style.display = this.value.trim().length > 0 ? 'flex' : 'none';
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        runProductSearch();
      } else if (e.key === 'Escape') {
        input.value = '';
        clearBtn.style.display = 'none';
        input.blur();
      }
    });

    clearBtn.addEventListener('click', function () {
      input.value = '';
      input.focus();
      clearBtn.style.display = 'none';
    });
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
    if (!input || !clearBtn) return;

    if (mode === 'products') {
      initProductSearch(root, config, input, clearBtn);
      return;
    }

    if (!dropdown) return;
    initArticleSearch(root, config, input, dropdown, clearBtn);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#pk-search-system[data-pk-search-mode]').forEach(initWidget);
  });
})();
