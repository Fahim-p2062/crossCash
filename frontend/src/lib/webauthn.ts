import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from '@simplewebauthn/browser';
import { apiRequest } from './api';
import { setSession } from './session';
import { User } from '@/types';

export interface BiometricStatus {
  enabled: boolean;
  count: number;
  devices: Array<{
    id: string;
    deviceType?: string;
    createdAt?: string;
  }>;
}

/**
 * Check if the current browser and device have native biometric hardware support
 * (Touch ID, Face ID, Android Fingerprint, Windows Hello).
 */
export async function checkBiometricSupport(): Promise<{
  supported: boolean;
  platformAvailable: boolean;
}> {
  if (typeof window === 'undefined') {
    return { supported: false, platformAvailable: false };
  }

  const supported = browserSupportsWebAuthn();
  if (!supported) {
    return { supported: false, platformAvailable: false };
  }

  try {
    const platformAvailable = await platformAuthenticatorIsAvailable();
    return { supported, platformAvailable };
  } catch {
    return { supported: true, platformAvailable: false };
  }
}

/**
 * Fetch biometric registration status for the currently logged-in user.
 */
export async function getBiometricStatus(): Promise<BiometricStatus> {
  return await apiRequest<BiometricStatus>('/api/auth/biometric/status');
}

/**
 * Register the current device's biometric sensor (Face ID / Touch ID / Windows Hello).
 * Pops up the native browser OS prompt.
 */
export async function registerBiometricDevice(): Promise<{ verified: boolean; message: string }> {
  // 1. Get registration challenge options from backend
  const options = await apiRequest<any>('/api/auth/biometric/register-challenge', {
    method: 'POST',
  });

  // 2. Trigger native OS biometric prompt (Touch ID / Face ID / Windows Hello)
  let attResp;
  try {
    attResp = await startRegistration({ optionsJSON: options });
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Biometric registration was cancelled or timed out.');
    }
    throw new Error(err.message || 'Failed to capture biometric credentials.');
  }

  // 3. Send response back to backend to verify and store public key
  const verification = await apiRequest<{ verified: boolean; message: string }>(
    '/api/auth/biometric/register-verify',
    {
      method: 'POST',
      body: JSON.stringify(attResp),
    }
  );

  return verification;
}

/**
 * Authenticate and log in using physical biometrics (true 1-tap passwordless login).
 */
export async function loginWithBiometrics(phone?: string): Promise<{ token: string; user: User }> {
  // If phone is not explicitly passed, check if remembered from a previous login
  let resolvedPhone = phone && phone.trim() !== '' ? phone.trim() : undefined;
  if (!resolvedPhone && typeof window !== 'undefined') {
    resolvedPhone = localStorage.getItem('crosscash_last_phone') || undefined;
  }

  // 1. Request authentication challenge (discoverable if phone is not provided)
  const data = await apiRequest<{ options: any; challenge: string; phone?: string }>(
    '/api/auth/biometric/login-challenge',
    {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ phone: resolvedPhone }),
    }
  );

  // 2. Trigger native OS biometric prompt (Touch ID / Face ID / Windows Hello)
  let asseResp;
  try {
    asseResp = await startAuthentication({ optionsJSON: data.options });
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Biometric login was cancelled or timed out.');
    }
    throw new Error(err.message || 'Biometric authentication failed.');
  }

  // 3. Verify signature on backend & retrieve JWT
  const result = await apiRequest<{ token: string; user: User }>(
    '/api/auth/biometric/login-verify',
    {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({
        phone: resolvedPhone || data.phone,
        response: asseResp,
        challenge: data.challenge,
      }),
    }
  );

  // Save session to localStorage & remember phone
  setSession(result.token, result.user);
  if (typeof window !== 'undefined' && result.user?.phone) {
    localStorage.setItem('crosscash_last_phone', result.user.phone);
  }

  return result;
}

/**
 * Authorize an express money transfer with physical biometrics.
 */
export async function authorizeTransferWithBiometrics(): Promise<boolean> {
  // 1. Get authorization challenge from backend
  const options = await apiRequest<any>('/api/auth/biometric/authorize-challenge', {
    method: 'POST',
  });

  // 2. Prompt native OS biometric sensor
  let asseResp;
  try {
    asseResp = await startAuthentication({ optionsJSON: options });
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Biometric authorization was cancelled.');
    }
    throw new Error(err.message || 'Biometric authorization failed.');
  }

  // 3. Verify on backend
  const result = await apiRequest<{ verified: boolean }>(
    '/api/auth/biometric/authorize-verify',
    {
      method: 'POST',
      body: JSON.stringify({ response: asseResp }),
    }
  );

  return result.verified;
}

/**
 * Disable and remove registered biometrics for the logged-in user.
 */
export async function removeBiometricDevice(): Promise<void> {
  await apiRequest('/api/auth/biometric/remove', {
    method: 'POST',
  });
}
