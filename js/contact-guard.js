/**
 * GeoWho contact-guard (2026 practice)
 * ------------------------------------
 * Goal: keep §5 DDG / Art. 13 contact data human-readable after load,
 * while keeping email/phone/address out of static HTML for naive scrapers.
 *
 * Limits (honest):
 * - Does NOT stop headless browsers or determined scrapers.
 * - Does NOT hide Klarname/address from humans (legal visibility required).
 * - Noscript fallback stays deliberately imperfect ([at] / spaced digits).
 */
(function () {
  "use strict";

  var KEY = 0x5a;
  // Payload: XOR(UTF-8 JSON, KEY) → base64. Rebuild with node if contact data changes.
  var B64 =
    "IXg0Ozc/eGB4EJnsKD16ETUpMzQpMTN4dng2MzQ/KXhgAXgVKS4pLih0eml4dnhqbmlrbXoWPzMqIDM9eHZ4Hj8vLik5MjY7ND54B3Z4NjM0Px80eGB4FSkuKS4odHppdnpqbmlrbXoWPzMqIDM9dnodPyg3OzQjeHZ4Pzc7MzYPKT8oeGB4PT81LTI1OyoqeHZ4Pzc7MzYSNSkueGB4PTc7MzZ0OTU3eHZ4KjI1ND8eMykqNjsjeGB4cW5jemtvbXppamlta2xjanh2eCoyNTQ/Dj82eGB4cW5ja29taWppbWtsY2p4Jw==";

  function bytesToUtf8(bytes) {
    if (typeof TextDecoder !== "undefined") {
      return new TextDecoder("utf-8").decode(bytes);
    }
    var binary = "";
    for (var i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    // Fallback for very old engines
    return decodeURIComponent(escape(binary));
  }

  function decodePayload() {
    try {
      var bin = atob(B64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i) ^ KEY;
      }
      return JSON.parse(bytesToUtf8(bytes));
    } catch (err) {
      return null;
    }
  }

  function text(el, value) {
    if (el) el.textContent = value;
  }

  function mailto(el, user, host) {
    if (!el) return;
    var addr = user + "@" + host;
    el.setAttribute("href", "mailto:" + addr);
    el.textContent = addr;
  }

  function tel(el, display, href) {
    if (!el) return;
    el.setAttribute("href", "tel:" + href);
    el.textContent = display;
  }

  function fill(root, data) {
    if (!root || !data) return;

    root.querySelectorAll("[data-cg='name']").forEach(function (el) {
      text(el, data.name);
    });
    root.querySelectorAll("[data-cg='addr-de']").forEach(function (el) {
      text(el, data.lines.join("\n"));
    });
    root.querySelectorAll("[data-cg='addr-en']").forEach(function (el) {
      text(el, data.lineEn);
    });
    root.querySelectorAll("[data-cg='addr-line']").forEach(function (el) {
      text(el, data.lines[0] + ", " + data.lines[1]);
    });
    root.querySelectorAll("[data-cg='country-de']").forEach(function (el) {
      text(el, data.lines[2] || "Deutschland");
    });
    root.querySelectorAll("a[data-cg='email']").forEach(function (el) {
      mailto(el, data.emailUser, data.emailHost);
    });
    root.querySelectorAll("[data-cg='email-plain']").forEach(function (el) {
      text(el, data.emailUser + "@" + data.emailHost);
    });
    root.querySelectorAll("a[data-cg='phone']").forEach(function (el) {
      tel(el, data.phoneDisplay, data.phoneTel);
    });
    root.querySelectorAll("[data-cg='phone-plain']").forEach(function (el) {
      text(el, data.phoneDisplay);
    });

    root.removeAttribute("data-cg-pending");
  }

  function run() {
    var data = decodePayload();
    if (!data) return;
    document.querySelectorAll("[data-cg-root]").forEach(function (root) {
      fill(root, data);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
