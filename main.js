/* Adastra — 3 motion behaviours only:
   1) reveal (fade + 16px rise, once)
   2) spine media crossfade
   3) hover/press states (CSS)                                */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function showAll() {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── 1. reveal ─────────────────────────────────────── */
  if (reduced || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });

    reveals.forEach(function (el) { io.observe(el); });

    /* safety: anything still hidden after load or on tab return */
    var sweep = function () {
      reveals.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
      });
    };
    window.addEventListener('load', sweep);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) sweep();
    });
    setTimeout(showAll, 2500);
  }

  /* ── 2. spine media ────────────────────────────────── */
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var shots = Array.prototype.slice.call(document.querySelectorAll('.spine__stack img'));

  if (steps.length && shots.length && 'IntersectionObserver' in window) {
    var current = 0;
    var setStep = function (n) {
      if (n === current) return;
      current = n;
      shots.forEach(function (img) {
        img.classList.toggle('is-on', img.getAttribute('data-st') === String(n));
      });
      steps.forEach(function (s) {
        s.classList.toggle('is-active', s.getAttribute('data-step') === String(n));
      });
    };
    setStep(1);

    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setStep(Number(e.target.getAttribute('data-step')));
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    steps.forEach(function (s) { sio.observe(s); });
  }

  /* ── nav scrolled state + phone call bar ───────────── */
  var nav = document.getElementById('nav');
  var bar = document.getElementById('callbar');
  var hero = document.querySelector('.hero');
  var contact = document.getElementById('kontaktai');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle('is-stuck', y > 12);
    if (bar && hero && contact) {
      var past = y > hero.offsetHeight * 0.8;
      var atEnd = contact.getBoundingClientRect().top < window.innerHeight;
      bar.classList.toggle('is-on', past && !atEnd);
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ── form: composes a mail to the client, inline states ── */
  var form = document.getElementById('uzklausa');
  var note = document.getElementById('form-note');

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = form.name.value.trim();
      var contactVal = form.contact.value.trim();
      var msg = form.msg.value.trim();
      var bad = false;

      [['name', name], ['contact', contactVal]].forEach(function (pair) {
        var field = form[pair[0]].closest('.field');
        var empty = pair[1] === '';
        field.classList.toggle('is-bad', empty);
        if (empty) bad = true;
      });

      if (bad) {
        note.textContent = 'Užpildykite vardą ir kontaktą — kitaip negalėsime atsakyti.';
        return;
      }

      var body =
        'Vardas: ' + name + '\n' +
        'Kontaktas: ' + contactVal + '\n\n' +
        'Apie objektą:\n' + (msg || '—') + '\n';

      window.location.href =
        'mailto:adastra.ranga@gmail.com' +
        '?subject=' + encodeURIComponent('Užklausa dėl apdailos — ' + name) +
        '&body=' + encodeURIComponent(body);

      note.textContent = 'Atidarome jūsų pašto programą su paruoštu laišku. Jei ji neatsidarė — rašykite adastra.ranga@gmail.com arba skambinkite +370 638 34443.';
    });

    form.addEventListener('input', function (ev) {
      var field = ev.target.closest('.field');
      if (field) field.classList.remove('is-bad');
    });
  }

  /* ── smooth in-page jumps that respect reduced motion ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();
