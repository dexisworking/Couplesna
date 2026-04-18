import AdminLoginForm from '@/components/admin/admin-login-form';

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#070708] px-8 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="dex-kicker mb-2">Secure Access</p>
        <h1 className="text-gradient-purple font-heading text-[clamp(2.2rem,6vw,4.2rem)] leading-[0.92]">
          Couplesna Admin
        </h1>
        <p className="mt-3 max-w-xl text-white/55">
          Passkey-first admin authentication with OTP fallback, modeled after your Dex CMS flow.
        </p>
        <div className="mt-10">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
