/**
 * Pickora client-side search — articles & products (autocomplete → navigate to review/page).
 */
(function () {
  'use strict';

  var PRODUCT_CATALOG = [
    {
      title: 'Air Fryers',
      tag: 'Kitchen Tech',
      keywords: 'air fryer air fryers ninja kitchen budget cooking aerogrill',
      url: 'https://pickora.shop/best-air-fryers-of-2026-which-one-should-you-buy/',
      img: 'https://pickora.shop/wp-content/uploads/2026/07/A_modern_black_air_fryer_202606131522-scaled.webp'
    },
    {
      title: 'Robot Vacuums',
      tag: 'Smart Home',
      keywords: 'robot vacuum vacuums vacuum cleaner mop smart home cleaning',
      url: 'https://pickora.shop/best-robot-vacuums-2026-top-8-models-tested-honest-reviews/',
      img: 'https://pickora.shop/wp-content/uploads/2026/07/A_modern_robot_vacuum_cleaner_202606131525-scaled.webp'
    },
    {
      title: 'Wireless Earbuds',
      tag: 'Audio',
      keywords: 'wireless earbuds earbud headphones audio anc earphones',
      url: 'https://pickora.shop/best-wireless-earbuds-2026-top-7-models-tested-honest-reviews/',
      img: 'https://pickora.shop/wp-content/uploads/2026/07/Black_wireless_earbuds_in_charging_202606131603-scaled.webp'
    },
    {
      title: 'Pet Cameras',
      tag: 'Pet Tech',
      keywords: 'pet camera cameras dog cat furbo monitor smart pet',
      url: 'https://pickora.shop/best-pet-cameras-2026-top-7-smart-cameras-for-dogs-and-cats-tested-honest-reviews/',
      img: 'https://pickora.shop/wp-content/uploads/2026/07/A_smart_pet_camera_on_202606131525-scaled.webp'
    },
    {
      title: 'Coffee Machines',
      tag: 'Home & Kitchen',
      keywords: 'coffee machine espresso maker brew kitchen cafe',
      url: 'https://pickora.shop/home-kitchen/',
      img: 'https://pickora.shop/wp-content/uploads/2026/06/Commercial_studio_photography_of_modern_202606231450-scaled.webp'
    },
    {
      title: 'Keyboards & Tech Gadgets',
      tag: 'Consumer Electronics',
      keywords: 'keyboard keychron laptop tablet headphones gadgets electronics',
      url: 'https://pickora.shop/consumer-electronics/',
      img: 'https://pickora.shop/wp-content/uploads/2026/06/Tech_gadgets_on_desk_202606231445.webp'
    }
  ];

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
    return matchesText(item.title + ' ' + item.keywords, query);
  }

  function setDropdownOpen(root, open) {
    root.classList.toggle('is-open', open);
  }

  function initSearch(root) {
    var mode = root.getAttribute('data-pk-search-mode') || 'articles';
    var config = {
      source: root.getAttribute('data-pk-search-source') || '#pk-grid-feed',
      titleSelector: root.getAttribute('data-pk-search-title') || '.pk-card-title, .pk-rev-title',
      tagSelector: root.getAttribute('data-pk-search-tag') || '.pk-card-tag, .pk-rev-category'
    };

    var input = root.querySelector('#pk-realtime-search');
    var dropdown = root.querySelector('#pk-search-suggestions');
    var clearBtn = root.querySelector('#pk-search-clear');
    if (!input || !dropdown || !clearBtn) return;

    var activeIndex = -1;
    var emptyLabel = mode === 'products' ? 'No products found…' : 'No guides found…';

    function getItems() {
      return mode === 'products' ? PRODUCT_CATALOG : collectArticles(config);
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
              window.location.href = matches[0].url;
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
