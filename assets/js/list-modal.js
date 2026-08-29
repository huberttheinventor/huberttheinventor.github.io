/* list-modal.js — the newsletter dialog on the landing page.
 *
 * Founder instructions, 2026-08-29:
 *   1. appear as soon as the landing page opens  → DELAY_MS = 0
 *   2. come back on repeat visits                → SHOW_EVERY = 2
 *
 * DELAY_MS is the whole timing policy. First set to 0 (instant), then changed
 * to 6500 on the founder's follow-up instruction after seeing the 2026 data:
 * immediate popups convert at 1.9% against 2.4% for ones delayed 6-10s. 6500ms
 * sits mid-range in that window. It is one number precisely so this stays a
 * one-line decision.
 *
 * SHOW_EVERY is the frequency policy. 2 means every second page load after a
 * dismissal; 1 means every single one.
 *
 * THE ONE EXCEPTION, AND WHY IT IS NOT A SETTING. Someone who submitted the
 * form never sees this again. They have already given the thing it asks for, and
 * a site that keeps demanding an email you have already handed over does not
 * read as persistent, it reads as broken — and the people it annoys are the
 * subscribers, the only audience here that is actually worth something.
 * Dismissers are a different case: they said "not now", which is a fair thing to
 * ask again.
 *
 * WHAT IT STILL WILL NOT DO:
 * - show to someone who arrived at an anchor (e.g. /#pricing). They came for the
 *   form; covering it with the same form is insulting.
 * - trap anyone. It is a native <dialog>: Esc closes it, focus is the browser's,
 *   and the page behind is inert.
 *
 * The key it writes, hubert:list, is disclosed in privacy.html.
 */
(function () {
  "use strict";

  var DELAY_MS = 6500;   // founder's call: mid-range of the 6-10s delayed-popup window
  var SHOW_EVERY = 2;    // founder's call: every second visit after a dismissal
  var KEY = "hubert:list";

  var dialog = document.getElementById("list-modal");
  if (!dialog || typeof dialog.showModal !== "function") return;

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var rec = JSON.parse(raw);
      return rec && typeof rec === "object" ? rec : null;
    } catch (e) { return null; }
  }

  function write(rec) {
    try { localStorage.setItem(KEY, JSON.stringify(rec)); }
    catch (e) { /* private mode — it simply shows every time */ }
  }

  var rec = read();

  // Joined already. Never again.
  if (rec && rec.state === "joined") return;

  // They came for a specific part of the page.
  if (location.hash) return;

  var show;
  if (!rec) {
    show = true;                       // first visit
  } else {
    var n = (Number(rec.n) || 0) + 1;  // loads since they dismissed it
    write({ state: "dismissed", n: n });
    show = SHOW_EVERY <= 1 || n % SHOW_EVERY === 0;
  }
  if (!show) return;

  function open() {
    if (!dialog.open) dialog.showModal();
  }

  // Reset the counter on each dismissal so the cadence is "every SHOW_EVERY
  // loads after the LAST no", not "after the first one".
  dialog.addEventListener("close", function () {
    var cur = read();
    if (cur && cur.state === "joined") return;
    write({ state: "dismissed", n: 0 });
  });

  var closeBtn = dialog.querySelector("[data-close]");
  if (closeBtn) closeBtn.addEventListener("click", function () { dialog.close(); });

  // A submit posts away to Buttondown, so this only has to record that they did
  // it — the page is leaving anyway.
  var form = dialog.querySelector("form");
  if (form) form.addEventListener("submit", function () { write({ state: "joined", n: 0 }); });

  // Clicking the backdrop closes. <dialog> reports backdrop clicks as clicks on
  // the dialog itself, so compare against its box rather than trusting target.
  dialog.addEventListener("click", function (e) {
    if (e.target !== dialog) return;
    var r = dialog.getBoundingClientRect();
    var inside = e.clientX >= r.left && e.clientX <= r.right &&
                 e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) dialog.close();
  });

  if (DELAY_MS <= 0) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", open, { once: true });
    } else { open(); }
  } else {
    setTimeout(open, DELAY_MS);
  }
})();
