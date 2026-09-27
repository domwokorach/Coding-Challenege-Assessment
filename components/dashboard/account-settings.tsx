"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { toast } from "@/components/ui/toast";

const MIN_PASSWORD_LENGTH = 8;

export function AccountSettings({ email }: { email: string }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email</CardTitle>
          <CardDescription>Your account&apos;s email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {email}
          </p>
        </CardContent>
      </Card>

      <ChangePasswordCard />

      <LogoutCard />

      <DangerZoneCard />
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = (await res.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!res.ok) {
        setError(body?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.add({
        title: "Password changed",
        description: "Your password has been updated.",
        type: "success",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Password &amp; Security</CardTitle>
        <CardDescription>Change your account password.</CardDescription>
      </CardHeader>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
            >
              {error}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current-password">Current Password</Label>
            <PasswordInput
              id="current-password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-new-password">Confirm New Password</Label>
            <PasswordInput
              id="confirm-new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Changing password…" : "Change Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function LogoutCard() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Logout</CardTitle>
        <CardDescription>Sign out of your account on this device.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          variant="outline"
          disabled={loggingOut}
          onClick={() => void handleLogout()}
        >
          {loggingOut ? "Logging out…" : "Logout"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function DangerZoneCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    setError(null);
    if (!password) {
      setError("Please enter your password to confirm.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await res.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!res.ok) {
        setError(body?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push("/?accountDeleted=1");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-2 border-red-300 dark:border-red-900">
      <CardHeader>
        <CardTitle className="text-base text-red-600 dark:text-red-400">
          Danger Zone
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <AlertDialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) {
              setPassword("");
              setError(null);
            }
          }}
        >
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            Delete Account
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes your profile, assessment progress,
                results, certificates, and active sessions. This cannot be
                undone. Enter your password to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-1.5 px-0">
              <Label htmlFor="delete-password">Current Password</Label>
              <PasswordInput
                id="delete-password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                required
              />
              {error && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={submitting}
                onClick={(e) => {
                  e.preventDefault();
                  void handleDelete();
                }}
              >
                {submitting ? "Deleting…" : "Permanently Delete Account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
