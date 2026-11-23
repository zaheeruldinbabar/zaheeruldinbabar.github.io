/**
 * ZAHEER MALIK — DESIGN PORTFOLIO
 * Header menu, scroll reveal, project filters and the full-size image viewer.
 * Every page works without this file; it only adds polish.
 */
(function () {
  'use strict';

  var doc = document;
  var $ = function (sel, root) { return (root || doc).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); };

  /* ---------- Old links: designs.html#jaguar-vpn -> designs/jaguar-vpn.html ---------- */
  var legacy = doc.documentElement.getAttribute('data-projects');
  var followLegacy = function () {
    if (!legacy || location.hash.length < 2) return false;
    var wanted = decodeURIComponent(location.hash.slice(1));
    if (legacy.split(',').indexOf(wanted) === -1) return false;
    location.replace('designs/' + wanted + '.html');
    return true;
  };
  if (followLegacy()) return;
  window.addEventListener('hashchange', followLegacy);

  /* ---------- Header ---------- */
  var header = $('.dh');
  var menuBtn = $('.menu-btn');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  if (header && menuBtn) {
    var setMenu = function (open) {
      header.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    };
    menuBtn.addEventListener('click', function () { setMenu(!header.classList.contains('open')); });
    $$('.dnav a', header).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Scroll reveal ---------- */
  var revealItems = $$('.rv');
  if ('IntersectionObserver' in window && revealItems.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 120px 0px' });
    revealItems.forEach(function (node) { io.observe(node); });
    // Safety net: never leave content hidden if the observer does not fire.
    setTimeout(function () {
      revealItems.forEach(function (node) {
        if (node.classList.contains('in')) return;
        node.style.transition = 'none'; // no fade: these are off screen
        node.classList.add('in');
        io.unobserve(node);
      });
    }, 2500);
  } else {
    revealItems.forEach(function (node) { node.classList.add('in'); });
  }

  /* ---------- Project filters (design home) ---------- */
  var grid = $('#grid');
  var filters = $$('.filter');
  if (grid && filters.length) {
    var cards = $$('.card', grid);
    var PATTERN = [7, 5, 4, 4, 4, 5, 7, 4, 4, 4];

    var applyFilter = function (cat) {
      var shown = 0;
      filters.forEach(function (f) { f.setAttribute('aria-pressed', String(f.getAttribute('data-filter') === cat)); });
      cards.forEach(function (card) {
        var has = (card.getAttribute('data-types') || '').split(' ');
        var match = cat === 'all' || has.indexOf(cat) !== -1;
        card.hidden = !match;
        if (match) {
          card.setAttribute('data-span', String(PATTERN[shown % PATTERN.length]));
          card.classList.add('in');
          shown++;
        }
      });
      // Small sets look best as an even row of three.
      if (shown <= 3) {
        cards.forEach(function (card) { if (!card.hidden) card.setAttribute('data-span', '4'); });
      }
    };

    filters.forEach(function (f) {
      f.addEventListener('click', function () {
        var cat = f.getAttribute('data-filter');
        applyFilter(cat);
        history.replaceState(null, '', cat === 'all' ? location.pathname : '#work=' + cat);
      });
    });

    var fromHash = /^#work=(\w+)$/.exec(location.hash);
    applyFilter(fromHash && $('.filter[data-filter="' + fromHash[1] + '"]') ? fromHash[1] : 'all');
    if (fromHash) {
      var work = $('#work');
      if (work) setTimeout(function () { work.scrollIntoView(); }, 60);
    }
  }

  /* ---------- Gallery: justified rows (project pages) ----------
     Packs designs of any shape into rows of equal height that fill the width,
     the way photo sites do. Without JavaScript the CSS flex fallback is used. */
  var layouts = [];
  $$('.jg').forEach(function (gallery) {
    var tiles = $$('.jg-item', gallery).map(function (node) {
      return { node: node, r: parseFloat(node.style.getPropertyValue('--r')) || 1 };
    });

    var layout = function () {
      var width = gallery.clientWidth;
      if (!width) return;
      var styles = getComputedStyle(gallery);
      var target = parseFloat(styles.getPropertyValue('--h')) || 300;
      var gap = parseFloat(styles.columnGap) || 12;
      var row = [];
      var sum = 0;

      var flush = function (height) {
        var used = gap * (row.length - 1);
        row.forEach(function (t) {
          var w = Math.floor(t.r * height);
          used += w;
          t.node.style.width = w + 'px';
          t.node.style.height = Math.round(height) + 'px';
          t.node.style.marginRight = '';
        });
        // If a row is narrower than the gallery, pad it so the next piece starts a new row.
        if (width - used > 2) row[row.length - 1].node.style.marginRight = (width - used) + 'px';
        row = [];
        sum = 0;
      };

      tiles.forEach(function (tile) {
        var heightWith = (width - gap * row.length) / (sum + tile.r);
        if (row.length && heightWith < target * 0.72) {
          // Adding this piece would squash the row: close the row first.
          flush(Math.min((width - gap * (row.length - 1)) / sum, target * 1.5));
          heightWith = width / tile.r;
        }
        row.push(tile);
        sum += tile.r;
        if (heightWith <= target) flush(heightWith);
      });
      // Last row keeps the target height instead of stretching.
      if (row.length) {
        var lastRow = row.slice();
        flush(Math.min((width - gap * (row.length - 1)) / sum, target));
        lastRow[lastRow.length - 1].node.style.marginRight = '';
      }
      gallery.classList.add('laid');
    };

    layout();
    layouts.push(layout);
  });

  if (layouts.length) {
    var timer;
    var relayout = function () { layouts.forEach(function (fn) { fn(); }); };
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(relayout, 120);
    });
    window.addEventListener('load', relayout);
  }

  /* ---------- Full-size viewer (project pages) ---------- */
  var lb = $('#lb');
  var shots = $$('[data-full]');
  if (lb && shots.length) {
    var lbImg = $('#lbImg');
    var lbCount = $('#lbCount');
    var lbStage = $('#lbStage');
    var title = lb.getAttribute('data-title') || '';
    // The cover on the stage repeats one gallery image, so the viewer counts gallery items only.
    var items = shots.filter(function (s) { return s.classList.contains('jg-item') || s.classList.contains('strip-item'); });
    if (!items.length) items = shots;
    var index = 0;
    var returnFocus = null;

    var show = function (i) {
      index = (i + items.length) % items.length;
      var item = items[index];
      lbStage.classList.add('loading');
      lbImg.width = parseInt(item.getAttribute('data-w'), 10);
      lbImg.height = parseInt(item.getAttribute('data-h'), 10);
      var caption = item.getAttribute('data-cap') || title;
      lbImg.alt = caption + ', design ' + (index + 1) + ' of ' + items.length;
      lbImg.src = item.getAttribute('data-full');
      lbCount.textContent = caption + '  ·  ' + (index + 1) + ' / ' + items.length;
      var next = items[(index + 1) % items.length];
      if (next !== item) new Image().src = next.getAttribute('data-full');
    };

    var open = function (i) {
      returnFocus = doc.activeElement;
      show(i);
      lb.hidden = false;
      doc.body.classList.add('locked');
      history.pushState({ lb: true }, '');
      $('#lbClose').focus({ preventScroll: true });
    };

    var hide = function () {
      lb.hidden = true;
      doc.body.classList.remove('locked');
      lbImg.removeAttribute('src');
      if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
    };

    var close = function () {
      if (history.state && history.state.lb) history.back();
      else hide();
    };

    lbImg.addEventListener('load', function () { lbStage.classList.remove('loading'); });

    shots.forEach(function (shot) {
      shot.addEventListener('click', function (e) {
        e.preventDefault();
        var full = shot.getAttribute('data-full');
        var at = 0;
        items.forEach(function (it, n) { if (it.getAttribute('data-full') === full) at = n; });
        open(at);
      });
    });

    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', function () { show(index - 1); });
    $('#lbNext').addEventListener('click', function () { show(index + 1); });
    lbStage.addEventListener('click', function (e) { if (e.target === lbStage) close(); });

    var startX = null;
    lbStage.addEventListener('touchstart', function (e) { startX = e.changedTouches[0].clientX; }, { passive: true });
    lbStage.addEventListener('touchend', function (e) {
      if (startX == null) return;
      var dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 48) show(index + (dx < 0 ? 1 : -1));
    }, { passive: true });

    window.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === 'ArrowRight') show(index + 1);
    });

    window.addEventListener('popstate', function () { if (!lb.hidden) hide(); });
  }
})();
