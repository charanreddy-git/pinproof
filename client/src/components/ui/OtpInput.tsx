import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  label?: string;
  id?: string;
}

/**
 * Segmented one-time-code input. Supports paste, arrow key navigation, and
 * backspace across boxes — the details people expect from an OTP screen.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus = false,
  disabled = false,
  label = "One-time verification code",
  id = "otp",
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.split("").slice(0, length);

  const focusAt = (index: number) => {
    const bounded = Math.max(0, Math.min(index, length - 1));
    inputs.current[bounded]?.focus();
    inputs.current[bounded]?.select();
  };

  const commit = (nextDigits: string[]) => {
    onChange(nextDigits.join("").slice(0, length));
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = Array.from({ length }, (_, i) => digits[i] ?? "");

    if (!digit) {
      next[index] = "";
      commit(next);
      return;
    }

    next[index] = digit;
    commit(next);

    if (index < length - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        commit(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        commit(next);
        focusAt(index - 1);
      }
      event.preventDefault();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    } else if (event.key === "Delete") {
      const next = [...digits];
      next[index] = "";
      commit(next);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pasted) return;

    const next = Array.from({ length }, (_, i) => pasted[i] ?? "");
    commit(next);
    focusAt(Math.min(pasted.length, length - 1));
  };

  return (
    <div>
      <label htmlFor={`${id}-0`} className="sr-only">
        {label}
      </label>
      <div
        className="grid grid-cols-6 gap-2"
        role="group"
        aria-label={label}
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            id={`${id}-${index}`}
            ref={(node) => {
              inputs.current[index] = node;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            pattern="[0-9]*"
            maxLength={1}
            value={digits[index] ?? ""}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            autoFocus={autoFocus && index === 0}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
            className="h-14 w-full rounded-xl border-2 border-surface-200 bg-surface-50 text-center text-[1.4rem] font-extrabold tabular-nums text-surface-950 transition-colors placeholder:text-surface-300 hover:border-surface-300 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:opacity-60"
            placeholder="·"
          />
        ))}
      </div>
    </div>
  );
}
