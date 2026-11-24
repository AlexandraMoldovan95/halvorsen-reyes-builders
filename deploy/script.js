(function () {
  "use strict";

  var CFG = window.HR_CONFIG || {};
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  function validateForm(data) {
    var errors = {};
    if (!data.nume || data.nume.trim().length < 2) errors["f-nume"] = "Enter your full name.";
    if (!data.telefon || data.telefon.replace(/\D/g, "").length < 7) errors["f-telefon"] = "Invalid phone number.";
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRe.test(data.email)) errors["f-email"] = "Invalid email address.";
    if (!data.tip_proiect) errors["f-tip"] = "Choose a project type.";
    if (!data.mesaj || data.mesaj.trim().length < 10) errors["f-mesaj"] = "Give us a few more words (min. 10 characters).";
    return errors;
  }

  if (leadForm) {
    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      ["f-nume", "f-telefon", "f-email", "f-tip", "f-mesaj"].forEach(function (id) { setFieldError(id); });
      formStatus.textContent = "";
      formStatus.className = "form-status";

      var fd = new FormData(leadForm);
      var data = Object.fromEntries(fd.entries());
      var errors = validateForm(data);

      if (Object.keys(errors).length > 0) {
        Object.keys(errors).forEach(function (id) { setFieldError(id, errors[id]); });
        formStatus.textContent = "Check the fields marked above.";
        formStatus.classList.add("error");
        return;
      }

      if (!CFG.SUPABASE_URL || CFG.SUPABASE_URL.indexOf("TODO") !== -1) {
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
        body: JSON.stringify({
          nume: data.nume.trim(),
          email: data.email.trim(),
          telefon: data.telefon.trim(),
          tip_proiect: data.tip_proiect,
          buget_estimat: data.buget_estimat || null,
          mesaj: data.mesaj.trim(),
        }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Server error: " + res.status);
          leadForm.reset();
          formStatus.textContent = "Your request has been sent. Camila will get back to you within one business day.";
          formStatus.classList.add("success");
          setTimeout(closeForm, 2200);
        })
        .catch(function (err) {
          formStatus.textContent = "This form can't reach our server right now — call (555) 010-2411 or email hello@hr-builders.example and Camila will get back to you directly.";
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

  function openChat() {
    chatPanel.classList.add("open");
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
  if (chatLauncher) {
    chatLauncher.addEventListener("click", function () {
      chatPanel.classList.contains("open") ? closeChat() : openChat();
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
    var m = msg.toLowerCase();
    var answer;
    if (/hour|open|schedule|when/.test(m)) {
      answer = "We're open Monday–Friday, 8:00 AM–5:00 PM.";
    } else if (/where|location|area|denver|radius/.test(m)) {
      answer = "We work in Denver, Colorado and within a 50 km radius.";
    } else if (/price|cost|budget|quote|estimate|much/.test(m)) {
      answer = "Every project gets its own quote based on scope — the fastest way is the quote form on this page, or tell me a bit more about what you're planning.";
    } else if (/service|turnkey|renovat|addition|build/.test(m)) {
      answer = "We do three things: turnkey homes, full renovations, and additions — from an empty lot to handing over the keys, or just the extra space you need.";
    } else if (/contact|phone|email|call|reach/.test(m)) {
      answer = "Call (555) 010-2411 or email hello@hr-builders.example — Camila usually replies the same business day.";
    } else {
      answer = "I don't have a specific answer for that one — the quote form on this page is the fastest way to reach Camila directly, or call (555) 010-2411.";
    }
    if (!usedChatFallbackNotice) {
      usedChatFallbackNotice = true;
      return "(The AI assistant is switched off between live demos to keep running costs at zero, so I'm answering from a short local script instead.) " + answer;
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

      if (!CFG.SUPABASE_URL || CFG.SUPABASE_URL.indexOf("TODO") !== -1) {
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
