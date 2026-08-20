// components/Drawer.tsx
import { ReactNode } from "react";

const  Drawer = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) => {
  return (
    <div
      className={`fixed z-50 inset-0 backdrop-blur bg-opacity-50 transition-opacity ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed right-0 top-0 h-screen w-64 bg-surface shadow-[-4px_0px_8px_rgba(0,0,0,0.25)] text-white transform transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Drawer;