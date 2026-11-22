/* KungfuTutor site helpers: language, safe storage, AdSense slots */
(function (w, d) {
  'use strict';

  /* ===== AdSense settings — fill these in after Google approves the site ===== */
  var ADSENSE_CLIENT = '';           // e.g. 'ca-pub-1234567890123456'
  var AD_SLOTS = {                   // slot ids from AdSense > Ads > By ad unit
    'top': '', 'mid': '', 'bottom': ''
  };
  /* ========================================================================== */

  var store = {
    get: function (k, def) {
      try { var v = w.localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; }
    },
    set: function (k, v) { try { w.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };

  function getLang() {
    var q = /[?&]lang=(zh|en)/.exec(w.location.search);
    if (q) return q[1];
    return store.get('kt.lang', d.documentElement.getAttribute('data-default-lang') || 'zh');
  }

  var listeners = [];
  function setLang(l) {
    store.set('kt.lang', l);
    d.documentElement.lang = l === 'zh' ? 'zh-Hant' : 'en';
    [].forEach.call(d.querySelectorAll('[data-zh]'), function (el) {
      var v = el.getAttribute('data-' + l);
      if (v !== null) el.textContent = v;
    });
    [].forEach.call(d.querySelectorAll('.kt-lang button'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l));
    });
    listeners.forEach(function (fn) { fn(l); });
  }

  function initAds() {
    var slots = d.querySelectorAll('.ad-slot');
    if (!ADSENSE_CLIENT) {
      // Local preview: show the reserved box. Live site: hide empty slots until AdSense is approved.
      var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
      [].forEach.call(slots, function (s) {
        if (local) s.innerHTML = '<span class="ad-ph">Ad space reserved · AdSense pending</span>';
        else s.style.display = 'none';
      });
      return;
    }
    var sc = d.createElement('script');
    sc.async = true;
    sc.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
    sc.crossOrigin = 'anonymous';
    d.head.appendChild(sc);
    [].forEach.call(slots, function (s) {
      var id = AD_SLOTS[s.getAttribute('data-slot')] || '';
      s.innerHTML = '<ins class="adsbygoogle" data-ad-client="' + ADSENSE_CLIENT + '"' +
        (id ? ' data-ad-slot="' + id + '"' : '') + ' data-ad-format="auto" data-full-width-responsive="true"></ins>';
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    });
  }

  d.addEventListener('DOMContentLoaded', function () {
    [].forEach.call(d.querySelectorAll('.kt-lang button'), function (b) {
      b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
    });
    setLang(getLang());
    initAds();
    var y = d.getElementById('kt-year');
    if (y) y.textContent = new Date().getFullYear();
  });

  w.KT = { store: store, getLang: getLang, setLang: setLang, onLang: function (fn) { listeners.push(fn); } };
})(window, document);
