/**
 * GeoWho contact form — Turnstile + honeypot → Cloudflare Worker.
 */
(function () {
  "use strict";

  function cfg() {
    return window.GEOWHO_CONTACT || {};
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var form = document.getElementById("gw-contact-form");
    if (!form) return;

    var status = document.getElementById("gw-contact-status");
    var submit = form.querySelector('[type="submit"]');
    var c = cfg();

    if (!c.apiUrl || !c.turnstileSiteKey) {
      form.setAttribute("data-gw-disabled", "1");
      if (status) {
        status.textContent =
          "Contact form is being connected (Turnstile + API). Meanwhile use the email below once it appears.";
      }
      if (submit) submit.disabled = true;
      return;
    }

    var mount = document.getElementById("gw-turnstile");
    if (mount) {
      mount.setAttribute("data-sitekey", c.turnstileSiteKey);
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (status) status.textContent = "Sending…";
      if (submit) submit.disabled = true;

      var tokenInput = form.querySelector('[name="cf-turnstile-response"]');
      var token = tokenInput ? tokenInput.value : "";

      var payload = {
        name: (form.elements.namedItem("name") || {}).value || "",
        email: (form.elements.namedItem("email") || {}).value || "",
        message: (form.elements.namedItem("message") || {}).value || "",
        website: (form.elements.namedItem("website") || {}).value || "",
        turnstileToken: token,
      };

      fetch(c.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(function (j) {
            return { ok: r.ok && j.ok, j: j };
          });
        })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            if (window.turnstile && mount) {
              try {
                window.turnstile.reset(mount);
              } catch (e) {}
            }
            if (status) status.textContent = "Message sent. We’ll reply by email.";
          } else {
            if (status) {
              status.textContent =
                "Could not send (" +
                ((res.j && res.j.error) || "error") +
                "). Try email instead.";
            }
          }
        })
        .catch(function () {
          if (status) status.textContent = "Network error. Try email instead.";
        })
        .finally(function () {
          if (submit) submit.disabled = false;
        });
    });
  });
})();
