"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  required,
  placeholder,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-2 flex items-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
