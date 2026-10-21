/**
 * Rebuild footer social icons from /assets/data/socials.json
 * so Studio → Home → Publish updates every page without rewriting HTML.
 */
(function () {
  var DATA_URL = "/assets/data/socials.json";
  var UL_SEL = "ul.wp-block-social-links";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildUl(links) {
    if (!links || !links.length) {
      return '<ul class="wp-block-social-links has-icon-color is-style-logos-only is-layout-flex wp-container-core-social-links-is-layout-87452e7f wp-block-social-links-is-layout-flex" data-pk-socials="empty" hidden></ul>';
    }
    var items = links
      .map(function (s) {
        return (
          '<li style="color:#ffffff" class="wp-social-link wp-social-link-' +
          esc(s.className || s.id) +
          ' has-light-color wp-block-social-link"><a href="' +
          esc(s.url) +
          '" class="wp-block-social-link-anchor" target="_blank" rel="noopener noreferrer">' +
          (s.svg || "") +
          '<span class="wp-block-social-link-label screen-reader-text">' +
          esc(s.label || s.id) +
          "</span></a></li>"
        );
      })
      .join("\n");
    return (
      '<ul class="wp-block-social-links has-icon-color is-style-logos-only is-layout-flex wp-container-core-social-links-is-layout-87452e7f wp-block-social-links-is-layout-flex" data-pk-socials="live">' +
      items +
      "</ul>"
    );
  }

  function buildSimple(links) {
    if (!links || !links.length) return "";
    return links
      .map(function (s) {
        return (
          '<a href="' +
          esc(s.url) +
          '" aria-label="' +
          esc(s.label || s.id || "Social") +
          '" target="_blank" rel="noopener noreferrer">' +
          (s.svg || "") +
          "</a>"
        );
      })
      .join("");
  }

  function applySimple(links) {
    var mounts = document.querySelectorAll("[data-pk-socials-simple]");
    for (var i = 0; i < mounts.length; i++) {
      var mount = mounts[i];
      var col = mount.closest("[data-pk-socials-col]");
      if (!links.length) {
        mount.innerHTML = "";
        mount.setAttribute("data-pk-socials", "empty");
        if (col) {
          col.setAttribute("hidden", "");
          col.style.display = "none";
        }
        continue;
      }
      mount.innerHTML = buildSimple(links);
      mount.setAttribute("data-pk-socials", "live");
      if (col) {
        col.removeAttribute("hidden");
        col.style.display = "";
      }
    }
  }

  function apply(data) {
    var links = (data && data.links) || [];
    var html = buildUl(links);
    var nodes = document.querySelectorAll(UL_SEL);
    for (var i = 0; i < nodes.length; i++) {
      var wrap = document.createElement("div");
      wrap.innerHTML = html;
      var next = wrap.firstChild;
      if (next) nodes[i].parentNode.replaceChild(next, nodes[i]);
    }
    applySimple(links);
    // Hide / show "Socials" heading with icons
    var headings = document.querySelectorAll("h3.wp-block-heading, h3[data-pk-socials-heading]");
    for (var h = 0; h < headings.length; h++) {
      var t = (headings[h].textContent || "").replace(/\s+/g, " ").trim();
      if (t === "Socials") {
        if (links.length) {
          headings[h].removeAttribute("hidden");
          headings[h].style.display = "";
        } else {
          headings[h].setAttribute("hidden", "");
          headings[h].style.display = "none";
        }
      }
    }
  }

  function run() {
    fetch(DATA_URL, { credentials: "omit", cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("socials " + r.status);
        return r.json();
      })
      .then(apply)
      .catch(function () {
        /* keep static HTML fallback */
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
