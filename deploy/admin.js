(function () {
  "use strict";

  var CFG = window.HR_CONFIG || {};
  if (!CFG.SUPABASE_URL || CFG.SUPABASE_URL.indexOf("TODO") !== -1) {
    document.getElementById("loginStatus").textContent =
      "Supabase isn't configured yet (see config.js / SUPABASE_SETUP.md).";
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
  var demoLoginBtn = document.getElementById("demoLoginBtn");
  var demoBadge = document.getElementById("demoBadge");
  var DEMO_MODE = false;

  var TIP_LABELS = {
    casa_la_cheie: "Turnkey home",
    renovare_completa: "Full renovation",
    extindere: "Addition",
    altul: "Other",
  };

  function showLeadsView(email) {
    loginView.style.display = "none";
    leadsView.style.display = "block";
    loggedInAs.textContent = "Signed in as " + email;
    loadLeads();
  }

  function showLoginView() {
    leadsView.style.display = "none";
    loginView.style.display = "block";
    loginForm.reset();
  }

  function loadLeads() {
    leadsStatus.textContent = "Loading...";
    leadsStatus.className = "form-status";
    leadsBody.innerHTML = "";

    sb.from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) {
          // Most likely cause: the account's email isn't in the public.admins table.
          leadsStatus.textContent =
            "Couldn't load the requests (" + res.error.message + "). Check that the account's email is added to the admins table.";
          leadsStatus.classList.add("error");
          return;
        }
        leadsStatus.textContent = res.data.length + " requests.";
        if (res.data.length === 0) {
          leadsBody.innerHTML = '<tr><td colspan="6">No requests yet.</td></tr>';
          return;
        }
        res.data.forEach(function (lead) {
          var tr = document.createElement("tr");
          var date = new Date(lead.created_at).toLocaleString("en-US", {
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

  /* ---------------- Demo mode ----------------
     Lets Erik/Camila (or a recruiter) see the dashboard with sample leads,
     with zero calls to Supabase. Useful while the real project's database
     is paused — nothing here is read from or written to a real backend. */
  var DEMO_LEADS = [
    { created_at: "2026-09-10T14:32:00.000Z", nume: "Marcus Webb", email: "marcus.webb@example.com", telefon: "(555) 014-2290", tip_proiect: "casa_la_cheie", buget_estimat: "$380k–420k", mesaj: "Looking to build on a lot we just closed on in Green Point. Would love a walkthrough of a couple of your recent turnkey builds." },
    { created_at: "2026-09-14T09:05:00.000Z", nume: "Priya Anand", email: "priya.anand@example.com", telefon: "(555) 014-7731", tip_proiect: "renovare_completa", buget_estimat: "$90k–120k", mesaj: "Our kitchen and living room need a full redo — open layout, similar to the Green Point project on your site." },
    { created_at: "2026-09-20T17:48:00.000Z", nume: "Tom Reilly", email: "tom.reilly@example.com", telefon: "(555) 014-5508", tip_proiect: "extindere", buget_estimat: "$45k–60k", mesaj: "Want to add a covered patio in the backyard, similar to the West Lane project. Can you do a quick estimate?" },
  ];

  function showDemoLeads() {
    DEMO_MODE = true;
    loginView.style.display = "none";
    leadsView.style.display = "block";
    loggedInAs.textContent = "Signed in as demo@hr-builders.example";
    demoBadge.style.display = "block";
    leadsStatus.textContent = DEMO_LEADS.length + " requests. (demo data)";
    leadsStatus.className = "form-status";
    leadsBody.innerHTML = "";
    DEMO_LEADS.forEach(function (lead) {
      var tr = document.createElement("tr");
      var date = new Date(lead.created_at).toLocaleString("en-US", {
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
  }

  demoLoginBtn.addEventListener("click", showDemoLeads);

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    loginStatus.textContent = "Signing in...";
    loginStatus.className = "form-status";

    var email = document.getElementById("a-email").value.trim();
    var parola = document.getElementById("a-parola").value;

    sb.auth.signInWithPassword({ email: email, password: parola }).then(function (res) {
      if (res.error) {
        loginStatus.textContent = "Incorrect email or password.";
        loginStatus.classList.add("error");
        return;
      }
      loginStatus.textContent = "";
    });
  });

  logoutBtn.addEventListener("click", function () {
    if (DEMO_MODE) {
      DEMO_MODE = false;
      demoBadge.style.display = "none";
      showLoginView();
      return;
    }
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
