"use client";
import { ReactNode, useEffect, useRef } from "react";
export function ModalBackdrop({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = ref.current!;
    const focusable = () => [
      ...root.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]",
      ),
    ];
    (root.querySelector<HTMLElement>("[autofocus]") || focusable()[0])?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeRef.current();
      if (e.key !== "Tab") return;
      const nodes = focusable();
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    root.addEventListener("keydown", handleKey);
    return () => {
      root.removeEventListener("keydown", handleKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop" ref={ref}>
      {children}
    </div>
  );
}
