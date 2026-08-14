/**
 * Pickora client-side search — articles & products (autocomplete → navigate or scroll).
 * Products mode indexes local DOM + fetches all category hub pages automatically.
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

  function resolveUrl(src, base) {
    if (!src) return '';
    try {
      return new URL(src, base || window.location.href).href;
    } catch (e) {
      return src;
    }
  }

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

  function cardSearchText(title, desc, tag, alt, extra) {
    return [title, desc, tag, alt, extra].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  }

  function parseLocalProductArticle(el) {
    var titleEl = el.querySelector('h3, h4');
    if (!titleEl) return null;

    var linkEl = el.querySelector('a[href]');
    var imgEl = el.querySelector('img');
    var tagEl = el.querySelector('.pk-cat-badge, .pk-rev-category, .pk-card-tag, [class*="badge"]');

    var descParts = [];
    el.querySelectorAll('.pk-cat-body p, .pk-rev-excerpt, .pk-product-desc, .pk-card-excerpt').forEach(function (p) {
      var text = p.textContent.trim();
      if (text) descParts.push(text);
    });

    var title = titleEl.textContent.trim();
    var desc = descParts.join(' ');
    var tag = tagEl ? tagEl.textContent.trim() : 'Product';
    var alt = imgEl ? (imgEl.getAttribute('alt') || '').trim() : '';

    return {
      title: title,
      text: cardSearchText(title, desc, tag, alt),
      tag: tag,
      url: linkEl ? linkEl.href : '#',
      img: imgEl ? imgEl.src : '',
      element: el
    };
  }

  function parseHubProductCard(el, pageUrl, categoryLabel) {
    var titleEl = el.querySelector('.pickora-final-title');
    if (!titleEl) return null;

    var title = titleEl.textContent.trim();
    var descEl = el.querySelector('.pickora-final-text');
    var imgEl = el.querySelector('img');
    var tag = categoryLabel || 'Product';
    var alt = imgEl ? (imgEl.getAttribute('alt') || '').trim() : '';
    var slug = slugify(title);
    var prosLine = el.querySelector('.pickora-final-badge-pro');
    var prosText = prosLine && prosLine.nextElementSibling
      ? prosLine.nextElementSibling.textContent.trim()
      : '';

    return {
      title: title,
      text: cardSearchText(title, descEl ? descEl.textContent.trim() : '', tag, alt, prosText),
      tag: tag,
      url: pageUrl + (slug ? '#pk-prod-' + slug : ''),
      img: imgEl ? resolveUrl(imgEl.getAttribute('src'), pageUrl) : ''
    };
  }

  function parseHubProductsFromDocument(doc, pageUrl, categoryLabel) {
    var items = [];
    doc.querySelectorAll('.pickora-final-card').forEach(function (el) {
      var item = parseHubProductCard(el, pageUrl, categoryLabel);
      if (item) items.push(item);
    });
    return items;
  }

  function collectLocalProducts(config) {
    var root = document.querySelector(config.source || '#pk-products-page');
    if (!root) return [];
    return Array.from(root.querySelectorAll('article')).map(parseLocalProductArticle).filter(Boolean);
  }

  function collectCategoryHubMap(config) {
    var root = document.querySelector(config.source || '#pk-products-page');
    var map = {};
    if (!root) return map;

    root.querySelectorAll('.pk-cat-card').forEach(function (card) {
      var linkEl = card.querySelector('a[href]');
      var badgeEl = card.querySelector('.pk-cat-badge');
      var titleEl = card.querySelector('h3');
      if (!linkEl) return;
      try {
        var pathname = new URL(linkEl.href, window.location.href).pathname;
        map[pathname] = {
          label: badgeEl ? badgeEl.textContent.trim() : (titleEl ? titleEl.textContent.trim() : 'Product'),
          title: titleEl ? titleEl.textContent.trim() : ''
        };
      } catch (e) { /* ignore */ }
    });

    return map;
  }

  function collectHubPaths(config) {
    return Object.keys(collectCategoryHubMap(config));
  }

  function dedupeProducts(items) {
    var seen = {};
    return items.filter(function (item) {
      var key = (item.url || '') + '|' + (item.title || '');
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function fetchHubProducts(pathname, categoryLabel) {
    var url = pathname.indexOf('/') === 0 ? pathname : '/' + pathname;
    return fetch(url, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('Hub fetch failed: ' + url);
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var pageUrl = new URL(url, window.location.href).href.replace(/\/$/, '') + '/';
        return parseHubProductsFromDocument(doc, pageUrl, categoryLabel);
      })
      .catch(function () {
        return [];
      });
  }

  function buildRemoteProductIndex(config) {
    var hubMap = collectCategoryHubMap(config);
    var paths = Object.keys(hubMap);
    if (!paths.length) return Promise.resolve([]);

    return Promise.all(paths.map(function (path) {
      return fetchHubProducts(path, hubMap[path].label);
    })).then(function (groups) {
      var merged = [];
      groups.forEach(function (group) {
        merged = merged.concat(group);
      });
      return merged;
    });
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
    if (isSamePageUrl(item.url) && !item.url.includes('#')) {
      scrollToProduct(item);
      return;
    }
    window.location.href = item.url;
  }

  function setDropdownOpen(root, open) {
    root.classList.toggle('is-open', open);
  }

  function initReviewRail() {
    var rail = document.getElementById('pk-reviews-rail');
    if (!rail || rail.dataset.pkRailReady === 'true') return;

    var source = rail.getAttribute('data-pk-reviews-source') || '/articles/';
    var track = rail.querySelector('.pk-reviews-rail-track') || document.createElement('div');
    track.className = 'pk-reviews-rail-track';
    track.setAttribute('aria-live', 'polite');

    fetch(source, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('Articles fetch failed');
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var articles = doc.querySelectorAll('#pk-grid-feed article, .pk-articles-grid article');
        track.innerHTML = '';

        if (!articles.length) {
          rail.hidden = true;
          return;
        }

        articles.forEach(function (article) {
          var linkEl = article.querySelector('a[href]');
          var titleEl = article.querySelector('.pk-card-title, h3, h4');
          var imgEl = article.querySelector('img');
          var tagEl = article.querySelector('.pk-card-tag, .pk-rev-category');
          if (!linkEl || !titleEl) return;

          var chip = document.createElement('a');
          chip.className = 'pk-reviews-rail-chip';
          chip.href = linkEl.href;
          chip.setAttribute('aria-label', titleEl.textContent.trim());

          if (imgEl) {
            var img = document.createElement('img');
            img.className = 'pk-reviews-rail-chip-img';
            img.src = resolveUrl(imgEl.getAttribute('src'), source);
            img.alt = '';
          img.width = 62;
          img.height = 62;
            img.loading = 'lazy';
            img.decoding = 'async';
            chip.appendChild(img);
          }

          var body = document.createElement('span');
          body.className = 'pk-reviews-rail-chip-body';

          if (tagEl) {
            var tag = document.createElement('span');
            tag.className = 'pk-reviews-rail-chip-tag';
            tag.textContent = tagEl.textContent.trim();
            body.appendChild(tag);
          }

          var title = document.createElement('span');
          title.className = 'pk-reviews-rail-chip-title';
          title.textContent = titleEl.textContent.trim();
          body.appendChild(title);

          chip.appendChild(body);
          track.appendChild(chip);
        });

        if (!track.children.length) {
          rail.hidden = true;
          return;
        }

        rail.appendChild(track);
        rail.dataset.pkRailReady = 'true';
      })
      .catch(function () {
        rail.hidden = true;
      });
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
    var indexedProducts = mode === 'products' ? collectLocalProducts(config) : null;
    var indexReady = mode !== 'products';
    var defaultPlaceholder = input.getAttribute('placeholder') || '';

    if (mode === 'products') {
      root.classList.add('is-indexing');
      buildRemoteProductIndex(config).then(function (remoteItems) {
        indexedProducts = dedupeProducts(indexedProducts.concat(remoteItems));
        indexReady = true;
        root.classList.remove('is-indexing');
        var query = input.value.trim();
        if (query.length >= 2) {
          renderDropdown(getMatches(query), query);
        }
      });
    }

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

      if (mode === 'products' && !indexReady && !matches.length) {
        dropdown.innerHTML = '<div class="pk-suggest-empty">Loading product catalog…</div>';
        dropdown.style.display = 'block';
        setDropdownOpen(root, true);
        return;
      }

      if (!matches.length) {
        dropdown.innerHTML = '<div class="pk-suggest-empty">' + emptyLabel + '</div>';
        dropdown.style.display = 'block';
        setDropdownOpen(root, true);
        return;
      }

      matches.slice(0, 8).forEach(function (item, index) {
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
    initReviewRail();
  });
})();
