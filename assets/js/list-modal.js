/* list-modal.js — the newsletter dialog on the landing page.
 *
 * Founder instruction 2026-08-29: appear as soon as the page opens.
 *
 * DELAY_MS is the whole timing policy. 0 is what was asked for. 2026 aggregate
 * data puts immediate popups at 1.9% conversion and 6-10s-delayed ones at 2.4%,
 * so setting this to 6000 is expected to be worth roughly a quarter more
 * signups. It is one number precisely so that is a one-line decision later.
 *
 * WHAT IT WILL NOT DO:
 * - show twice. A dismissal or a submit is remembered for 60 days.
 * - show to someone who arrived at an anchor (e.g. /#pricing). They came for
 *   the form; covering it with the same form is insulting.
 * - show before the reading-plate boot has set the theme, which would flash the
 *   dialog in the wrong colours.
 * - trap anyone. It is a native <dialog>: Esc closes it, focus is managed by
 *   the browser, and the page behind is inert.
 *
 * The key it writes, hubert:list, is disclosed in privacy.html.
 */
(function () {
  "use strict";

  var DELAY_MS = 0;                 // founder's call: immediately
  var KEY = "hubert:list";
  var REMEMBER_DAYS = 60;

  var dialog = document.getElementById("list-modal");
  if (!dialog || typeof dialog.showModal !== "function") return;

  function seen() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return false;
      var rec = JSON.parse(raw);
      if (!rec || !rec.until) return false;
      if (Date.now() > rec.until) { localStorage.removeItem(KEY); return false; }
      return true;
    } catch (e) { return false; }
  }

  function remember(how) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        state: how,
        until: Date.now() + REMEMBER_DAYS * 86400000
      }));
    } catch (e) { /* private mode — it just shows again next visit */ }
  }

  if (seen()) return;
  if (location.hash) return;        // they deep-linked somewhere specific

  function open() {
    if (dialog.open) return;
    dialog.showModal();
  }

  dialog.addEventListener("close", function () { remember("dismissed"); });

  var closeBtn = dialog.querySelector("[data-close]");
  if (closeBtn) closeBtn.addEventListener("click", function () { dialog.close(); });

  // A submit posts away to Buttondown, so this only has to record that they did
  // it — the page is leaving anyway.
  var form = dialog.querySelector("form");
  if (form) form.addEventListener("submit", function () { remember("joined"); });

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
