import { type PropsWithChildren, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "md" | "lg" | "xl";
  footer?: React.ReactNode;
}>;

const sizeClasses = {
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "lg",
  footer,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="modal-backdrop-enter absolute inset-0 bg-[rgba(22,6,34,0.48)] backdrop-blur-md dark:bg-[rgba(3,2,8,0.72)]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "modal-panel-enter relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-[2rem] border border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.46)_100%)] shadow-[0_40px_140px_-48px_rgba(88,28,135,0.42)] backdrop-blur-2xl dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(18,14,28,0.92)_0%,rgba(12,10,20,0.86)_100%)] dark:shadow-[0_40px_140px_-40px_rgba(0,0,0,0.78)]",
          sizeClasses[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/22 px-6 py-5 dark:border-white/10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
        {footer ? (
          <div className="border-t border-white/22 px-6 py-4 dark:border-white/10">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
