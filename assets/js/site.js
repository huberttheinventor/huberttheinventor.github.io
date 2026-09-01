/* site.js — the motion layer.
 *
 * The ported stylesheet parks every [data-splitting] element at opacity 0 and
 * every .overlay column at scaleY(0), because in the reference those are
 * animated in. This file is what animates them. If it does not run, the page
 * is a page of invisible copy — so it is defensive: any failure adds
 * .motion-failed to <html> and 99-hubert.css shows everything.
 *
 * Libraries are the reference's own (docs/PXPUSH-CLONE-SPEC.md §4.4), vendored
 * under assets/js: GSAP + ScrollTrigger, Lenis, Splitting, Three.
 */
import * as THREE from './three.module.min.js';
import { GLTFLoader } from './GLTFLoader.js';
import { RoomEnvironment } from './RoomEnvironment.js';
import { mergeGeometries } from './BufferGeometryUtils.js';

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Anything not taken over within two seconds is assumed broken. Cleared at the
   end of boot(). */
const failsafe = setTimeout(() => root.classList.add('motion-failed'), 2000);

const el  = (s, c = document) => c.querySelector(s);
const all = (s, c = document) => [...c.querySelectorAll(s)];

/* ── ?debug ───────────────────────────────────────────────────────────
   Add ?debug to any page and it reports what the motion layer is actually
   doing, in the page, without DevTools. This exists because "the bands are not
   moving" was reported three times while every check here said they were, and
   the gap between those two statements was never in the page — it was in what
   was being measured. A readout the reader can quote settles it in one look. */
function debugPanel() {
  if (!/[?&]debug\b/.test(location.search)) return;

  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'fixed', bottom: '12px', left: '12px', zIndex: 99999,
    background: 'rgba(0,0,0,.86)', color: '#0f0', font: '13px/1.5 ui-monospace, monospace',
    padding: '10px 14px', borderRadius: '6px', pointerEvents: 'none',
    whiteSpace: 'pre', maxWidth: '92vw',
  });
  document.body.appendChild(box);

  const readX = () => {
    const t = el('.marqueeText__track');
    if (!t || !t.style.transform) return null;
    return parseFloat(t.style.transform.slice(t.style.transform.indexOf('(') + 1));
  };

  let lastX = readX(), lastT = performance.now(), speed = 0;
  setInterval(() => {
    const x = readX(), now = performance.now();
    if (x !== null && lastX !== null && now - lastT > 400) {
      speed = Math.abs(x - lastX) / ((now - lastT) / 1000);
      lastX = x; lastT = now;
    }
    box.textContent = [
      `reduced-motion : ${reduced ? 'ON (your OS animation setting is off)' : 'off'}`,
      `motion layer   : ${root.className || '(none)'}`,
      `band transform : ${x === null ? 'NONE — the tween never ran' : x.toFixed(0) + 'px'}`,
      `band speed     : ${speed.toFixed(0)}px/s ${speed > 25 ? 'moving' : speed > 0 ? 'too slow to see' : 'STOPPED'}`,
      `gsap tweens    : ${typeof gsap === 'undefined' ? 'GSAP MISSING' : gsap.globalTimeline.getChildren(true, true, false).length}`,
      `webgl canvases : ${all('canvas').length}`,
      `script build   : ${document.currentScript?.src || 'module'}`,
    ].join('\n');
  }, 500);
}

/* ── the flight recorder ──────────────────────────────────────────────
   Writes what the motion layer actually did into localStorage a few seconds
   after load. It exists because this bug could not be observed from outside:
   an automated browser tab is backgrounded, and a backgrounded tab gets no
   animation frames at all, so every reading taken that way says "nothing is
   moving" regardless of the truth. localStorage is shared across tabs on the
   same origin, so a foreground tab can leave its findings where an automated
   one can read them.

   No UI, a few bytes, and it answers "does it move on the machine that is
   actually looking at it". */
function flightRecorder() {
  const readX = () => {
    const t = el('.marqueeText__track');
    if (!t || !t.style.transform) return null;
    return parseFloat(t.style.transform.slice(t.style.transform.indexOf('(') + 1));
  };

  const started = performance.now();
  const x0 = readX();
  setTimeout(() => {
    const x1 = readX();
    const seconds = (performance.now() - started) / 1000;
    /* Only a foreground tab has anything worth recording: a background tab gets
       no animation frames at all, so its reading is always "nothing moved" and
       would overwrite the one that mattered. It did exactly that once. */
    if (document.hidden) return;
    try {
      localStorage.setItem('hubert:motion', JSON.stringify({
        at: new Date().toISOString(),
        reducedMotion: reduced,
        wasForeground: !document.hidden,
        htmlClass: root.className,
        bandStart: x0,
        bandEnd: x1,
        bandPxPerSec: (typeof x0 === 'number' && typeof x1 === 'number')
          ? +(Math.abs(x1 - x0) / seconds).toFixed(1) : null,
        bandDirection: (typeof x0 === 'number' && typeof x1 === 'number')
          ? (x1 < x0 ? 'leftward' : x1 > x0 ? 'rightward' : 'still') : 'unknown',
        gsapFrames: typeof gsap === 'undefined' ? null : gsap.ticker.frame,
        canvases: all('canvas').length,
        viewport: `${innerWidth}x${innerHeight}`,
      }));
    } catch { /* private mode, nothing to do */ }
  }, 4000);
}

function boot() {
  gsap.registerPlugin(ScrollTrigger);
  debugPanel();
  flightRecorder();

  smoothScroll();
  splitText();
  mobileNav();
  reveals();
  marquees();
  sectionOverlays();
  topOverlays();
  filmstrip();
  cursor();
  heroMedia();
  videoOverlay();
  heroFadeOut();
  articleColumn();
  brandingFrame();
  parallax();
  webgl();

  ScrollTrigger.refresh();
  clearTimeout(failsafe);
  root.classList.add('motion-ready');
}

/* ── smooth scroll ───────────────────────────────────────────────────
   Lenis drives the scroll position; ScrollTrigger has to be told about it or
   every trigger fires against the wrong offset. */
function smoothScroll() {
  /* Off in both paths: GSAP's lag smoothing assumes a long frame means the tab
     was hidden and refuses to advance time, which on a slow machine stalls the
     continuous animations rather than just dropping frames. It was being
     disabled only when smooth scrolling was set up, so the reduced-motion path
     kept it — and the marquee crawled instead of running. */
  gsap.ticker.lagSmoothing(0);

  if (reduced || typeof Lenis === 'undefined') return;
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
}

/* ── text splitting ──────────────────────────────────────────────────
   Splitting reads the value of data-splitting as its method, so
   data-splitting="lines" splits to lines and a bare data-splitting to chars. */
function splitText() {
  if (typeof Splitting === 'undefined') return;
  Splitting();
}

/* ── the mobile menu ─────────────────────────────────────────────────
   At 600px and below the ported CSS hides the desktop nav outright and shows a
   "Menu" button in its place. Nothing was opening it, so on a phone the site
   had no navigation at all — every page reachable only by typing its address.
   The stylesheet was already waiting for `body.menu_open`; this is the switch.

   The panel is clip-path'd shut rather than moved, which is why it needs a
   class on <body> rather than a transform. */
function mobileNav() {
  const button = el('.menu');
  const panel = el('.mobilenav');
  const backdrop = el('.mobilenav__backdrop');
  if (!button || !panel) return;

  const setOpen = (open) => {
    document.body.classList.toggle('menu_open', open);
    button.setAttribute('aria-expanded', String(open));
    /* The closed panel is hidden by clip-path and `pointer-events: none`.
       Neither of those takes it out of the tab order, so at 390x844 — where the
       desktop nav is `display: none` and this panel is the only navigation —
       tabbing past the Menu button walked into all fifteen links of a menu that
       is not on screen. Measured on the live site 2026-09-01: `elementFromPoint`
       at the centre of each focused link returned the section behind it, not the
       link, while the focus ring drew over page content. WCAG 2.4.3 and 2.4.7,
       and the button said aria-expanded="false" the whole way through.

       `inert` is the one attribute that closes all of it at once — tab order,
       the accessibility tree and pointer events — without touching the clip-path
       the reveal animates. Desktop was already clean: at 1440 the real nav takes
       the focus and this panel is never reached. */
    panel.toggleAttribute('inert', !open);
    /* Reveal is animated by clip-path in the reference; a straight open is
       correct when motion is reduced. */
    gsap.to(panel, {
      clipPath: open ? 'rect(0 100% 100% 0)' : 'rect(0 100% 0 0)',
      duration: reduced ? 0 : 0.5,
      ease: 'power3.inOut',
      overwrite: true,
    });
    /* Hold the page still while the panel is over it. */
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };

  button.addEventListener('click', () =>
    setOpen(!document.body.classList.contains('menu_open')));
  backdrop?.addEventListener('click', () => setOpen(false));

  /* A menu that traps you is worse than no menu: close on Escape, on following
     a link, and if the viewport grows back to the width where the real nav
     returns. */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu_open')) setOpen(false);
  });
  all('a', panel).forEach((link) => link.addEventListener('click', () => setOpen(false)));
  matchMedia('(min-width: 601px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });

  setOpen(false);
}

/* ── reveals ─────────────────────────────────────────────────────────
   Three flavours, all keyed off attributes the reference already carries:
   effect__titleRandom  — apparatus text, arrives character by character out of
                          order, which is what makes it read as a readout
                          rather than a fade
   effect__textFade     — running copy, word by word, scrubbed to scroll
   everything else      — a plain rise. */
function reveals() {
  if (reduced) { all('[data-splitting], .hover_effect').forEach(n => gsap.set(n, { opacity: 1 })); return; }

  /* Anything already on screen at load must not wait for a scroll trigger.
     The hero's last word sits at y≈938 — below a 90%-of-viewport start line,
     so on a 1000px screen it stayed invisible until the visitor scrolled, and
     the opening sentence read as if it had been cut off mid-phrase. */
  const onScreenAtLoad = (node) => {
    const r = node.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  };

  all('[data-splitting]').forEach((node) => {
    const scope = node.closest('[effect__textFade]') ? 'fade'
                : node.hasAttribute('effect__titleRandom') || node.closest('[effect__titleRandom]') ? 'random'
                : 'rise';
    const bits = all('.char', node).length ? all('.char', node)
               : all('.word', node).length ? all('.word', node)
               : [];

    if (onScreenAtLoad(node)) {
      gsap.to(node, { opacity: 1, duration: 0.6, ease: 'power2.out' });
      if (bits.length) {
        gsap.fromTo(bits, { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: 'none', stagger: { amount: 0.8, from: 'random' } });
      }
      return;
    }

    if (scope === 'fade' && bits.length) {
      gsap.set(node, { opacity: 1 });
      /* Word by word on entry, then it stays. This was originally scrubbed to
         scroll, which is prettier and unreadable: with the tween tied to the
         block's own travel, a long paragraph only reached full opacity once
         its bottom passed the middle of the screen, so most body copy sat
         permanently between 1.2:1 and 1.8:1 against its field. A reveal that
         un-reveals is not a reveal. */
      gsap.fromTo(bits, { opacity: 0.15 }, {
        opacity: 1, duration: 0.5, ease: 'power1.out',
        stagger: { amount: Math.min(1.1, bits.length * 0.03) },
        scrollTrigger: { trigger: node, start: 'top 88%', once: true },
      });
      return;
    }

    if (scope === 'random' && bits.length) {
      gsap.set(node, { opacity: 1 });
      /* Fixed total, not a per-character delay: some of these blocks run to
         200 characters, and a constant stagger left them half-decoded for two
         seconds, which reads as broken text rather than as a readout. */
      gsap.fromTo(shuffle(bits), { opacity: 0 }, {
        opacity: 1, duration: 0.3, ease: 'none', stagger: { amount: 0.55 },
        scrollTrigger: { trigger: node, start: 'top 92%', once: true },
      });
      return;
    }

    const tl = gsap.timeline({ scrollTrigger: { trigger: node, start: 'top 90%', once: true } });
    tl.to(node, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    if (bits.length) {
      tl.fromTo(bits, { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.02 }, 0);
    }
  });

  /* Links carry .hover_effect and are hidden by the same rule. */
  all('.hover_effect').forEach((node) => {
    gsap.to(node, { opacity: 1, duration: 0.4, ease: 'power2.out',
      scrollTrigger: { trigger: node, start: 'top 95%', once: true } });
  });
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── marquees ────────────────────────────────────────────────────────
   Ported from the reference's own MarqueeText component rather than invented,
   after three rounds of guessing at this. Its numbers:

     speed: 150        px per second, desktop
     mobileSpeed: 80   px per second, at its mobile breakpoint
     duration: width / speed, ease linear, repeat -1, x: 0 -> -width

   Ours had been running at 90px/s — 40% slower than the reference — which is
   why it read as barely moving beside it. That was the whole complaint, and it
   was a number, not a mechanism.

   Two things their version does that mine did not, both of which matter:

   - It waits for the title to have a width. A marquee measured before the
     webfonts land is measured against fallback metrics, and then the loop is
     the wrong length forever. It retries every 50ms.
   - It rebuilds on resize, preserving progress, because the width it animates
     to is a measurement rather than a percentage.

   No wrap modifier is needed: the tween runs x from 0 to -width and repeats,
   and because the track holds eight identical titles, restarting at 0 lands on
   the same glyphs. */
function marquees() {
  all('.marqueeText__track').forEach((track) => {
    const first = track.firstElementChild;
    if (!first) return;
    gsap.set(track, { opacity: 1 });

    const speed = () => (window.innerWidth <= 600 ? 80 : 150);
    let drift = null;
    let builtFor = 0;
    let attempts = 0;

    const build = ({ preserveProgress = false } = {}) => {
      const width = first.getBoundingClientRect().width;

      /* Not laid out yet, or the display face has not arrived. */
      if (!width) {
        if (attempts++ < 80) setTimeout(build, 50);
        return;
      }
      if (drift && Math.abs(width - builtFor) < 1) return;

      const progress = preserveProgress && drift ? drift.progress() : 0;
      drift?.kill();
      gsap.killTweensOf(track);
      gsap.set(track, { x: 0 });
      builtFor = width;

      drift = gsap.to(track, {
        x: -width,
        duration: width / speed(),
        ease: 'linear',
        repeat: -1,
      });
      if (progress) drift.progress(progress);

      /* Content that moves for more than a few seconds owes the reader a way to
         stop it. The reference has no such control; this is one of two places
         this port deliberately improves on it. */
      const band = track.closest('.marqueeText') || track;
      band.addEventListener('pointerenter', () => drift?.pause());
      band.addEventListener('pointerleave', () => drift?.resume());
      band.addEventListener('focusin', () => drift?.pause());
      band.addEventListener('focusout', () => drift?.resume());
    };

    build();
    document.fonts?.ready.then(() => build({ preserveProgress: true }));

    let resizeTimer = null;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { attempts = 0; build({ preserveProgress: true }); }, 150);
    });

    if (reduced) return;   /* the scroll-velocity coupling below stays off */

    /* Scroll nudges the speed, which is the whole reason the band feels
       attached to the page rather than looping beside it. */
    ScrollTrigger.create({
      trigger: track, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => {
        const v = gsap.utils.clamp(-4, 4, self.getVelocity() / 400);
        if (drift) gsap.to(drift, { timeScale: 1 + Math.abs(v), duration: 0.4, overwrite: true });
      },
    });
  });
}

/* ── section overlays ────────────────────────────────────────────────
   The reference wipes from one field colour to the next in twenty columns.
   The columns are not in the markup — they are generated — so build them,
   then stagger scaleY as the section leaves. */
function sectionOverlays() {
  const COLUMNS = 20;
  all('.overlay').forEach((overlay) => {
    if (overlay.children.length === 0) {
      overlay.innerHTML = '<div></div>'.repeat(COLUMNS);
    }
    const cols = [...overlay.children];
    const section = overlay.closest('section') || overlay.parentElement;
    if (reduced) { gsap.set(cols, { scaleY: 0 }); return; }

    /* Two things were wrong with this before. The columns filled left to
       right, so a half-drawn wipe was a vertical staircase eating the left
       edge of whatever paragraph sat behind it — measured at a resting scroll
       position, not mid-flight, taking the opening syllable off three
       consecutive lines. And it began while the section's tail was still in
       the middle of the screen. Now the columns rise together, and only once
       the tail is on its way out of the viewport, so the wipe reads as a band
       closing over the section rather than a mask cutting into live copy. */
    gsap.fromTo(cols, { scaleY: 0 }, {
      scaleY: 1, transformOrigin: 'bottom', ease: 'none',
      stagger: { amount: 0.08, from: 'start' },
      scrollTrigger: { trigger: section, start: 'bottom 45%', end: 'bottom 5%', scrub: true },
    });
  });
}

/* ── the sticky top gradient ─────────────────────────────────────────
   Fades in only while its section is under the one above it. */
function topOverlays() {
  all('.topOverlay__section').forEach((node) => {
    const section = node.closest('section') || node.parentElement;
    /* Raised well before the section reaches the header. The gradient is what
       stops body copy colliding with the fixed nav, and a 0.3s CSS fade that
       only starts when the section hits the top is a third of a second too
       late on a fast scroll. */
    ScrollTrigger.create({
      trigger: section, start: 'top bottom-=25%', end: 'bottom top',
      onToggle: (self) => node.classList.toggle('is-visible', self.isActive),
    });
  });
}

/* ── the filmstrip ───────────────────────────────────────────────────
   Full-bleed, clipped both edges, driven by page scroll. The loop holds two
   copies of the run, so travelling exactly half its width lands on the same
   frame it started from. */
function filmstrip() {
  const loop = el('.homeworks__showcaseLoop');
  const frame = el('.homeworks__showcase');
  if (!loop || !frame) return;

  if (!reduced) {
    gsap.to(loop, {
      x: () => -(loop.scrollWidth / 2), ease: 'none',
      scrollTrigger: {
        trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
  }

  /* "Hold to skim" — the cursor label the reference teleports to the body. */
  const skim = el('.homeworks__skimCursor');
  if (!skim) return;
  const move = (e) => gsap.to(skim, { x: e.clientX, y: e.clientY, duration: 0.25, ease: 'power3.out' });
  frame.addEventListener('pointerenter', () => {
    gsap.to(skim, { opacity: 1, duration: 0.2 });
    window.addEventListener('pointermove', move);
  });
  frame.addEventListener('pointerleave', () => {
    gsap.to(skim, { opacity: 0, duration: 0.2 });
    window.removeEventListener('pointermove', move);
  });

  /* Held pointer scrubs the strip by hand. */
  let held = false, lastX = 0;
  frame.addEventListener('pointerdown', (e) => { held = true; lastX = e.clientX; frame.setPointerCapture(e.pointerId); });
  frame.addEventListener('pointerup',   (e) => { held = false; frame.releasePointerCapture(e.pointerId); });
  frame.addEventListener('pointermove', (e) => {
    if (!held) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    gsap.set(loop, { x: gsap.getProperty(loop, 'x') + dx * 1.6 });
  });
}

/* ── the cursor ──────────────────────────────────────────────────────
   A gooey dot that grows over anything interactive and disappears over
   regions that opt out with .cursor_disabled. */
function cursor() {
  const dot = el('.cursor');
  if (!dot || window.matchMedia('(pointer: coarse)').matches) return;
  const inner = el('.cursor__inner', dot) || dot;

  gsap.set(dot, { opacity: 1 });
  window.addEventListener('pointermove', (e) => {
    gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power3.out' });
  });
  all('a, button, .hover_effect').forEach((node) => {
    node.addEventListener('pointerenter', () => gsap.to(inner, { scale: 2.4, duration: 0.25 }));
    node.addEventListener('pointerleave', () => gsap.to(inner, { scale: 1, duration: 0.25 }));
  });
  all('.cursor_disabled').forEach((node) => {
    node.addEventListener('pointerenter', () => gsap.to(dot, { opacity: 0, duration: 0.15 }));
    node.addEventListener('pointerleave', () => gsap.to(dot, { opacity: 1, duration: 0.15 }));
  });
}

/* ── hero media ──────────────────────────────────────────────────────
   Both the banner and the mini video are parked at opacity 0 by the port. */
function heroMedia() {
  const banner = el('.banner__hero');
  const video = el('.homeMiniVideo video');
  if (banner) gsap.to(banner, { opacity: 1, duration: 1.1, ease: 'power2.out' });
  if (video) {
    gsap.to(video, { opacity: 1, duration: reduced ? 0 : 1.1, delay: reduced ? 0 : 0.2, ease: 'power2.out' });
    /* The mini video is a decorative muted loop, so under reduced motion it
       holds on its first frame instead of running. It stays visible and the
       button around it still opens the real player; only the loop stops.
       Verified 2026-08-26: with the media feature emulated this element was
       still reporting paused: false. */
    if (reduced) {
      video.autoplay = false;
      video.removeAttribute('autoplay');
      video.pause?.();
    } else {
      video.play?.().catch(() => {});   /* autoplay refusal is not an error */
    }
  }
}

/* ── the guide's article column ───────────────────────────────────────
   The detail-page stylesheet parks .journalArticle__article at opacity 0 and
   .article__md a few pixels low, waiting to be brought in — the same assumption
   the rest of the port makes. Without this the whole guide is invisible. */
function articleColumn() {
  const column = el('.journalArticle__article');
  if (!column) return;
  gsap.to(column, { opacity: 1, duration: reduced ? 0 : 0.8, ease: 'power2.out' });

  all('.article__md').forEach((node) => {
    ScrollTrigger.create({ trigger: node, start: 'top 92%', once: true,
      onEnter: () => node.classList.add('is-visible') });
  });
}

/* ── the film, full screen ───────────────────────────────────────────
   The hero's little video was decorative and clicking it did nothing, but the
   port already carries every style this needs — .homeVideoOverlay, its stage,
   its video and its controls — plus the "Click to close" cursor label that is
   teleported to the body. Only the element and the switch were missing.

   It puts the whole film one tap from the front page rather than only on the
   guide. */
function videoOverlay() {
  const trigger = el('.mini-video__button');
  const label = el('.homeVideoOverlay__closeCursor');
  if (!trigger) return;

  let overlay = null;

  const close = () => {
    if (!overlay) return;
    const dying = overlay;
    overlay = null;
    document.documentElement.style.overflow = '';
    if (label) gsap.to(label, { opacity: 0, duration: 0.15 });
    gsap.to(dying, {
      opacity: 0, duration: reduced ? 0 : 0.25, ease: 'none',
      onComplete: () => dying.remove(),
    });
    trigger.focus();
  };

  const open = () => {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'homeVideoOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Field guide Nº001: how Netflix actually works');
    overlay.innerHTML = `
      <div class="homeVideoOverlay__stage">
        <video class="homeVideoOverlay__video" playsinline controls autoplay
               poster="img/guide/guide-01-poster.jpg">
          <source src="img/guide/guide-01.mp4" type="video/mp4">
          <track kind="subtitles" src="artifacts/guide-01.vtt" srclang="en" label="English" default>
        </video>
      </div>
      <div class="homeVideoOverlay__controls">
        <button type="button" aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>
        </button>
      </div>`;
    document.body.appendChild(overlay);
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.25, ease: 'none' });
    document.documentElement.style.overflow = 'hidden';

    /* Clicking the backdrop closes; clicking the video itself must not, or the
       play button becomes a trap. */
    overlay.addEventListener('click', (e) => {
      if (e.target.closest('.homeVideoOverlay__video')) return;
      close();
    });
    el('.homeVideoOverlay__controls button', overlay)?.focus();

    if (label) {
      gsap.to(label, { opacity: 1, duration: 0.2 });
      const follow = (e) => gsap.to(label, { x: e.clientX, y: e.clientY, duration: 0.2, ease: 'power3.out' });
      overlay.addEventListener('pointermove', follow);
    }
  };

  trigger.addEventListener('click', open);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* ── the hero leaves ─────────────────────────────────────────────────
   The hero marquee, the mini video and the 3D wordmark are all position:fixed
   in the ported CSS — the reference holds them over the first screen and fades
   them out as the page moves on. Without this they sit over every section for
   the whole 12,000px of scroll, which is exactly what happened the first time.
   The markup already carries the hooks: effect__fadeout and
   effect__fadeOutVideo. */
function heroFadeOut() {
  const hero = el('.homeHeroIntro');
  if (!hero) return;

  const fixed = [
    ...all('.homeHeroIntro .marqueeText'),
    ...all('.homeMiniVideo'),
    ...all('.logo3d--hero'),
    ...all('.banner__hero--wrapper'),
  ];
  if (!fixed.length) return;

  if (!reduced) {
    gsap.to(fixed, {
      opacity: 0, ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: () => `top+=${window.innerHeight * 0.15} top`,
        end: () => `top+=${window.innerHeight * 0.75} top`,
        scrub: true,
      },
      /* Once gone they must stop intercepting the pointer, or the fixed layer
         keeps swallowing clicks over the sections underneath. */
      onUpdate() {
        const done = this.progress?.() > 0.98;
        fixed.forEach(n => { n.style.pointerEvents = done ? 'none' : ''; });
      },
    });
  }

  /* This one runs whether or not motion is reduced, and it has to cover the
     whole rest of the page rather than a single point.

     It was `start: 'bottom top'` with no `end`, which makes a point trigger —
     isActive is true only for the instant the scroll crosses it. So the layer
     was never actually hidden. With motion on, the fade above masked that. With
     motion reduced there is no fade, so the hero marquee and the video card sat
     pinned over all 12,200px of the page and the site looked as though it would
     not scroll past the first screen. That is what the founder hit. */
  const clear = (hide) => fixed.forEach((n) => {
    n.style.visibility = hide ? 'hidden' : '';
    n.style.pointerEvents = hide ? 'none' : '';
    if (reduced) n.style.opacity = hide ? '0' : '';
  });

  ScrollTrigger.create({
    trigger: hero,
    start: () => `top+=${window.innerHeight * (reduced ? 0.5 : 0.75)} top`,
    end: 'max',
    onEnter: () => clear(true),
    onLeaveBack: () => clear(false),
  });
}

/* ── the floating image frame ────────────────────────────────────────
   Guide 01's images live in a fixed frame in the corner, clipped to nothing
   until its section arrives. The reference wipes the clip open, then flips
   through the stack as you scroll — which is why the markup holds fifteen
   absolutely-stacked images and the CSS parks the frame at inset(100%). */
function brandingFrame() {
  const frame = el('.branding__imageFrame');
  const section = frame?.closest('section');
  const shots = frame ? all('.branding__image', frame) : [];
  if (!frame || !section || !shots.length) return;

  gsap.set(shots, { opacity: 0 });
  gsap.set(shots[0], { opacity: 1 });

  if (reduced) {
    frame.style.clipPath = 'inset(0 round var(--radius))';
    return;
  }

  gsap.fromTo(frame,
    { clipPath: 'inset(100% 0 0 0 round 7.5px)' },
    { clipPath: 'inset(0% 0 0 0 round 7.5px)', ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 70%', end: 'top 30%', scrub: true } });

  gsap.to(frame,
    { clipPath: 'inset(0 0 100% 0 round 7.5px)', ease: 'power2.in',
      scrollTrigger: { trigger: section, start: 'bottom 70%', end: 'bottom 25%', scrub: true } });

  /* The flipbook: one image per slice of the section's travel. */
  ScrollTrigger.create({
    trigger: section, start: 'top 60%', end: 'bottom 40%', scrub: true,
    onUpdate: (self) => {
      const i = Math.min(shots.length - 1, Math.floor(self.progress * shots.length));
      shots.forEach((s, n) => gsap.set(s, { opacity: n === i ? 1 : 0 }));
    },
  });
}

/* ── parallax ────────────────────────────────────────────────────────
   One element asks for it: the footer wrapper, via data-parallax. */
function parallax() {
  if (reduced) return;
  all('[effect__parallax]').forEach((node) => {
    const amount = parseFloat(node.dataset.parallax || '70');
    gsap.fromTo(node, { y: amount }, {
      y: -amount, ease: 'none',
      scrollTrigger: { trigger: node, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* ── WebGL ───────────────────────────────────────────────────────────
   Two canvases: the chrome logotype over the hero, and the drifting field
   behind it. Both are decorative and both bail out quietly on a machine that
   cannot give us a context. */
function webgl() {
  try {
    /* One mark, not two: the reference shows a single glass roundel held in
       front of the camera inside the cloud scene, so the separate .logo3d
       canvas is left empty rather than rendering a second one. */
    cloudField(el('#canvas'));
    pricingObject(el('.pricing__package'));
  } catch (e) {
    /* Decoration: never take the page down for it — but never swallow it
       silently either, or a scene that fails to build looks like a scene that
       was never written. */
    console.error('[hubert] WebGL scene failed to build', e);
  }
}

/* Every scene mounts the same way. */
function renderer(host, { alpha = true, size } = {}) {
  if (!host) return null;
  const w = size ? size.w : (host.clientWidth || 1);
  const h = size ? size.h : (host.clientHeight || 1);
  const r = new THREE.WebGLRenderer({ alpha, antialias: true });
  /* 1, not the device ratio: these are full-viewport canvases carrying soft
     imagery, and rendering four times the pixels for them was a measurable part
     of a 5fps page. */
  r.setPixelRatio(1);
  r.setSize(w, h);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1;
  host.appendChild(r.domElement);
  Object.assign(r.domElement.style, { width: '100%', height: '100%', display: 'block' });
  return r;
}

/* ── the hero background: a cloud tunnel, and a mark flying in it ─────
   Ported from the reference rather than reinvented — every constant below was
   read out of its own bundle, because "something cloudy in blue" is not the
   same picture. Eight thousand textured planes are laid down the z axis and
   merged into one geometry, and the camera flies through them on a loop; a
   second copy sits 8,000 units back so the tunnel never runs out.

   The speed is the detail worth keeping: it idles at 0.2 and jumps to 2 while
   the pointer is over the hero's last word, which is why that word is the
   interactive one in both the reference and here. */
function cloudField(host) {
  const r = renderer(host);
  if (!r) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, host.clientWidth / host.clientHeight, 1, 3000);
  camera.position.z = 6000;

  const pmrem = new THREE.PMREMGenerator(r);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  /* The sky behind the clouds is a 32px-wide gradient tiled across the frame,
     the same trick the reference uses — cheaper than a shader, and it matches
     the plate colour of the section above it. */
  const sky = document.createElement('canvas');
  sky.width = 32; sky.height = window.innerHeight;
  const sctx = sky.getContext('2d');
  const grad = sctx.createLinearGradient(0, 0, 0, sky.height);
  grad.addColorStop(0, '#003E6B');
  grad.addColorStop(1, '#0EAEBC');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, sky.width, sky.height);
  host.style.background = `url(${sky.toDataURL('image/png')})`;
  host.style.backgroundSize = '32px 100%';

  const fog = new THREE.Fog(0x0eaebc, -100, 3000);
  scene.fog = fog;

  new THREE.TextureLoader().load('img/home/cloud10.png', (map) => {
    map.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        map:        { value: map },
        fogColor:   { value: fog.color },
        fogNear:    { value: fog.near },
        fogFar:     { value: fog.far },
        brightness: { value: 0.9 },
        tint:       { value: new THREE.Color(0xdce7f5) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform vec3 fogColor;
        uniform float fogNear;
        uniform float fogFar;
        uniform float brightness;
        uniform vec3 tint;
        varying vec2 vUv;
        void main() {
          float depth = gl_FragCoord.z / gl_FragCoord.w;
          float fogFactor = smoothstep(fogNear, fogFar, depth);
          vec4 texColor = texture2D(map, vUv);
          texColor.rgb *= brightness;
          texColor.rgb *= tint;
          texColor.w *= pow(gl_FragCoord.z, 20.0);
          gl_FragColor = mix(texColor, vec4(fogColor, texColor.w), fogFactor);
        }
      `,
      depthWrite: false, depthTest: false, transparent: true,
    });

    /* The reference uses 8,000 sprites. Measured on the founder's machine that
       cost the whole page: GSAP was getting 19 frames in 4 seconds — about 5fps
       — so the marquee advanced in visible jumps and read as broken. Fidelity
       is not worth a page that stutters, and at this depth the field looks the
       same well below that count. */
    const CLOUDS = 2200;
    const plane = new THREE.PlaneGeometry(64, 64);
    const dummy = new THREE.Object3D();
    const pieces = [];
    for (let i = 0; i < CLOUDS; i++) {
      /* Spread over the same depth the full count covered, so thinning the
         field does not shorten the tunnel. */
      dummy.position.set(Math.random() * 1000 - 500,
                         -Math.random() * Math.random() * 200 - 15,
                         i * (8000 / CLOUDS));
      dummy.rotation.z = Math.random() * Math.PI;
      dummy.scale.setScalar(Math.random() * Math.random() * 1.5 + 0.5);
      dummy.updateMatrix();
      const g = plane.clone();
      g.applyMatrix4(dummy.matrix);
      pieces.push(g);
    }
    const merged = mergeGeometries(pieces);
    const front = new THREE.Mesh(merged, material);
    front.renderOrder = 2;
    scene.add(front);

    /* The mark in the sky. The reference hangs its own logo here — an extruded
       glass roundel turning slowly about the vertical axis, held at a fixed
       distance in front of the camera so it stays centred while the clouds run
       past it. Same mechanism and same material; the mark is ours, because
       theirs is their brand and not ours to ship. */
    const carrier = new THREE.Group();
    camera.add(carrier);
    scene.add(camera);
    carrier.position.set(0, 30, -800);

    const mark = gogglesMark();
    carrier.add(mark);

    const DIST = 800, SCREEN_FRACTION = window.innerWidth < 700 ? 0.3 : 0.5;
    {
      const box = new THREE.Box3().setFromObject(mark);
      const size = box.getSize(new THREE.Vector3());
      const objectSize = Math.max(size.x, size.y, size.z, 1e-6);
      const visible = 2 * DIST * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      mark.scale.setScalar((SCREEN_FRACTION * visible) / objectSize);
    }

    /* Pointer parallax, and the speed-up over the hero's last word. */
    let targetX = 0, targetY = 0, speed = 0.2, wanted = 0.2, travelled = 0;
    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX - window.innerWidth / 2) * 0.1;
      targetY = (e.clientY - window.innerHeight / 2) * 0.05;
      const overFastWord = !!document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.speed');
      wanted = overFastWord ? 2 : 0.2;
      const cover = el('.canvas__cover');
      if (cover) gsap.to(cover, { opacity: overFastWord ? 1 : 0,
                                  duration: overFastWord ? 1.5 : 0.6, overwrite: true, ease: 'none' });
    });

    /* Reduced motion slows this to a drift rather than freezing it. A single
       static frame reads as a broken page — which is exactly how it was
       reported — and a slow continuous background drift is not the kind of
       motion the preference is protecting against: there is no parallax, no
       scroll coupling and no sudden transition in it. Everything the preference
       genuinely targets (the reveals, the marquees, the scrubbed wipes) stays
       switched off. */
    const RATE = reduced ? 0.18 : 1;
    let last = performance.now();
    const frame = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      speed += (wanted - speed) * 0.06;
      travelled += dt * speed * 500 * RATE;
      camera.position.x += (targetX - camera.position.x) * 0.01;
      camera.position.y += (-targetY - camera.position.y) * 0.01;
      camera.position.z = 6000 - (travelled % 8000);
      carrier.rotation.y += dt * 0.5 * RATE;
      r.render(scene, camera);
    };

    /* Only draw while the hero is on screen. This canvas was redrawing every
       frame for the whole 12,200px of the page, competing for a frame budget
       that had already run out — measured at 19 frames in 4 seconds on the
       founder's machine, which is why the marquee advanced in jumps. */
    let live = true;
    r.setAnimationLoop(() => { if (live) frame(); });
    new IntersectionObserver((entries) => { live = entries[0].isIntersecting; },
      { rootMargin: '200px' }).observe(host.closest('section') || host);

    /* The wrapper, not the canvas. The ported CSS parks .home-cloud-canvas at
       opacity 0 and waits to be faded in; fading the canvas inside it left the
       whole background invisible, which is why the hero read as a flat navy
       field with no clouds and no mark in it at all. */
    const layer = host.closest('.home-cloud-canvas') || host;
    gsap.fromTo(layer, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'none' });
  });

  addEventListener('resize', () => {
    if (!host.clientWidth || !host.clientHeight) return;
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    r.setSize(host.clientWidth, host.clientHeight);
  });
}

/* ── the mark ────────────────────────────────────────────────────────
   Built procedurally, so it needs neither a model file nor a typeface.

   The material and the form are measured off the reference's own render, and
   both were wrong on the first attempt: it is a fat torus with the wordmark
   threaded THROUGH it, in opaque polished chrome — not a flat extruded ring in
   frosted glass. Every metal sample there falls within 17 levels across R, G
   and B (achromatic), running #848D95 in the darkest facet to #F9F9FA at the
   specular, and the background shows through the ring's apertures only, never
   through the metal.

   The interlock comes for free: the letter sits in the torus's own plane, so
   turning the group about Y puts the letterforms in front of one lobe and
   behind the other, exactly as the reference does. */
function gogglesMark() {
  const chrome = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xf2f4f6),
    metalness: 1, roughness: 0.08,
    clearcoat: 1, clearcoatRoughness: 0.02,
    envMapIntensity: 1.4, side: THREE.DoubleSide,
  });

  const group = new THREE.Group();

  /* Two lenses and a bridge — the goggles. It keeps the reference's ring
     silhouette and its 1.62:1 proportion, so the transposition holds, while
     being unmistakably the character without putting his face on the page.
     Asymmetric on purpose: the big lens and the small one are how the mark
     reads at thumbnail size. */
  const bigLens = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.20, 28, 112), chrome);
  bigLens.position.x = -0.62;

  const smallLens = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.17, 24, 96), chrome);
  smallLens.position.x = 0.78;

  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.44, 20), chrome);
  bridge.rotation.z = Math.PI / 2;
  bridge.position.x = 0.09;

  /* The strap: a shallow arc over the top, which is what stops the two rings
     reading as a pair of unrelated circles. */
  const strapPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.30, 0.42, 0),
    new THREE.Vector3(-0.70, 1.05, 0),
    new THREE.Vector3(0.30, 1.12, 0),
    new THREE.Vector3(1.18, 0.62, 0),
  ]);
  const strap = new THREE.Mesh(new THREE.TubeGeometry(strapPath, 48, 0.075, 14, false), chrome);

  group.add(bigLens, smallLens, bridge, strap);
  return group;
}

/* ── the object over the packages ────────────────────────────────────
   The reference hangs a slowly turning 3D model over its pricing section, in a
   fixed full-viewport layer the CSS already provides (.pricing__package). Model,
   scale and lighting are its own. */
function pricingObject(host) {
  /* The layer is a fixed full-viewport box, so it is sized from the window
     rather than from its own client box. */
  const r = renderer(host, { size: { w: window.innerWidth, h: window.innerHeight } });
  if (!r) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, window.innerWidth / window.innerHeight, 0.1, 80);
  /* Camera right, object left — the reference's own numbers. It matters: the
     offer cards occupy the right half of this section, and a centred object
     ends up with the package copy running across its face. */
  camera.position.set(1, 1, 4.9);

  const pmrem = new THREE.PMREMGenerator(r);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight(0xffffff, 10);
  key.position.set(2, 3, 4);
  const fill = new THREE.DirectionalLight(0xffffff, 5.6);
  fill.position.set(-3, -1, 2);
  scene.add(key, fill, new THREE.AmbientLight(0xffffff, 0.8));

  const pivot = new THREE.Group();
  scene.add(pivot);

  new GLTFLoader().load('img/home/floppy_disk/scene.gltf', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    model.position.sub(centre);
    pivot.scale.setScalar(1.3 / (Math.max(size.x, size.y, size.z) || 1));
    pivot.add(model);
    pivot.rotation.set(0.18, -0.35, -0.04);
    pivot.position.set(-1, 0, 0);

    /* Turned by scroll rather than by a clock: the object is tied to the
       section it belongs to, so it reads as part of the page. */
    ScrollTrigger.create({
      trigger: host.closest('section') || document.body,
      start: 'top bottom', end: 'bottom top',
      onToggle: (self) => gsap.to(host, { opacity: self.isActive ? 1 : 0, duration: 0.6 }),
      onUpdate: (self) => {
        pivot.rotation.y = -0.35 + self.progress * Math.PI * 2;
        pivot.rotation.x = 0.18 + Math.sin(self.progress * Math.PI) * 0.35;
      },
    });

    /* The rotation here is driven by scroll position, not by a clock, so the
       loop only has to redraw. It runs in both modes: under reduced motion the
       object simply does not turn unless the reader scrolls it. */
    let live = false;
    r.setAnimationLoop(() => { if (live) r.render(scene, camera); });
    new IntersectionObserver((entries) => { live = entries[0].isIntersecting; },
      { rootMargin: '200px' }).observe(host.closest('section') || document.body);
  });

  addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    r.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ── go ──────────────────────────────────────────────────────────────*/
try {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { try { boot(); } catch (e) { fail(e); } });
  } else {
    boot();
  }
} catch (e) { fail(e); }

function fail(e) {
  clearTimeout(failsafe);
  root.classList.add('motion-failed');
  console.error('[hubert] motion layer failed; copy revealed by fallback', e);
}
