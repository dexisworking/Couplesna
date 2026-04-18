import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  WebAuthnCredential,
} from '@simplewebauthn/server';

function getRpID() {
  return process.env.WEBAUTHN_RP_ID || 'localhost';
}

function getOrigin() {
  return process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';
}

function getRpName() {
  return process.env.WEBAUTHN_RP_NAME || 'Couplesna Admin';
}

export async function createRegistrationOptions(email: string, userId: string, excludeCredentials: string[]) {
  return generateRegistrationOptions({
    rpName: getRpName(),
    rpID: getRpID(),
    userName: email,
    userID: new TextEncoder().encode(userId) as unknown as Uint8Array<ArrayBuffer>,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
    supportedAlgorithmIDs: [-7, -257],
    excludeCredentials: excludeCredentials.map((id) => ({
      id,
      type: 'public-key',
    })),
  });
}

export async function validateRegistration(
  response: Parameters<typeof verifyRegistrationResponse>[0]['response'],
  expectedChallenge: string
): Promise<VerifiedRegistrationResponse> {
  return verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: getOrigin(),
    expectedRPID: getRpID(),
    requireUserVerification: false,
  });
}

export async function createAuthenticationOptions(allowCredentials?: string[]) {
  return generateAuthenticationOptions({
    rpID: getRpID(),
    userVerification: 'preferred',
    allowCredentials: allowCredentials?.map((id) => ({
      id,
      type: 'public-key',
    })),
  });
}

export async function validateAuthentication(
  response: Parameters<typeof verifyAuthenticationResponse>[0]['response'],
  expectedChallenge: string,
  credential: {
    id: string;
    publicKey: Uint8Array;
    counter: number;
  }
): Promise<VerifiedAuthenticationResponse> {
  return verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: getOrigin(),
    expectedRPID: getRpID(),
    credential: credential as unknown as WebAuthnCredential,
    requireUserVerification: false,
  });
}
