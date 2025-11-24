'use client';

import { useFormStatus } from "react-dom";
import { SwiggyButton } from "../components/swiggy-ui";

type Variant = "primary" | "ghost" | "danger" | "outline";

interface ActionButtonProps {
  label: string;
  pendingLabel: string;
  variant?: Variant;
  className?: string;
}

export function ActionButton({
  label,
  pendingLabel,
  variant = "primary",
  className
}: ActionButtonProps) {
  const { pending } = useFormStatus();

  const swiggyVariant: "primary" | "secondary" | "outline" | "ghost" | "danger" =
    variant === "primary"
      ? "primary"
      : variant === "danger"
        ? "danger"
        : variant === "outline"
          ? "outline"
          : "ghost";

  return (
    <SwiggyButton
      type="submit"
      variant={swiggyVariant}
      size="sm"
      className={className}
      disabled={pending}
    >
      {pending ? pendingLabel : label}
    </SwiggyButton>
  );
}
