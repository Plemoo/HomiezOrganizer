const fs = require("node:fs");
const path = require("node:path");

const privacyPolicyPath = path.join(__dirname, "..", "public", "privacyPolicy.html");
const deletionPagePath = path.join(__dirname, "..", "public", "delete-account.html");
const privacyPolicy = fs.readFileSync(privacyPolicyPath, "utf8");
const deletionPage = fs.readFileSync(deletionPagePath, "utf8");
const legalPlaceholders = ["[VOLLSTÄNDIGER NAME]", "[STRASSE UND HAUSNUMMER]", "[PLZ UND ORT]"];

const remainingPlaceholders = legalPlaceholders.filter((placeholder) => privacyPolicy.includes(placeholder));
if (remainingPlaceholders.length > 0) {
  if (process.env.ALLOW_INCOMPLETE_LEGAL_DETAILS !== "true") {
    console.error("Firebase Hosting wurde nicht veröffentlicht: Ergänze zuerst Name und Anschrift in public/privacyPolicy.html oder setze ALLOW_INCOMPLETE_LEGAL_DETAILS=true für eine bewusste Ausnahme.");
    process.exit(1);
  }
  console.warn("Warnung: Firebase Hosting wird trotz unvollständiger Verantwortlichen-Angaben veröffentlicht.");
}

if (!privacyPolicy.includes('href="delete-account.html"') || !deletionPage.includes('href="privacyPolicy.html#loeschung"')) {
  console.error("Firebase Hosting wurde nicht veröffentlicht: Die Datenschutzseiten sind nicht korrekt miteinander verlinkt.");
  process.exit(1);
}

console.log("Datenschutzseiten sind für Firebase Hosting validiert.");
