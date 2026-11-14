/* Kora — scroll-driven imagery, simple weekly demo, photo cards. */
(function () {
  'use strict';
  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.from((root || document).querySelectorAll(selector)); };
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var paused = false;
  var motionButton = $('#motion-toggle');
  var allowsMotion = function () { return !paused && !reduceQuery.matches; };
  var clamp = function (value) { return Math.max(0, Math.min(1, value)); };

  /* Scroll is native. One frame per scroll event; no perpetual render loop. */
  var scenes = $$('.scroll-scene');
  var frame = 0;
  function renderScroll() {
    frame = 0;
    $('#nav').classList.toggle('is-solid', window.scrollY > 30);
    if (!allowsMotion()) return;
    var mobile = window.innerWidth <= 520;
    scenes.forEach(function (scene) {
      var bounds = scene.getBoundingClientRect();
      var stage = $('.scene-stage', scene);
      var travel = Math.max(1, bounds.height - stage.offsetHeight);
      var progress = clamp(-bounds.top / travel);
      scene.dataset.scrollProgress = progress.toFixed(4);
      if (scene.id === 'top') {
        scene.style.setProperty('--hero-left', ((mobile ? 25 : 44) * (1 - progress)).toFixed(3) + '%');
        scene.style.setProperty('--hero-right', (5 * (1 - progress)).toFixed(3) + '%');
        scene.style.setProperty('--hero-top', (14 * (1 - progress)).toFixed(3) + '%');
        scene.style.setProperty('--hero-bottom', (10 * (1 - progress)).toFixed(3) + '%');
        scene.style.setProperty('--hero-radius', (28 * (1 - progress)).toFixed(2) + 'px');
        scene.style.setProperty('--hero-scale', (1 + progress * .16).toFixed(4));
        scene.style.setProperty('--hero-copy-y', (-progress * (mobile ? 14 : 35)).toFixed(2) + 'px');
        scene.style.setProperty('--spark-rotate', (progress * 135).toFixed(2) + 'deg');
        scene.style.setProperty('--sticker-y', (progress * 70).toFixed(2) + 'px');
        scene.style.setProperty('--sticker-rotate', (12 - progress * 23).toFixed(2) + 'deg');
      } else {
        scene.style.setProperty('--freedom-scale', (.84 + progress * .2).toFixed(4));
        scene.style.setProperty('--freedom-image-scale', (1 + progress * .12).toFixed(4));
        scene.style.setProperty('--freedom-copy-y', (25 - progress * 50).toFixed(2) + 'px');
      }
    });
  }
  function scheduleScroll() {
    if (!frame) frame = requestAnimationFrame(renderScroll);
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  window.addEventListener('pageshow', scheduleScroll);
  scheduleScroll();

  var revealElements = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    revealElements.forEach(function (element) { revealObserver.observe(element); });
  } else {
    revealElements.forEach(function (element) { element.classList.add('is-in'); });
  }

  var effects = new WeakMap();
  function animateChange(element) {
    var previous = effects.get(element);
    if (previous) previous.cancel();
    if (!allowsMotion() || !element.animate) return;
    effects.set(element, element.animate([
      { opacity: .35, transform: 'translateY(8px) scale(.97)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' }
    ], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' }));
  }
  function setText(element, value) {
    if (element.textContent === String(value)) return;
    element.textContent = value;
    animateChange(element);
  }

  /* Selected days are the source of truth: zero always remains zero. */
  var days = $$('#week .day');
  var scenarios = { steady: [0, 2, 4], busy: [0, 3], restart: [] };
  var messages = [
    ['Volver también cuenta.', 'Sin días marcados. Tu siguiente paso empieza cuando tú quieras.'],
    ['Ya diste un paso.', 'Un momento para ti. Y eso también cuenta.'],
    ['Dos días. A tu manera.', 'La semana está llena. Tu plan encuentra espacio.'],
    ['Vas a tu ritmo.', 'Tres momentos para ti. El resto también es vida.'],
    ['Estás encontrando tu ritmo.', 'Cuatro días para moverte. Sigue escuchándote.'],
    ['La constancia se siente.', 'Cinco días registrados. También hay espacio para descansar.'],
    ['También toca descansar.', 'Seis días registrados. Cuidarte también es hacer una pausa.'],
    ['Tu semana está completa.', 'Siete días registrados. El descanso también cuenta.']
  ];
  function updateWeek() {
    var count = days.filter(function (day) { return day.getAttribute('aria-checked') === 'true'; }).length;
    setText($('#s-dias'), count);
    setText($('#days-label'), count === 1 ? 'día para ti' : 'días para ti');
    setText($('#week-title'), messages[count][0]);
    setText($('#s-nota'), messages[count][1]);
    $('#ring-fill').style.strokeDashoffset = (2 * Math.PI * 68 * (1 - count / 7)).toFixed(3);
    $('#demo').classList.toggle('is-empty', count === 0);
    $('#reset-week').disabled = count === 0;
    setText($('#s-series'), count === 0 ? 0 : count <= 1 ? 2 : count <= 3 ? 3 : 4);
    setText($('#s-reps'), count === 0 ? 0 : count <= 2 ? 12 : count <= 4 ? 10 : 8);
    $$('[data-scenario]').forEach(function (button) {
      var pattern = scenarios[button.dataset.scenario];
      var matches = days.every(function (day, i) {
        return (day.getAttribute('aria-checked') === 'true') === pattern.includes(i);
      });
      button.setAttribute('aria-pressed', String(matches));
    });
  }
  function setDay(day, checked) {
    day.setAttribute('aria-checked', String(checked));
    $('i', day).textContent = checked ? '✓' : '+';
  }
  days.forEach(function (day) {
    day.addEventListener('click', function () {
      setDay(day, day.getAttribute('aria-checked') !== 'true');
      updateWeek();
    });
  });
  $$('[data-scenario]').forEach(function (button) {
    button.addEventListener('click', function () {
      var selected = scenarios[button.dataset.scenario];
      days.forEach(function (day, i) { setDay(day, selected.includes(i)); });
      updateWeek();
    });
  });
  $('#reset-week').addEventListener('click', function () {
    days.forEach(function (day) { setDay(day, false); });
    updateWeek();
  });
  updateWeek();

  /* Photograph cards expand only on an intentional click or keyboard action. */
  var moodButtons = $$('[data-mood]');
  function selectMood(selected) {
    moodButtons.forEach(function (button) {
      var active = button === selected;
      button.setAttribute('aria-expanded', String(active));
      button.closest('.mood-card').classList.toggle('is-active', active);
      $('#' + button.getAttribute('aria-controls')).hidden = !active;
      $('.mood-card__icon', button).textContent = active ? '↗' : '+';
    });
  }
  moodButtons.forEach(function (button, index) {
    button.addEventListener('click', function () { selectMood(button); });
    button.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % moodButtons.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + moodButtons.length - 1) % moodButtons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = moodButtons.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        moodButtons[next].focus({ preventScroll: true });
        selectMood(moodButtons[next]);
      }
    });
  });
  // Carry the chosen feeling into the weekly demo.
  var moodScenarios = { strength: 'steady', energy: 'busy', balance: 'restart' };
  $$('.mood-card__detail a').forEach(function (link) {
    link.addEventListener('click', function () {
      var mood = link.closest('.mood-card').dataset.moodCard;
      var selected = scenarios[moodScenarios[mood]];
      days.forEach(function (day, i) { setDay(day, selected.includes(i)); });
      updateWeek();
    });
  });

  /* Native dialogs provide focus containment, Escape and focus restoration. */
  var downloadDialog = $('#download-dialog');
  var sheet = $('#sheet');
  var menuButton = $('#menu-btn');
  function openDialog(dialog) {
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }
  function closeDialog(dialog) {
    dialog.close();
    document.body.style.overflow = '';
  }
  [downloadDialog, sheet].forEach(function (dialog) {
    dialog.addEventListener('close', function () {
      document.body.style.overflow = '';
      if (dialog === sheet) {
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Abrir menú');
      }
    });
    dialog.addEventListener('click', function (event) {
      var bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeDialog(dialog);
    });
    $('.dialog-close', dialog).addEventListener('click', function () { closeDialog(dialog); });
  });
  $$('[data-download]').forEach(function (button) {
    button.addEventListener('click', function () { openDialog(downloadDialog); });
  });
  $('#try-demo').addEventListener('click', function () {
    closeDialog(downloadDialog);
    $('#demo').scrollIntoView({ behavior: allowsMotion() ? 'smooth' : 'instant', block: 'center' });
    days[0].focus({ preventScroll: true });
  });
  menuButton.addEventListener('click', function () {
    openDialog(sheet);
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Cerrar menú');
  });
  $$('a', sheet).forEach(function (link) {
    link.addEventListener('click', function () {
      closeDialog(sheet);
      var destination = $(link.getAttribute('href'));
      destination.tabIndex = -1;
      destination.focus({ preventScroll: true });
    });
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', function (event) {
    if (event.matches && sheet.open) { closeDialog(sheet); $('.logo').focus(); }
  });

  function updateMotion() {
    document.documentElement.classList.toggle('is-motion-paused', paused || reduceQuery.matches);
    motionButton.disabled = reduceQuery.matches;
    motionButton.setAttribute('aria-pressed', String(paused || reduceQuery.matches));
    var label = reduceQuery.matches ? 'Animaciones reducidas por tu preferencia del sistema' : paused ? 'Activar animaciones' : 'Pausar animaciones';
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
    $('span', motionButton).textContent = paused || reduceQuery.matches ? '▷' : 'Ⅱ';
    if (!allowsMotion()) {
      revealElements.forEach(function (element) { element.classList.add('is-in'); });
      document.getAnimations().forEach(function (animation) {
        if (animation.effect && animation.effect.target && effects.get(animation.effect.target) === animation) animation.cancel();
      });
      if (reduceQuery.matches) scenes.forEach(function (scene) { scene.removeAttribute('style'); });
    } else scheduleScroll();
  }
  motionButton.addEventListener('click', function () { paused = !paused; updateMotion(); });
  reduceQuery.addEventListener('change', updateMotion);
  updateMotion();
})();

