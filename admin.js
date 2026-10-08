(function () {
  "use strict";

  var CFG = window.HR_CONFIG || {};
  if (!CFG.SUPABASE_URL || CFG.SUPABASE_URL.indexOf("TODO") !== -1) {
    document.getElementById("loginStatus").textContent =
      "Supabase nu e configurat încă (vezi config.js / SUPABASE_SETUP.md).";
    document.getElementById("loginStatus").classList.add("error");
    return;
  }

  var sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);

  var loginView = document.getElementById("loginView");
  var leadsView = document.getElementById("leadsView");
  var loginForm = document.getElementById("loginForm");
  var loginStatus = document.getElementById("loginStatus");
  var leadsStatus = document.getElementById("leadsStatus");
  var leadsBody = document.getElementById("leadsBody");
  var loggedInAs = document.getElementById("loggedInAs");
  var logoutBtn = document.getElementById("logoutBtn");

  var TIP_LABELS = {
    casa_la_cheie: "Casă la cheie",
    renovare_completa: "Renovare completă",
    extindere: "Extindere",
    altul: "Altul",
  };

  function showLeadsView(email) {
    loginView.style.display = "none";
    leadsView.style.display = "block";
    loggedInAs.textContent = "Autentificat ca " + email;
    loadLeads();
  }

  function showLoginView() {
    leadsView.style.display = "none";
    loginView.style.display = "block";
    loginForm.reset();
  }

  function loadLeads() {
    leadsStatus.textContent = "Se încarcă...";
    leadsStatus.className = "form-status";
    leadsBody.innerHTML = "";

    sb.from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) {
          // Cel mai probabil: emailul contului nu e în tabelul public.admins.
          leadsStatus.textContent =
            "Nu am putut încărca cererile (" + res.error.message + "). Verifică dacă emailul contului e adăugat în tabelul admins.";
          leadsStatus.classList.add("error");
          return;
        }
        leadsStatus.textContent = res.data.length + " cereri.";
        if (res.data.length === 0) {
          leadsBody.innerHTML = '<tr><td colspan="6">Încă nicio cerere.</td></tr>';
          return;
        }
        res.data.forEach(function (lead) {
          var tr = document.createElement("tr");
          var date = new Date(lead.created_at).toLocaleString("ro-RO", {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
          });
          tr.innerHTML =
            "<td>" + date + "</td>" +
            "<td>" + escapeHtml(lead.nume) + "</td>" +
            "<td>" + escapeHtml(lead.email) + "<br>" + escapeHtml(lead.telefon) + "</td>" +
            "<td>" + escapeHtml(TIP_LABELS[lead.tip_proiect] || lead.tip_proiect) + "</td>" +
            "<td>" + escapeHtml(lead.buget_estimat || "—") + "</td>" +
            "<td>" + escapeHtml(lead.mesaj) + "</td>";
          leadsBody.appendChild(tr);
        });
      });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    loginStatus.textContent = "Se conectează...";
    loginStatus.className = "form-status";

    var email = document.getElementById("a-email").value.trim();
    var parola = document.getElementById("a-parola").value;

    sb.auth.signInWithPassword({ email: email, password: parola }).then(function (res) {
      if (res.error) {
        loginStatus.textContent = "Email sau parolă greșită.";
        loginStatus.classList.add("error");
        return;
      }
      loginStatus.textContent = "";
    });
  });

  logoutBtn.addEventListener("click", function () {
    sb.auth.signOut();
  });

  sb.auth.onAuthStateChange(function (event, session) {
    if (session && session.user) {
      showLeadsView(session.user.email);
    } else {
      showLoginView();
    }
  });

  sb.auth.getSession().then(function (res) {
    if (res.data.session && res.data.session.user) {
      showLeadsView(res.data.session.user.email);
    }
  });
})();
