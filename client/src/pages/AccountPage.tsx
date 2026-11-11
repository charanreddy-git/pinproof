import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts";
import { Button, Input, PageHeader, useToast } from "../components";
import { formatPhone } from "../utils/phone";

export function AccountPage() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await updateProfile({ name: String(form.get("name")).trim(), email: String(form.get("email")).trim() });
      addToast("success", "Account updated.");
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Could not update your account.");
    } finally { setSaving(false); }
  }
  return <div className="mx-auto max-w-2xl">
    <PageHeader title="Your account" description="The details shared with the people on your visits." />
    <form onSubmit={save} className="mt-6 space-y-5 rounded-2xl border border-surface-200 bg-white p-5 sm:p-7" key={user?.id}>
      <Input name="name" label="Full name" defaultValue={user?.name} required minLength={2} maxLength={80} autoComplete="name" />
      <Input name="email" label="Email (optional)" type="email" defaultValue={user?.email ?? ""} maxLength={254} autoComplete="email" />
      <dl className="space-y-3 border-y border-surface-200 py-5 text-sm">
        <div className="flex flex-wrap justify-between gap-2"><dt className="text-surface-600">Sign-in phone</dt><dd className="font-semibold text-surface-900">{user?.phone && formatPhone(user.phone)}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-surface-600">Account type</dt><dd className="font-semibold text-surface-900">{user?.role === "CAPTAIN" ? "Inspector" : "Requester"}</dd></div>
      </dl>
      <p className="text-sm leading-relaxed text-surface-600">Your phone number is used to sign in. Visit participants can call you after a request is accepted.</p>
      <Button type="submit" isLoading={saving}>Save changes</Button>
    </form>
  </div>;
}
