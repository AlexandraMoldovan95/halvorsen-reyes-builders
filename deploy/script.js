(function () {
  "use strict";

  var CFG = window.HR_CONFIG || {};
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ===================== NAV MOBIL ===================== */
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

  /* ===================== HERO: split cuvinte + shrink la scroll ===================== */
  var heroTitle = document.getElementById("heroTitle");
  if (heroTitle) {
    var words = heroTitle.textContent.trim().split(/\s+/);
    // Spațiul trebuie să fie un nod de text ÎNTRE span-uri (join(" ")), nu în interiorul
    // fiecărui span — altfel, cu span-urile pe inline-block, cuvintele apar lipite.
    // Construit cu noduri DOM, nu innerHTML — textul nu e niciodată re-interpretat ca HTML.
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

      // Portofoliu: reveal la scroll (fade + slide-up), fără pin — pagina rămâne
      // scroll vertical liber tot timpul, nu se "agață" de secțiune.
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

        // Parallax ușor pe pozele proiectelor: scale-up ca buffer, ca să nu apară
        // goluri la margini când imaginea se deplasează pe scroll (scrub, fără pin).
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

  /* ===================== PORTOFOLIU: carusel pe săgeți, scroll doar vertical =====================
     Fără pin, fără scroll orizontal — pagina defilează normal, vertical. Trecerea
     între cele 5 proiecte se face explicit, cu butoanele stânga/dreapta sau cu punctele. */
  (function initPortfolioCarousel() {
    var track = document.getElementById("portfolioTrack");
    var prevBtn = document.getElementById("portfolioPrev");
    var nextBtn = document.getElementById("portfolioNext");
    var dots = document.querySelectorAll("#portfolioProgress .dot");
    if (!track) return;

    var panels = track.querySelectorAll(".project-panel");
    var currentIndex = 0;

    var announceEl = document.getElementById("portfolioAnnounce");

    /* Pozele din panourile 2–5 au data-src/data-srcset în HTML, ca să nu se
       descarce la încărcarea paginii (concurau cu poza din hero pe mobil).
       Le încărcăm când panoul devine curent, plus vecinii lui, ca trecerea
       între proiecte să nu arate un panou gol. */
    function hydratePanel(i) {
      var panel = panels[i];
      if (!panel || panel.dataset.hydrated) return;
      panel.dataset.hydrated = "1";
      panel.querySelectorAll("img[data-src]").forEach(function (img) {
        // "eager" înainte de src: panoul vecin e în afara ecranului, iar cu
        // "lazy" browserul ar amâna descărcarea până la click.
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
      // Vecinul următor abia după "load" — altfel s-ar descărca tot la pornire.
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
        announceEl.textContent = "Proiectul " + (currentIndex + 1) + " din " + panels.length + (title ? ": " + title : "");
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

  /* ===================== MODAL FORMULAR ===================== */
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
    // Întoarce focusul pe butonul care a deschis formularul (navigare cu tastatura).
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

  /* ===================== VALIDARE + TRIMITERE FORMULAR ===================== */
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
    if (!data.nume || data.nume.trim().length < 2) errors["f-nume"] = "Introdu numele complet.";
    if (!data.telefon || data.telefon.replace(/\D/g, "").length < 7) errors["f-telefon"] = "Număr de telefon invalid.";
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRe.test(data.email)) errors["f-email"] = "Adresă de email invalidă.";
    if (!data.tip_proiect) errors["f-tip"] = "Alege tipul de proiect.";
    if (!data.mesaj || data.mesaj.trim().length < 10) errors["f-mesaj"] = "Spune-ne câteva cuvinte în plus (min. 10 caractere).";
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
        formStatus.textContent = "Verifică datele marcate mai sus.";
        formStatus.classList.add("error");
        return;
      }

      if (!CFG.SUPABASE_URL || CFG.SUPABASE_URL.indexOf("TODO") !== -1) {
        formStatus.textContent = "Formularul nu e conectat încă la Supabase (vezi config.js).";
        formStatus.classList.add("error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Se trimite...";

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
          if (!res.ok) throw new Error("Eroare server: " + res.status);
          leadForm.reset();
          formStatus.textContent = "Cererea a fost trimisă. Camila revine în cel mult o zi lucrătoare.";
          formStatus.classList.add("success");
          setTimeout(closeForm, 2200);
        })
        .catch(function (err) {
          formStatus.textContent = "Ceva nu a mers. Încearcă din nou sau sună-ne direct.";
          formStatus.classList.add("error");
          console.error(err);
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Trimite cererea";
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

  function appendMessage(text, who) {
    var div = document.createElement("div");
    div.className = "chat-msg " + who;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    // Doar răspunsurile finale ale botului se anunță la screen reader — nu mesajul
    // propriu al utilizatorului (deja știe ce a scris) și nu indicatorul "Scrie...".
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
        appendMessage("Chat-ul nu e conectat încă la backend (vezi config.js și SUPABASE_SETUP.md).", "bot");
        return;
      }

      var typing = appendMessage("Scrie...", "bot typing");

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
          if (!res.ok) throw new Error("Eroare server: " + res.status);
          return res.json();
        })
        .then(function (data) {
          typing.remove();
          appendMessage(data.reply || "Nu am putut genera un răspuns acum.", "bot");
        })
        .catch(function (err) {
          typing.remove();
          appendMessage("A apărut o eroare. Încearcă din nou sau folosește formularul de ofertă.", "bot");
          console.error(err);
        });
    });
  }
})();
