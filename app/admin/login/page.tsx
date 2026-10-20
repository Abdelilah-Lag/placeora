"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function AdminLoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(t("admin.loginError"));
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(t("admin.loginError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12"><div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm"><div className="mb-4 flex justify-end"><LanguageSwitcher /></div><div className="mb-6 flex items-center justify-center rounded-full bg-slate-900 p-3 text-white"><LockKeyhole size={20} /></div><h1 className="text-center text-3xl font-bold text-slate-900">{t("admin.loginTitle")}</h1><p className="mt-2 text-center text-sm text-slate-600">{t("admin.loginText")}</p><form onSubmit={handleSubmit} className="mt-8 space-y-5"><label className="block space-y-2"><span className="text-sm font-medium text-slate-700">{t("reservation.email")}</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none" required autoComplete="username" /></label><label className="block space-y-2"><span className="text-sm font-medium text-slate-700">{t("admin.password")}</span><div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent outline-none" required autoComplete="current-password" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="text-slate-500" aria-label={t("admin.password")}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>{error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}<button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">{loading ? t("admin.signing") : t("admin.signin")}</button></form></div></main>
  );
}