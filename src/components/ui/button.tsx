// src/components/ui/button.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive" | "secondary"; // ✅ Added "secondary"
}

export const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "default",
  children,
  ...props
}) => {
  const baseStyles =
    "rounded-xl px-4 py-2 font-medium transition-transform duration-150 hover:scale-105 active:scale-95";

  const variants = {
    default: "bg-white text-black hover:bg-neutral-200",
    outline: "border border-white text-white hover:bg-white hover:text-black",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-black text-white hover:bg-neutral-800 border border-white/20", // ✅ Style for secondary
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
