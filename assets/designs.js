/**
 * DESIGN PORTFOLIO — project covers, project viewer and zoom lightbox.
 * Data comes from the inline JSON block in designs.html (#designData).
 * Images load only when a project is opened, and then lazily as you scroll.
 */
(function () {
  'use strict';

  var dataEl = document.getElementById('designData');
  var grid = document.getElementById('dzGrid');
  if (!dataEl || !grid) return;

  var PROJECTS = JSON.parse(dataEl.textContent);
  var BASE = 'assets/designs/';
  var bySlug = {};
  PROJECTS.forEach(function (p, i) {
    p.index = i;
    bySlug[p.s] = p;
  });

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }
  function thumb(p, n) {
    return BASE + p.s + '/' + pad(n) + 't.webp';
  }
  function full(p, n) {
    return BASE + p.s + '/' + pad(n) + '.webp';
  }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ---------------- Filters ---------------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.dz-chip'));
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.dz-card'));
  var emptyNote = document.getElementById('dzEmpty');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var cat = chip.getAttribute('data-filter');
      var shown = 0;
      chips.forEach(function (c) {
        c.setAttribute('aria-pressed', String(c === chip));
      });
      cards.forEach(function (card) {
        var match = cat === 'all' || card.getAttribute('data-cat') === cat;
        card.hidden = !match;
        if (match) shown++;
      });
      if (emptyNote) emptyNote.hidden = shown > 0;
    });
  });

  /* ---------------- Project viewer ---------------- */
  var pv = document.getElementById('pv');
  var pvBarTitle = document.getElementById('pvBarTitle');
  var pvKind = document.getElementById('pvKind');
  var pvTitle = document.getElementById('pvTitle');
  var pvDesc = document.getElementById('pvDesc');
  var pvTags = document.getElementById('pvTags');
  var pvGallery = document.getElementById('pvGallery');
  var pvNext = document.getElementById('pvNext');
  var pvNextImg = document.getElementById('pvNextImg');
  var pvNextTitle = document.getElementById('pvNextTitle');
  var pvPrevBtn = document.getElementById('pvPrevBtn');
  var pvNextBtn = document.getElementById('pvNextBtn');
  var background = Array.prototype.slice.call(document.querySelectorAll('.site-header, main, .site-footer, .whatsapp-float'));

  var current = null;
  var lastFocus = null;

  function setBackgroundInert(on) {
    background.forEach(function (node) {
      if (on) node.setAttribute('inert', '');
      else node.removeAttribute('inert');
    });
  }

  function renderProject(p) {
    current = p;
    var total = p.i.length;
    pvBarTitle.textContent = p.t;
    pvKind.textContent = p.k;
    pvTitle.textContent = p.t;
    pvDesc.textContent = p.d;

    pvTags.textContent = '';
    pvTags.appendChild(el('li', 'pv-total', total + (total === 1 ? ' design' : ' designs')));
    p.g.forEach(function (tag) {
      pvTags.appendChild(el('li', '', tag));
    });

    var frag = document.createDocumentFragment();
    var wideCount = 0;
    p.i.forEach(function (dim, idx) {
      var n = idx + 1;
      if (dim[0] / dim[1] > 2.4) wideCount++;
      var btn = el('button', 'pv-item');
      btn.type = 'button';
      btn.setAttribute('data-n', String(n));
      btn.setAttribute('aria-label', 'Open design ' + n + ' of ' + total + ' full size');
      var img = new Image();
      img.width = dim[0];
      img.height = dim[1];
      img.decoding = 'async';
      if (idx > 5) img.loading = 'lazy';
      img.alt = p.t + ' — ' + p.k + ', design ' + n + ' of ' + total;
      img.src = thumb(p, n);
      btn.appendChild(img);
      frag.appendChild(btn);
    });
    pvGallery.textContent = '';
    pvGallery.classList.toggle('is-wide', wideCount > total / 2);
    pvGallery.appendChild(frag);

    var next = PROJECTS[(p.index + 1) % PROJECTS.length];
    pvNext.setAttribute('data-slug', next.s);
    pvNextImg.src = thumb(next, next.v);
    pvNextImg.alt = '';
    pvNextTitle.textContent = next.t;
    pvPrevBtn.setAttribute('data-slug', PROJECTS[(p.index - 1 + PROJECTS.length) % PROJECTS.length].s);
    pvNextBtn.setAttribute('data-slug', next.s);
    pv.scrollTop = 0;
  }

  function openProject(slug, opts) {
    var p = bySlug[slug];
    if (!p) return;
    opts = opts || {};
    var wasOpen = !pv.hidden;
    if (!wasOpen) lastFocus = document.activeElement;
    renderProject(p);
    pv.hidden = false;
    document.body.classList.add('dz-locked');
    setBackgroundInert(true);
    if (!opts.fromHistory) {
      var url = '#' + slug;
      if (wasOpen || opts.replace) history.replaceState({ pv: slug }, '', url);
      else history.pushState({ pv: slug }, '', url);
    }
    document.getElementById('pvClose').focus({ preventScroll: true });
  }

  function hideProject() {
    pv.hidden = true;
    current = null;
    pvGallery.textContent = '';
    document.body.classList.remove('dz-locked');
    setBackgroundInert(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function closeProject() {
    if (history.state && history.state.pv) history.back();
    else {
      hideProject();
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.dz-card');
    if (card) openProject(card.getAttribute('data-slug'));
  });

  document.getElementById('pvClose').addEventListener('click', closeProject);
  document.getElementById('pvBack').addEventListener('click', closeProject);
  [pvNext, pvPrevBtn, pvNextBtn].forEach(function (btn) {
    btn.addEventListener('click', function () {
      openProject(btn.getAttribute('data-slug'));
    });
  });

  /* ---------------- Zoom lightbox ---------------- */
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var lbCount = document.getElementById('lbCount');
  var lbStage = document.getElementById('lbStage');
  var lbIndex = 1;
  var lbFocus = null;

  function showImage(n) {
    if (!current) return;
    var total = current.i.length;
    lbIndex = ((n - 1 + total) % total) + 1;
    var dim = current.i[lbIndex - 1];
    lbStage.classList.add('is-loading');
    lbImg.width = dim[2];
    lbImg.height = dim[3];
    lbImg.alt = current.t + ' — design ' + lbIndex + ' of ' + total;
    lbImg.src = full(current, lbIndex);
    lbCount.textContent = current.t + '  ·  ' + lbIndex + ' / ' + total;
    if (total > 1) {
      new Image().src = full(current, (lbIndex % total) + 1);
    }
  }

  lbImg.addEventListener('load', function () {
    lbStage.classList.remove('is-loading');
  });

  function openLightbox(n) {
    lbFocus = document.activeElement;
    showImage(n);
    lb.hidden = false;
    history.pushState({ pv: current.s, lb: true }, '', '#' + current.s);
    document.getElementById('lbClose').focus({ preventScroll: true });
  }

  function hideLightbox() {
    lb.hidden = true;
    lbImg.removeAttribute('src');
    if (lbFocus && lbFocus.focus) lbFocus.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (history.state && history.state.lb) history.back();
    else hideLightbox();
  }

  pvGallery.addEventListener('click', function (e) {
    var item = e.target.closest('.pv-item');
    if (item) openLightbox(parseInt(item.getAttribute('data-n'), 10));
  });

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', function () {
    showImage(lbIndex - 1);
  });
  document.getElementById('lbNext').addEventListener('click', function () {
    showImage(lbIndex + 1);
  });
  lbStage.addEventListener('click', function (e) {
    if (e.target === lbStage) closeLightbox();
  });

  var touchX = null;
  lbStage.addEventListener('touchstart', function (e) {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  lbStage.addEventListener('touchend', function (e) {
    if (touchX == null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 48) showImage(lbIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------------- Keyboard + history ---------------- */
  window.addEventListener('keydown', function (e) {
    if (!lb.hidden) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showImage(lbIndex - 1);
      else if (e.key === 'ArrowRight') showImage(lbIndex + 1);
    } else if (!pv.hidden && e.key === 'Escape') {
      closeProject();
    }
  });

  window.addEventListener('popstate', function (e) {
    var state = e.state || {};
    if (!lb.hidden && !state.lb) hideLightbox();
    if (state.pv && bySlug[state.pv]) {
      if (!current || current.s !== state.pv) openProject(state.pv, { fromHistory: true });
    } else if (!pv.hidden) {
      hideProject();
    }
  });

  // Deep link: designs.html#jaguar-vpn opens that project directly.
  var initial = decodeURIComponent(location.hash.replace('#', ''));
  if (bySlug[initial]) {
    history.replaceState(null, '', location.pathname + location.search);
    openProject(initial);
  }
})();
