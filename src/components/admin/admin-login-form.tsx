'use client';

import { useEffect, useMemo, useState } from 'react';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Mode = 'passkey-login' | 'passkey-register' | 'otp';
type AdminOption = { id: string; name: string };

export default function AdminLoginForm() {
  const [admins, setAdmins] = useState<AdminOption[]>([]);
  const [adminId, setAdminId] = useState('');
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [mode, setMode] = useState<Mode>('passkey-login');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedAdmin = useMemo(() => admins.find((a) => a.id === adminId), [admins, adminId]);

  useEffect(() => {
    fetch('/api/admin-auth/admins')
      .then((r) => r.json())
      .then((data: AdminOption[]) => {
        setAdmins(data);
        if (data.length === 1 && data[0]) setAdminId(data[0].id);
      })
      .finally(() => setLoadingAdmins(false));
  }, []);

  async function parseResponse(response: Response) {
    const raw = await response.text();
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return { error: raw };
    }
  }

  async function runPasskeyLogin() {
    const optionsRes = await fetch('/api/admin-auth/passkey/login/options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId }),
    });
    const optionsJson = await parseResponse(optionsRes);
    if (!optionsRes.ok) throw new Error(String(optionsJson.error ?? 'Could not start passkey login.'));

    const response = await startAuthentication(optionsJson.data as Parameters<typeof startAuthentication>[0]);
    const verifyRes = await fetch('/api/admin-auth/passkey/login/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, response }),
    });
    const verifyJson = await parseResponse(verifyRes);
    if (!verifyRes.ok) throw new Error(String(verifyJson.error ?? 'Passkey login failed.'));
  }

  async function runPasskeyRegister() {
    const optionsRes = await fetch('/api/admin-auth/passkey/register/options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId }),
    });
    const optionsJson = await parseResponse(optionsRes);
    if (!optionsRes.ok) throw new Error(String(optionsJson.error ?? 'Could not start passkey registration.'));

    const response = await startRegistration(optionsJson.data as Parameters<typeof startRegistration>[0]);
    const verifyRes = await fetch('/api/admin-auth/passkey/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, response }),
    });
    const verifyJson = await parseResponse(verifyRes);
    if (!verifyRes.ok) throw new Error(String(verifyJson.error ?? 'Passkey registration failed.'));
  }

  async function sendOtp() {
    const res = await fetch('/api/admin-auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId }),
    });
    const json = await parseResponse(res);
    if (!res.ok) throw new Error(String(json.error ?? 'Could not send verification code.'));
    setOtpSent(true);
  }

  async function verifyOtp() {
    if (otpCode.length !== 6) throw new Error('Enter the full 6-character code.');
    const res = await fetch('/api/admin-auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, code: otpCode.toUpperCase() }),
    });
    const json = await parseResponse(res);
    if (!res.ok) throw new Error(String(json.error ?? 'Code verification failed.'));
  }

  const submit = async () => {
    if (!adminId) return;
    setBusy(true);
    setStatus('');
    try {
      if (mode === 'passkey-login') {
        await runPasskeyLogin();
      } else if (mode === 'passkey-register') {
        await runPasskeyRegister();
      } else if (otpSent) {
        await verifyOtp();
      } else {
        await sendOtp();
        setStatus('OTP sent. Check your email.');
        return;
      }

      setStatus('Authenticated. Redirecting...');
      window.location.href = 'https://coupleadmin.iamdex.codes';
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dex-panel max-w-xl p-6">
      <p className="dex-kicker mb-2">Admin Gateway</p>
      <h2 className="font-heading text-3xl text-white">Couplesna Control Login</h2>
      <p className="mt-2 text-sm text-white/55">Primary: passkey. Fallback: email OTP.</p>

      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <p className="dex-kicker">Select Admin</p>
          <select
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            disabled={loadingAdmins || busy}
          >
            <option value="">Choose admin...</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name}
              </option>
            ))}
          </select>
        </div>

        {!otpSent && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'passkey-login', label: 'Passkey' },
              { id: 'passkey-register', label: 'Register Key' },
              { id: 'otp', label: 'Email OTP' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id as Mode)}
                className={`rounded-lg border px-3 py-2 text-xs uppercase tracking-wide ${
                  mode === item.id
                    ? 'border-primary/40 bg-primary/15 text-white'
                    : 'border-white/10 bg-white/[0.02] text-white/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {mode === 'otp' && otpSent && (
          <div className="space-y-2">
            <p className="dex-kicker">Verification Code</p>
            <Input
              placeholder="ABC123"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.toUpperCase().slice(0, 6))}
              className="h-12 border-white/10 bg-black/30 text-center font-mono text-xl tracking-[0.32em]"
              autoFocus
            />
            <button
              className="text-xs uppercase tracking-wide text-white/50 hover:text-white"
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtpCode('');
                setStatus('');
              }}
            >
              Back to methods
            </button>
          </div>
        )}

        <Button
          onClick={submit}
          disabled={!adminId || busy || loadingAdmins}
          className="h-11 rounded-xl bg-primary px-6 text-xs uppercase tracking-wider"
        >
          {mode === 'otp' ? (otpSent ? 'Verify Code' : 'Send OTP') : 'Continue'}
        </Button>

        {selectedAdmin ? <p className="dex-mono text-xs text-white/45">selected_admin={selectedAdmin.name}</p> : null}
        {status ? <p className="text-sm text-white/70">{status}</p> : null}
      </div>
    </div>
  );
}
