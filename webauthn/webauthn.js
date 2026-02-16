const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const fs = require("fs");
const path = require("path");

const RP_ID = "universal-life-protocol.com";
const RP_NAME = "Geometry Spine";
const ORIGIN = "https://universal-life-protocol.com";
const AUTH_FILE = path.join(__dirname, "authorized-users.json");

const challenges = new Map();

function readAuthorizedUsers() {
  try {
    if (!fs.existsSync(AUTH_FILE)) return [];
    const raw = fs.readFileSync(AUTH_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

class WebAuthnService {
  isAuthorizedIdentity(identity) {
    const value = String(identity || "");
    if (!value.startsWith("webauthn:")) return false;
    const userId = value.slice(9);
    if (!userId) return false;
    return readAuthorizedUsers().includes(userId);
  }

  async generateRegistration(user) {
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: user.id,
      userName: user.name,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });
    challenges.set(String(user.id), options.challenge);
    return options;
  }

  async verifyRegistration(user, response) {
    const expectedChallenge = challenges.get(String(user.id));
    if (!expectedChallenge) throw new Error("No challenge found for user");
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });
    if (verification.verified) {
      challenges.delete(String(user.id));
      return { verified: true, credential: verification.registrationInfo };
    }
    return { verified: false };
  }

  async generateAuthentication(user) {
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: "preferred",
    });
    challenges.set(String(user.id), options.challenge);
    return options;
  }

  async verifyAuthentication(user, response) {
    const expectedChallenge = challenges.get(String(user.id));
    if (!expectedChallenge) throw new Error("No challenge found for user");
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: user.credential,
    });
    if (verification.verified) {
      challenges.delete(String(user.id));
      return { verified: true };
    }
    return { verified: false };
  }
}

module.exports = new WebAuthnService();
