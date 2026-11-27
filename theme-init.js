/* Runs in <head>, before the page is drawn, so the page never flashes in the wrong theme:
   the visitor's saved choice from the header button, or on a first visit the system's
   dark/light setting. A separate file, not an inline script: the site's Content-Security-Policy
   only runs scripts loaded from the site itself. pickTheme() comes from logic.js, loaded just
   before this file. */
(function () {
  var saved = null;
  try {
    saved = localStorage.getItem("hr-theme");
  } catch (e) {
    // Storage blocked (private mode, strict settings): the system setting decides.
  }
  var systemDark = !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", pickTheme(saved, systemDark));
})();
