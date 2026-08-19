/*! GeoWho contact form — Web3Forms + anti-spam (no Cloudflare required).
 *
 * Payload follows Web3Forms JS guide: JSON with field `name` (not from_name),
 * plus h-captcha-response. Access key is XOR-decoded from site-config.
 */
(function () {
  "use strict";

  var XOR_KEY = 0x5a;
  var MIN_DWELL_MS = 2800;

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

  function decodeAccessKey(b64) {
    if (!b64 || typeof atob !== "function") return "";
    try {
      var bin = atob(b64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) ^ XOR_KEY;
      var raw =
        typeof TextDecoder !== "undefined"
          ? new TextDecoder("utf-8").decode(bytes)
          : decodeURIComponent(escape(String.fromCharCode.apply(null, bytes)));
      var parsed = JSON.parse(raw);
      return String(parsed.k || "").trim();
    } catch (err) {
      return "";
    }
  }

  function hCaptchaToken(form) {
    var el = form.querySelector('textarea[name="h-captcha-response"]');
    return el && el.value ? String(el.value).trim() : "";
  }

  function resetCaptcha() {
    if (window.hcaptcha && typeof window.hcaptcha.reset === "function") {
      try {
        window.hcaptcha.reset();
      } catch (e) {}
    }
  }

  function showError(status, msg) {
    if (!status) return;
    var safe = String(msg || "Could not send.");
    status.textContent = "";
    status.appendChild(document.createTextNode(safe + " "));
    var a = document.createElement("a");
    a.href = "impressum.html";
    a.textContent = "Impressum";
    status.appendChild(a);
  }

  ready(function () {
    var form = document.getElementById("gw-contact-form");
    if (!form) return;

    var status = document.getElementById("gw-contact-status");
    var submit = form.querySelector('[type="submit"]');
    var openedAt = Date.now();
    var key = decodeAccessKey((cfg().web3formsAccessKeyB64 || "").trim());

    if (!key) {
      form.setAttribute("data-gw-disabled", "1");
      if (status) {
        status.textContent =
          "Form needs a free Web3Forms key (one-time setup). Until then, use the Impressum for required contact details.";
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
        resetCaptcha();
        return;
      }

      if (Date.now() - openedAt < MIN_DWELL_MS) {
        if (status) status.textContent = "Please wait a moment, then try again.";
        if (submit) submit.disabled = false;
        return;
      }

      var captcha = hCaptchaToken(form);
      if (!captcha) {
        if (status) status.textContent = "Please complete the captcha.";
        if (submit) submit.disabled = false;
        return;
      }

      /* Web3Forms requires standard field names: name, email, message */
      var payload = {
        access_key: key,
        subject: "GeoWho Support",
        name: (form.elements.namedItem("name") || {}).value || "",
        email: (form.elements.namedItem("email") || {}).value || "",
        message: (form.elements.namedItem("message") || {}).value || "",
        botcheck: "",
        "h-captcha-response": captcha,
      };

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(function (j) {
            return { httpOk: r.ok, status: r.status, j: j };
          });
        })
        .then(function (res) {
          if (res.httpOk && res.j && res.j.success === true) {
            form.reset();
            resetCaptcha();
            if (status) {
              status.textContent =
                "Message sent. Check inbox and Spam/Promotions for mail from web3forms.com.";
            }
            return;
          }
          var apiMsg =
            (res.j && (res.j.message || res.j.error)) ||
            "Send failed (HTTP " + res.status + ").";
          showError(status, apiMsg);
        })
        .catch(function () {
          showError(status, "Network error.");
        })
        .finally(function () {
          if (submit) submit.disabled = false;
        });
    });
  });
})();
