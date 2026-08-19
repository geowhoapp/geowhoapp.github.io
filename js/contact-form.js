/*! GeoWho contact form — Web3Forms + honeypot (no Cloudflare required). */
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
    var key = (cfg().web3formsAccessKey || "").trim();

    if (!key) {
      form.setAttribute("data-gw-disabled", "1");
      if (status) {
        status.innerHTML =
          'Form not connected yet. For legally required contact details see the <a href="impressum.html">Impressum</a>.';
      }
      if (submit) submit.disabled = true;
      return;
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (status) status.textContent = "Sending…";
      if (submit) submit.disabled = true;

      var website = (form.elements.namedItem("website") || {}).value || "";
      if (website) {
        if (status) status.textContent = "Message sent.";
        if (submit) submit.disabled = false;
        form.reset();
        return;
      }

      var payload = {
        access_key: key,
        subject: "GeoWho Support",
        from_name: (form.elements.namedItem("name") || {}).value || "",
        email: (form.elements.namedItem("email") || {}).value || "",
        message: (form.elements.namedItem("message") || {}).value || "",
        botcheck: "",
      };

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(function (j) {
            return { ok: r.ok && j.success !== false, j: j };
          });
        })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            if (status) status.textContent = "Message sent. We’ll reply by email.";
          } else {
            if (status) {
              status.innerHTML =
                'Could not send. Please use the contact details on the <a href="impressum.html">Impressum</a>.';
            }
          }
        })
        .catch(function () {
          if (status) {
            status.innerHTML =
              'Network error. Please use the <a href="impressum.html">Impressum</a>.';
          }
        })
        .finally(function () {
          if (submit) submit.disabled = false;
        });
    });
  });
})();
