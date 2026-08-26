/* subscribe.js — the list capture, ported from how vektor does it.
 *
 * Two jobs:
 *   1. Point every .sub-form at the Worker's /signup route instead of
 *      Buttondown's embed endpoint.
 *   2. Raise a sticky bar once someone has read far enough to be worth asking,
 *      and never while the real form is already on screen.
 *
 * WHY NOT THE BUTTONDOWN EMBED. Buttondown's embed endpoint always creates an
 * *unactivated* subscriber: the reader has to leave, find a confirmation email
 * and click it before they exist or receive anything. Vektor measured that flow
 * on 2026-08-16 — 15 of 46 non-blocked signups confirmed, 33%. The other 31
 * asked and never got it. There is no setting to turn it off; single opt-in
 * needs the API, which needs a key, which cannot live in a page. Hence the
 * Worker. See vektor/reports/2026-08-16-buttondown-audit.md.
 *
 * THE CONSENT TRADE IS DELIBERATE. Single opt-in means an address can land on
 * the list without proving it owns the inbox. Mitigations: the consent checkbox
 * on every form is required and is the lawful-basis record, we send what we
 * promised, unsubscribe stays one click, and the complaint rate gets watched.
 * If complaints climb, this is the first thing to revert.
 *
 * DEGRADES SAFELY. Until the Worker is deployed, SIGNUP_ENDPOINT is empty and
 * the forms keep their existing Buttondown action, which still works — just
 * with the confirmation step. Nothing breaks before deploy.
 */
(function () {
  "use strict";

  // Set this to the deployed Worker origin + /signup, e.g.
  // "https://ig-dm-webhook.<subdomain>.workers.dev/signup".
  // Empty string = leave the forms alone and use their HTML action.
  var SIGNUP_ENDPOINT = "";

  var DISMISS_KEY = "hti-sticky-dismissed";
  var DISMISS_DAYS = 30;

  function count(path) {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: path, event: true });
    }
  }

  /* ---------- 1. forms ---------- */

  var page = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "") || "index";

  Array.prototype.forEach.call(document.querySelectorAll("form.sub-form"), function (form) {
    // Honeypot. A real person never sees it; bots fill every input they find.
    // The Worker treats a filled `company` as a silent success so the bot
    // learns nothing.
    var pot = document.createElement("input");
    pot.type = "text";
    pot.name = "company";
    pot.tabIndex = -1;
    pot.autocomplete = "off";
    pot.setAttribute("aria-hidden", "true");
    pot.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;opacity:0";
    form.appendChild(pot);

    // Which page and which CTA earned the subscriber. Without this the source
    // exists only as a GoatCounter event and can never be joined to a person.
    var tag = form.querySelector('input[name="tag"]');
    if (!tag) {
      tag = document.createElement("input");
      tag.type = "hidden";
      tag.name = "tag";
      form.appendChild(tag);
    }
    if (!tag.value) tag.value = page;

    if (SIGNUP_ENDPOINT) {
      form.setAttribute("action", SIGNUP_ENDPOINT);
      form.setAttribute("method", "post");
      // These exist only to drive Buttondown's embed flow. With the Worker they
      // would open a stray window on submit.
      form.removeAttribute("target");
      form.removeAttribute("onsubmit");
    }

    form.addEventListener("submit", function () {
      count("subscribe-" + (tag.value || page));
    });
  });

  /* ---------- 2. the sticky bar ---------- */

  var anchor = document.querySelector("form.sub-form");
  if (!anchor) return;

  var main = document.querySelector("main") || document.body;

  function dismissedRecently() {
    try {
      var until = parseInt(localStorage.getItem(DISMISS_KEY) || "0", 10);
      return until > Date.now();
    } catch (e) {
      return false; // private mode; a bar that reappears beats a crash
    }
  }
  if (dismissedRecently()) return;

  var bar = document.createElement("div");
  bar.className = "sticky-sub";
  bar.id = "stickySub";
  bar.setAttribute("aria-hidden", "true");
  bar.innerHTML =
    '<span class="t">New guide every few days. <b>Get it when it lands.</b></span>' +
    '<span class="r">' +
    '<a class="go" href="#subscribe">Subscribe →</a>' +
    '<button class="x" type="button" aria-label="Dismiss">×</button>' +
    "</span>";
  document.body.appendChild(bar);

  // Give the form section an id to jump to, if it hasn't got one.
  var section = anchor.closest("section") || anchor.parentElement;
  if (section && !section.id) section.id = "subscribe";

  var dismissed = false;

  function update() {
    if (dismissed) return;
    // Two conditions, both from vektor's version: far enough down the page to
    // have got something out of it, and NOT while the real form is on screen —
    // asking twice in one viewport is what makes these things obnoxious.
    var readEnough =
      (window.scrollY + window.innerHeight) / Math.max(main.scrollHeight, 1) > 0.55;
    var r = anchor.getBoundingClientRect();
    var formVisible = r.top < window.innerHeight && r.bottom > 0;
    var show = readEnough && !formVisible;
    bar.classList.toggle("show", show);
    bar.setAttribute("aria-hidden", show ? "false" : "true");
  }

  // Exit intent, desktop only: pointer leaving through the top of the window.
  // Deliberately not wired on touch, where there is no such gesture and the
  // nearest equivalents all fire by accident.
  document.addEventListener("mouseout", function (e) {
    if (dismissed || e.relatedTarget || e.clientY > 12) return;
    if (window.matchMedia("(hover: none)").matches) return;
    bar.classList.add("show");
    bar.setAttribute("aria-hidden", "false");
  });

  bar.querySelector(".x").addEventListener("click", function () {
    dismissed = true;
    bar.classList.remove("show");
    bar.setAttribute("aria-hidden", "true");
    count("sticky-dismiss-" + page);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 864e5));
    } catch (e) {
      /* private mode */
    }
  });

  bar.querySelector(".go").addEventListener("click", function () {
    count("sticky-subscribe-" + page);
  });

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
