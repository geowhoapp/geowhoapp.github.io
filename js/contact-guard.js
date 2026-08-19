/**
 * GeoWho contact-guard
 * Injects §5 DDG / Art. 13 contact after load. Not real crypto — raises bar for
 * naive HTML regex harvesters. Headless browsers can still recover the DOM.
 */
(function () {
  "use strict";

  var KEY = 0x5a;
  var B64 =
    "IXg0eGB4EJnsKD16ETUpMzQpMTN4dng7eGABeBUpLikuKHR6aXh2eGpuaWttehY/MyogMz14dngePy8uKTkyNjs0PngHdng7P3hgeBUpLikuKHR6aXZ6am5pa216Fj8zKiAzPXZ6HT8oNzs0I3h2eD8veGB4PT81LTI1OyoqeHZ4PzJ4YHg9NzszNnQ5NTd4dngqPnhgeHFuY3prb216aWppbWtsY2p4dngqLnhgeHFuY2tvbWlqaW1rbGNqeCc=";

  function bytesToUtf8(bytes) {
    if (typeof TextDecoder !== "undefined") {
      return new TextDecoder("utf-8").decode(bytes);
    }
    var binary = "";
    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return decodeURIComponent(escape(binary));
  }

  function decodePayload() {
    try {
      var bin = atob(B64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) ^ KEY;
      var raw = JSON.parse(bytesToUtf8(bytes));
      return {
        name: raw.n,
        lines: raw.a,
        lineEn: raw.ae,
        emailUser: raw.eu,
        emailHost: raw.eh,
        phoneDisplay: raw.pd,
        phoneTel: raw.pt
      };
    } catch (err) {
      return null;
    }
  }

  /** Insert ZWSP between chars so naive phone regex on HTML source fails harder. */
  function softPhone(display) {
    return display.split("").join("\u200B");
  }

  function fillEmail(el, user, host) {
    if (!el) return;
    el.textContent = "";
    el.removeAttribute("href");
    el.setAttribute("href", "#");
    el.setAttribute("role", "link");
    el.dataset.cgReady = "1";

    var u = document.createElement("span");
    u.textContent = user;
    var at = document.createElement("span");
    at.className = "cg-at";
    at.setAttribute("aria-hidden", "true");
    var h = document.createElement("span");
    h.textContent = host;
    // Decoy (hidden) breaks some textContent email regexes that ignore CSS
    var decoy = document.createElement("span");
    decoy.className = "cg-decoy";
    decoy.textContent = "null";
    decoy.setAttribute("aria-hidden", "true");

    el.appendChild(u);
    el.appendChild(decoy);
    el.appendChild(at);
    el.appendChild(h);

    var addr = user + "@" + host;
    el.setAttribute("aria-label", addr);
    el.addEventListener(
      "click",
      function (ev) {
        ev.preventDefault();
        window.location.href = "mailto:" + addr;
      },
      { once: false }
    );
  }

  function fillPhone(el, display, telHref) {
    if (!el) return;
    el.textContent = softPhone(display);
    el.setAttribute("href", "#");
    el.setAttribute("aria-label", display);
    el.dataset.cgReady = "1";
    el.addEventListener(
      "click",
      function (ev) {
        ev.preventDefault();
        window.location.href = "tel:" + telHref;
      },
      { once: false }
    );
  }

  function fillPhonePlain(el, display) {
    if (!el) return;
    el.textContent = softPhone(display);
  }

  function fill(root, data) {
    if (!root || !data) return;

    root.querySelectorAll("[data-cg='name']").forEach(function (el) {
      el.textContent = data.name;
    });
    root.querySelectorAll("[data-cg='addr-de']").forEach(function (el) {
      el.textContent = data.lines.join("\n");
    });
    root.querySelectorAll("[data-cg='addr-en']").forEach(function (el) {
      el.textContent = data.lineEn;
    });
    root.querySelectorAll("a[data-cg='email']").forEach(function (el) {
      fillEmail(el, data.emailUser, data.emailHost);
    });
    root.querySelectorAll("[data-cg='email-plain']").forEach(function (el) {
      // Same split structure without link
      el.textContent = "";
      var u = document.createElement("span");
      u.textContent = data.emailUser;
      var at = document.createElement("span");
      at.className = "cg-at";
      at.setAttribute("aria-hidden", "true");
      var h = document.createElement("span");
      h.textContent = data.emailHost;
      var decoy = document.createElement("span");
      decoy.className = "cg-decoy";
      decoy.textContent = "null";
      decoy.setAttribute("aria-hidden", "true");
      el.appendChild(u);
      el.appendChild(decoy);
      el.appendChild(at);
      el.appendChild(h);
    });
    root.querySelectorAll("a[data-cg='phone']").forEach(function (el) {
      fillPhone(el, data.phoneDisplay, data.phoneTel);
    });
    root.querySelectorAll("[data-cg='phone-plain']").forEach(function (el) {
      fillPhonePlain(el, data.phoneDisplay);
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
