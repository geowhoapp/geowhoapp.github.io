/* Public client config — no cleartext Web3Forms UUID in source.
 * Access key is public-by-design (email alias), but we XOR+b64 it so naive
 * scrapers / GitHub greps do not harvest a ready-to-POST key. Rebuild with:
 *   node scripts/encode-contact-payload.mjs --web3forms-key '<uuid>'
 * Real spam controls: honeypot + timing + hCaptcha (see contact-form.js). */
window.GEOWHO_CONTACT = {
  web3formsAccessKeyB64: "IXgxeGB4PDtoOG9raGt3PDs8Yndub207dzhpaDx3P25jYm8/Pz8+P2k+eCc=",
};
