(function () {
  "use strict";

  var CFG = window.HR_CONFIG || {};
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Footer year (was an inline <script>; moved here so the CSP needs no inline scripts) */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===================== MOBILE NAV ===================== */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  function closeMobileNav() {
    if (!mobileNav || !mobileNav.classList.contains("open")) return;
    mobileNav.classList.remove("open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobileNav.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("click", closeMobileNav);
    });
  }

  /* ===================== HERO: word split + shrink on scroll ===================== */
  var heroTitle = document.getElementById("heroTitle");
  if (heroTitle) {
    var words = heroTitle.textContent.trim().split(/\s+/);
    // The space has to be a text node BETWEEN spans (join(" ")), not inside each
    // span — otherwise, with the spans as inline-block, the words end up glued together.
    // Built with DOM nodes, not innerHTML — the text is never re-interpreted as HTML.
    heroTitle.textContent = "";
    words.forEach(function (w, i) {
      if (i > 0) heroTitle.appendChild(document.createTextNode(" "));
      var span = document.createElement("span");
      span.className = "word";
      span.textContent = w;
      heroTitle.appendChild(span);
    });
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    if (!prefersReducedMotion) {
      var wordSpans = heroTitle ? heroTitle.querySelectorAll(".word") : [];
      gsap.set(wordSpans, { yPercent: 110, opacity: 0 });
      gsap.to(wordSpans, {
        yPercent: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.06,
        ease: "power3.out",
        delay: 0.15,
      });

      var heroMedia = document.querySelector(".hero-media");
      if (heroMedia) {
        gsap.to(heroMedia, {
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
          scale: 0.86,
          borderRadius: 0,
          ease: "none",
        });
        gsap.set(heroMedia, { transformOrigin: "center top" });
      }

      // Portfolio: reveal on scroll (fade + slide-up), no pin — the page stays
      // freely vertical-scrolling at all times, never "sticks" to the section.
      var portfolioSection = document.querySelector("#portofoliu");
      if (portfolioSection) {
        var portfolioReveal = portfolioSection.querySelectorAll(
          ".head .eyebrow, .head .section-title, .head .section-lede, .portfolio-carousel, .portfolio-progress"
        );
        if (portfolioReveal.length) {
          gsap.set(portfolioReveal, { opacity: 0, y: 40 });
          gsap.to(portfolioReveal, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: "#portofoliu",
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
          });
        }

        // Light parallax on the project photos: scaled up as a buffer, so no gaps
        // appear at the edges when the image shifts on scroll (scrub, no pin).
        var portfolioImages = portfolioSection.querySelectorAll(".project-media img.project-hero-img");
        if (portfolioImages.length) {
          gsap.set(portfolioImages, { scale: 1.15, transformOrigin: "center center" });
          gsap.to(portfolioImages, {
            yPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: "#portofoliu",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      }
    }
  }

  /* ===================== PORTFOLIO: arrow-driven carousel, vertical scroll only =====================
     No pin, no horizontal scroll — the page scrolls normally, vertically. Moving
     between the 5 projects is explicit, via the left/right buttons or the dots. */
  (function initPortfolioCarousel() {
    var track = document.getElementById("portfolioTrack");
    var prevBtn = document.getElementById("portfolioPrev");
    var nextBtn = document.getElementById("portfolioNext");
    var dots = document.querySelectorAll("#portfolioProgress .dot");
    if (!track) return;

    var panels = track.querySelectorAll(".project-panel");
    var currentIndex = 0;

    var announceEl = document.getElementById("portfolioAnnounce");

    /* Photos in panels 2-5 have data-src/data-srcset in the HTML, so they don't
       download on page load (they competed with the hero image on mobile).
       We load them when a panel becomes current, plus its neighbors, so moving
       between projects never shows an empty panel. */
    function hydratePanel(i) {
      var panel = panels[i];
      if (!panel || panel.dataset.hydrated) return;
      panel.dataset.hydrated = "1";
      panel.querySelectorAll("img[data-src]").forEach(function (img) {
        // "eager" before src: the neighboring panel is off-screen, and with
        // "lazy" the browser would defer the download until a click.
        img.loading = "eager";
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        img.removeAttribute("data-srcset");
      });
    }

    var pageLoaded = false;

    function update() {
      hydratePanel(currentIndex);
      hydratePanel(currentIndex - 1);
      // Next neighbor only after "load" — otherwise everything would download at startup.
      if (pageLoaded) hydratePanel(currentIndex + 1);
      track.style.transform = "translateX(-" + currentIndex * 100 + "%)";
      dots.forEach(function (d, i) {
        var active = i === currentIndex;
        d.classList.toggle("active", active);
        if (active) { d.setAttribute("aria-current", "true"); } else { d.removeAttribute("aria-current"); }
      });
      panels.forEach(function (p, i) {
        if (i === currentIndex) { p.removeAttribute("inert"); } else { p.setAttribute("inert", ""); }
      });
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === panels.length - 1;
      if (announceEl) {
        var titleEl = panels[currentIndex] ? panels[currentIndex].querySelector("h3") : null;
        var title = titleEl ? titleEl.textContent : "";
        announceEl.textContent = "Project " + (currentIndex + 1) + " of " + panels.length + (title ? ": " + title : "");
      }
    }

    function goTo(index) {
      currentIndex = Math.max(0, Math.min(panels.length - 1, index));
      update();
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(currentIndex + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { goTo(i); });
    });

    update();

    function onPageLoaded() {
      pageLoaded = true;
      hydratePanel(currentIndex + 1);
    }
    if (document.readyState === "complete") { onPageLoaded(); }
    else { window.addEventListener("load", onPageLoaded); }
  })();

  /* ===================== PHOTO VIEWER: a project's photos, full size =====================
     Each photo in a project panel (the large one and the three small ones) is a button whose
     data-full is its 1600px file. A click opens that project's photos in a <dialog>: the
     browser keeps the keyboard inside it and closes it on Escape; here we add the arrows, the
     caption (the photo's own alt text) and closing on a click outside the photo. On close,
     focus goes back to the photo that was clicked. */
  (function initPhotoViewer() {
    var viewer = document.getElementById("photoViewer");
    // A browser without <dialog> support: the photos simply stay as they are on the page.
    if (!viewer || typeof viewer.showModal !== "function") return;
    var imgEl = document.getElementById("pvImg");
    var textEl = document.getElementById("pvText");
    var countEl = document.getElementById("pvCount");
    var prevBtn = document.getElementById("pvPrev");
    var nextBtn = document.getElementById("pvNext");
    var photos = [];   // { src, caption } for each photo of the open project
    var index = 0;
    var opener = null;

    function show() {
      var p = photos[index];
      imgEl.src = p.src;
      imgEl.alt = p.caption;
      textEl.textContent = p.caption;
      countEl.textContent = (index + 1) + " / " + photos.length;
      prevBtn.hidden = nextBtn.hidden = photos.length < 2;
      // Start downloading the next photo now, so "next" shows it without a wait.
      if (photos.length > 1) new Image().src = photos[stepPhoto(index, 1, photos.length)].src;
    }
    function step(delta) {
      index = stepPhoto(index, delta, photos.length);
      show();
    }

    document.querySelectorAll(".project-media").forEach(function (media) {
      var buttons = media.querySelectorAll(".project-photo[data-full]");
      buttons.forEach(function (btn, i) {
        btn.addEventListener("click", function () {
          photos = Array.prototype.map.call(buttons, function (b) {
            var img = b.querySelector("img");
            return { src: b.dataset.full, caption: img ? img.alt : "" };
          });
          index = i;
          opener = btn;
          show();
          document.body.style.overflow = "hidden";
          viewer.showModal();
        });
      });
    });

    prevBtn.addEventListener("click", function () { step(-1); });
    nextBtn.addEventListener("click", function () { step(1); });
    document.getElementById("pvClose").addEventListener("click", function () { viewer.close(); });
    // A click on the dark area around the photo (the dialog itself, not what's inside it) closes it.
    viewer.addEventListener("click", function (e) { if (e.target === viewer) viewer.close(); });
    viewer.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      // The dialog closes itself on Escape; this keeps the page's own Escape handler
      // (which closes the chat) from running for the same key press.
      else if (e.key === "Escape") { e.stopPropagation(); }
    });
    viewer.addEventListener("close", function () {
      document.body.style.overflow = "";
      if (opener && opener.focus) opener.focus();
    });
  })();

  /* ===================== DARK / LIGHT THEME BUTTON =====================
     theme-init.js already set data-theme before the page was drawn; this button switches
     it and saves the choice, which then wins over the system setting on the next visit.
     aria-pressed tells screen readers whether the dark theme is on. */
  (function initThemeToggle() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    var root = document.documentElement;
    function sync() {
      btn.setAttribute("aria-pressed", root.getAttribute("data-theme") === "dark" ? "true" : "false");
    }
    sync();
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("hr-theme", next); } catch (e) { /* not saved: it lasts for this visit */ }
      sync();
    });
  })();

  /* ===================== QUOTE FORM MODAL ===================== */
  var overlay = document.getElementById("formOverlay");
  var openTriggers = document.querySelectorAll("[data-open-form]");
  var closeBtn = document.getElementById("formClose");

  var lastFocused = null;

  var modalEl = overlay ? overlay.querySelector(".modal") : null;

  function getFocusable(container) {
    return Array.prototype.filter.call(
      container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function trapFocus(e) {
    if (e.key !== "Tab" || !modalEl) return;
    var focusable = getFocusable(modalEl);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openForm() {
    lastFocused = document.activeElement;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", trapFocus);
    var first = overlay.querySelector("input, select, textarea");
    if (first) first.focus();
  }
  function closeForm() {
    if (!overlay.classList.contains("open")) return;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", trapFocus);
    // Return focus to the button that opened the form (keyboard navigation).
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  openTriggers.forEach(function (btn) { btn.addEventListener("click", openForm); });
  if (closeBtn) closeBtn.addEventListener("click", closeForm);
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeForm();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (overlay && overlay.classList.contains("open")) { closeForm(); return; }
    if (chatPanel && chatPanel.classList.contains("open")) { closeChat(); return; }
    closeMobileNav();
  });

  /* ===================== FORM VALIDATION + SUBMIT ===================== */
  var leadForm = document.getElementById("leadForm");
  var formStatus = document.getElementById("formStatus");
  var submitBtn = document.getElementById("leadSubmit");

  function setFieldError(id, message) {
    var errEl = document.querySelector('[data-error-for="' + id + '"]');
    var fieldEl = document.getElementById(id);
    if (errEl) errEl.textContent = message || "";
    if (fieldEl) {
      fieldEl.classList.toggle("invalid", !!message);
      fieldEl.setAttribute("aria-invalid", message ? "true" : "false");
    }
  }

  /* The checks themselves (validateLeadForm), the row sent to Supabase (buildLeadPayload) and
     isBackendConfigured are in logic.js, with tests in tests/logic.test.js. */

  if (leadForm) {
    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      ["f-nume", "f-telefon", "f-email", "f-tip", "f-mesaj"].forEach(function (id) { setFieldError(id); });
      formStatus.textContent = "";
      formStatus.className = "form-status";

      var fd = new FormData(leadForm);
      var data = Object.fromEntries(fd.entries());
      var errors = validateLeadForm(data);

      if (Object.keys(errors).length > 0) {
        Object.keys(errors).forEach(function (id) { setFieldError(id, errors[id]); });
        formStatus.textContent = "Check the fields marked above.";
        formStatus.classList.add("error");
        return;
      }

      if (!isBackendConfigured(CFG)) {
        formStatus.textContent = "The form isn't connected to Supabase yet (see config.js).";
        formStatus.classList.add("error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      fetch(CFG.SUPABASE_URL + "/rest/v1/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: CFG.SUPABASE_ANON_KEY,
          Authorization: "Bearer " + CFG.SUPABASE_ANON_KEY,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(buildLeadPayload(data)),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Server error: " + res.status);
          leadForm.reset();
          formStatus.textContent = "Your request has been sent. Camila will get back to you within one business day.";
          formStatus.classList.add("success");
          setTimeout(closeForm, 2200);
        })
        .catch(function (err) {
          formStatus.textContent = "This form can't reach our server right now. Call (555) 010-2411 or email hello@hr-builders.example and Camila will get back to you directly.";
          formStatus.classList.add("error");
          console.error(err);
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send request";
        });
    });
  }

  /* ===================== CHATBOT ===================== */
  var chatLauncher = document.getElementById("chatLauncher");
  var chatPanel = document.getElementById("chatPanel");
  var chatClose = document.getElementById("chatClose");
  var chatBody = document.getElementById("chatBody");
  var chatAnnounce = document.getElementById("chatAnnounce");
  var chatForm = document.getElementById("chatForm");
  var chatInput = document.getElementById("chatInput");

  /* The bubble can be dragged anywhere on the page (mouse, finger or pen).
     A move shorter than DRAG_THRESHOLD counts as a click and opens the chat;
     a longer one moves the bubble, and the click that ends it is ignored.
     The position isn't saved: every visit starts from the CSS default. */
  var DRAG_THRESHOLD = 6; // px
  var EDGE = 8;           // px kept free between the bubble/panel and the window edge
  var launcherMoved = false;
  var drag = null;
  var ignoreClickUntil = 0;

  function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

  // Puts a fixed element at (left, top), kept fully inside the window.
  function placeAt(el, left, top) {
    var maxLeft = document.documentElement.clientWidth - el.offsetWidth - EDGE;
    var maxTop = window.innerHeight - el.offsetHeight - EDGE;
    el.style.left = clamp(left, EDGE, Math.max(EDGE, maxLeft)) + "px";
    el.style.top = clamp(top, EDGE, Math.max(EDGE, maxTop)) + "px";
    el.style.right = "auto";
    el.style.bottom = "auto";
  }

  // Once the bubble has been moved, the panel opens next to it: above it if
  // there's room (below otherwise), on the side of the window the bubble is on.
  // Until then the panel keeps its CSS position.
  function placePanel() {
    if (!launcherMoved || !chatPanel.classList.contains("open")) return;
    var b = chatLauncher.getBoundingClientRect();
    var w = chatPanel.offsetWidth, h = chatPanel.offsetHeight, gap = 8;
    var onRight = b.left + b.width / 2 > document.documentElement.clientWidth / 2;
    var left = onRight ? b.right - w : b.left;
    var top = b.top - gap - h >= EDGE ? b.top - gap - h : b.bottom + gap;
    placeAt(chatPanel, left, top);
  }

  function openChat() {
    chatPanel.classList.add("open");
    placePanel();
    if (chatLauncher) chatLauncher.setAttribute("aria-expanded", "true");
    chatInput.focus();
  }
  function closeChat() {
    if (!chatPanel.classList.contains("open")) return;
    chatPanel.classList.remove("open");
    if (chatLauncher) {
      chatLauncher.setAttribute("aria-expanded", "false");
      chatLauncher.focus();
    }
  }
  function toggleChat() {
    chatPanel.classList.contains("open") ? closeChat() : openChat();
  }
  if (chatLauncher) {
    chatLauncher.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return; // main mouse button, finger or pen only
      var b = chatLauncher.getBoundingClientRect();
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY,
               dx: e.clientX - b.left, dy: e.clientY - b.top, moved: false };
      chatLauncher.setPointerCapture(e.pointerId); // keep getting moves even off the bubble
    });
    chatLauncher.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) < DRAG_THRESHOLD) return;
      drag.moved = true;
      launcherMoved = true;
      chatLauncher.classList.add("dragging");
      placeAt(chatLauncher, e.clientX - drag.dx, e.clientY - drag.dy);
      placePanel(); // an open panel follows the bubble
    });
    var endDrag = function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var wasDrag = drag.moved;
      chatLauncher.classList.remove("dragging");
      drag = null;
      // The browser's own "click" that follows is ignored either way: after a drag
      // it isn't a click, and after a tap the chat is toggled right here (on phones
      // the browser sometimes skips that click, e.g. right after a quick flick).
      ignoreClickUntil = Date.now() + 500;
      if (!wasDrag && e.type === "pointerup") toggleChat();
    };
    chatLauncher.addEventListener("pointerup", endDrag);
    chatLauncher.addEventListener("pointercancel", endDrag);

    // Keyboard (Enter / Space) still arrives as a plain click.
    chatLauncher.addEventListener("click", function () {
      if (Date.now() < ignoreClickUntil) { ignoreClickUntil = 0; return; }
      toggleChat();
    });

    // A smaller window (or a phone turned sideways) must not leave the bubble outside it.
    window.addEventListener("resize", function () {
      if (!launcherMoved) return;
      var b = chatLauncher.getBoundingClientRect();
      placeAt(chatLauncher, b.left, b.top);
      placePanel();
    });
  }
  if (chatClose) chatClose.addEventListener("click", closeChat);

  /* Local fallback for when the real chat backend can't answer (the AI key is
     switched off between live demos, or the project's Supabase instance is
     paused). Keyword-matched, not an LLM —
     just enough to keep the demo honest and useful instead of looking
     broken. The real fetch below is always tried first; this only runs on
     failure, so it self-heals the moment the backend comes back. */
  var usedChatFallbackNotice = false;
  function localBotReply(msg) {
    var answer = localBotAnswer(msg);   // the keyword answers: logic.js
    if (!usedChatFallbackNotice) {
      usedChatFallbackNotice = true;
      return CHAT_FALLBACK_NOTICE + answer;
    }
    return answer;
  }

  function appendMessage(text, who) {
    var div = document.createElement("div");
    div.className = "chat-msg " + who;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    // Only the bot's final replies are announced to screen readers — not the
    // user's own message (they already know what they typed) and not the "Typing..." indicator.
    if (who === "bot" && chatAnnounce) chatAnnounce.textContent = text;
    return div;
  }

  if (chatForm) {
    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = chatInput.value.trim();
      if (!msg) return;
      appendMessage(msg, "user");
      chatInput.value = "";

      if (!isBackendConfigured(CFG)) {
        appendMessage("Chat isn't connected to the backend yet (see config.js and SUPABASE_SETUP.md).", "bot");
        return;
      }

      var typing = appendMessage("Typing...", "bot typing");

      fetch(CFG.SUPABASE_URL + "/functions/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: CFG.SUPABASE_ANON_KEY,
          Authorization: "Bearer " + CFG.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ message: msg }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Server error: " + res.status);
          return res.json();
        })
        .then(function (data) {
          typing.remove();
          appendMessage(data.reply || "Couldn't generate a reply right now.", "bot");
        })
        .catch(function (err) {
          typing.remove();
          appendMessage(localBotReply(msg), "bot");
          console.error(err);
        });
    });
  }
})();
