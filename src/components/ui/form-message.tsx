import type { ReactNode } from "react";

type FormMessageProps = {
  children?: ReactNode;
};

export function FormMessage({ children }: FormMessageProps) {
  if (!children) {
    return null;
  }

  return <p className="mt-2 text-xs text-destructive">{children}</p>;
}
