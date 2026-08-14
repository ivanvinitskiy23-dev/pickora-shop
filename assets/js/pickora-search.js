/**
 * Pickora client-side search — articles & products (autocomplete → navigate or scroll).
 */
(function () {
  'use strict';

  function appendHighlightedTitle(h4, title, query) {
    h4.textContent = '';
    if (!query) {
      h4.textContent = title;
      return;
    }
    var lower = title.toLowerCase();
    var q = query.toLowerCase();
    var idx = lower.indexOf(q);
    if (idx === -1) {
      h4.textContent = title;
      return;
    }
    if (idx > 0) {
      h4.appendChild(document.createTextNode(title.slice(0, idx)));
    }
    var mark = document.createElement('mark');
    mark.className = 'pk-highlight';
    mark.textContent = title.slice(idx, idx + q.length);
    h4.appendChild(mark);
    if (idx + q.length < title.length) {
      h4.appendChild(document.createTextNode(title.slice(idx + q.length)));
    }
  }

  function collectArticles(config) {
    var root = document.querySelector(config.source);
    if (!root) return [];
    return Array.from(root.querySelectorAll('article')).map(function (el) {
      var titleEl = el.querySelector(config.titleSelector);
      var linkEl = el.querySelector('a[href]');
      var imgEl = el.querySelector('img');
      var tagEl = el.querySelector(config.tagSelector || '.pk-card-tag, .pk-rev-category');
      var title = titleEl ? titleEl.textContent.trim() : '';
      if (!title) return null;
      return {
        title: title,
        url: linkEl ? linkEl.href : '#',
        img: imgEl ? imgEl.src : '',
        tag: tagEl ? tagEl.textContent.trim() : 'Article'
      };
    }).filter(Boolean);
  }

  function collectProducts(config) {
    var root = document.querySelector(config.source || '#pk-products-page');
    if (!root) return [];

    return Array.from(root.querySelectorAll('article')).map(function (el) {
      var titleEl = el.querySelector('h3, h4');
      if (!titleEl) return null;

      var linkEl = el.querySelector('a[href]');
      var imgEl = el.querySelector('img');
      var tagEl = el.querySelector('.pk-cat-badge, .pk-rev-category, .pk-card-tag, [class*="badge"]');

      var descParts = [];
      el.querySelectorAll('.pk-cat-body p, .pk-rev-excerpt, .pk-product-desc').forEach(function (p) {
        var text = p.textContent.trim();
        if (text) descParts.push(text);
      });

      var title = titleEl.textContent.trim();
      var desc = descParts.join(' ');
      var tag = tagEl ? tagEl.textContent.trim() : 'Product';
      var alt = imgEl ? (imgEl.getAttribute('alt') || '').trim() : '';
      var searchable = [title, desc, tag, alt].join(' ').replace(/\s+/g, ' ').trim();

      return {
        title: title,
        text: searchable,
        tag: tag,
        url: linkEl ? linkEl.href : '#',
        img: imgEl ? imgEl.src : '',
        element: el
      };
    }).filter(Boolean);
  }

  function matchesText(haystack, query) {
    var q = query.toLowerCase().trim();
    if (!q) return false;
    var text = haystack.toLowerCase();
    if (text.indexOf(q) !== -1) return true;
    return q.split(/\s+/).every(function (word) {
      return word.length >= 2 && text.indexOf(word) !== -1;
    });
  }

  function matchesArticle(item, query) {
    return matchesText(item.title, query);
  }

  function matchesProduct(item, query) {
    return matchesText(item.text || item.title, query);
  }

  function isSamePageUrl(url) {
    try {
      var target = new URL(url, window.location.href);
      return target.origin === window.location.origin &&
        target.pathname === window.location.pathname;
    } catch (e) {
      return false;
    }
  }

  function scrollToProduct(item) {
    if (!item.element) return;
    item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    item.element.classList.add('pk-search-flash');
    window.setTimeout(function () {
      item.element.classList.remove('pk-search-flash');
    }, 1400);
  }

  function navigateProduct(item) {
    if (!item.url || item.url === '#') {
      scrollToProduct(item);
      return;
    }
    if (isSamePageUrl(item.url)) {
      scrollToProduct(item);
      try {
        var hash = new URL(item.url, window.location.href).hash;
        if (hash) {
          var anchor = document.querySelector(hash);
          if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (e) { /* ignore */ }
      return;
    }
    window.location.href = item.url;
  }

  function setDropdownOpen(root, open) {
    root.classList.toggle('is-open', open);
  }

  function initSearch(root) {
    var mode = root.getAttribute('data-pk-search-mode') || 'articles';
    var config = {
      source: root.getAttribute('data-pk-search-source') ||
        (mode === 'products' ? '#pk-products-page' : '#pk-grid-feed'),
      titleSelector: root.getAttribute('data-pk-search-title') || '.pk-card-title, .pk-rev-title',
      tagSelector: root.getAttribute('data-pk-search-tag') || '.pk-card-tag, .pk-rev-category'
    };

    var input = root.querySelector('#pk-realtime-search');
    var dropdown = root.querySelector('#pk-search-suggestions');
    var clearBtn = root.querySelector('#pk-search-clear');
    if (!input || !dropdown || !clearBtn) return;

    var activeIndex = -1;
    var emptyLabel = mode === 'products' ? 'No products found…' : 'No guides found…';
    var indexedProducts = mode === 'products' ? collectProducts(config) : null;

    function getItems() {
      if (mode === 'products') return indexedProducts || [];
      return collectArticles(config);
    }

    function getMatches(query) {
      var matcher = mode === 'products' ? matchesProduct : matchesArticle;
      return getItems().filter(function (item) {
        return matcher(item, query);
      });
    }

    function hideDropdown() {
      dropdown.style.display = 'none';
      setDropdownOpen(root, false);
      activeIndex = -1;
    }

    function updateActive(items) {
      items.forEach(function (el, i) {
        el.classList.toggle('is-active', i === activeIndex);
      });
    }

    function goToItem(item) {
      if (mode === 'products') {
        navigateProduct(item);
      } else {
        window.location.href = item.url;
      }
    }

    function renderDropdown(matches, query) {
      dropdown.innerHTML = '';
      activeIndex = -1;

      if (!matches.length) {
        dropdown.innerHTML = '<div class="pk-suggest-empty">' + emptyLabel + '</div>';
        dropdown.style.display = 'block';
        setDropdownOpen(root, true);
        return;
      }

      matches.slice(0, 6).forEach(function (item, index) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pk-suggest-item';
        btn.setAttribute('role', 'option');

        if (item.img) {
          var img = document.createElement('img');
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

        var info = document.createElement('div');
        info.className = 'pk-suggest-info';
        var tag = document.createElement('span');
        tag.textContent = item.tag;
        var h4 = document.createElement('h4');
        appendHighlightedTitle(h4, item.title, query);
        info.appendChild(tag);
        info.appendChild(h4);
        btn.appendChild(info);

        btn.addEventListener('click', function () {
          goToItem(item);
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

    input.addEventListener('input', function () {
      var query = this.value.trim();
      clearBtn.style.display = query.length > 0 ? 'flex' : 'none';

      if (query.length < 2) {
        dropdown.innerHTML = '';
        hideDropdown();
        return;
      }

      renderDropdown(getMatches(query), query);
    });

    input.addEventListener('keydown', function (e) {
      var items = dropdown.querySelectorAll('.pk-suggest-item');
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
        } else {
          var query = input.value.trim();
          if (query.length >= 2) {
            var matches = getMatches(query);
            if (matches.length) {
              e.preventDefault();
              goToItem(matches[0]);
            }
          }
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

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#pk-search-system[data-pk-search-mode]').forEach(initSearch);
  });
})();
