import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  onPress?: () => void;
}

const variantClasses = {
  primary: "bg-brand-accent text-white hover:bg-red-500 active:bg-red-600",
  secondary: "bg-brand-secondary text-white hover:bg-blue-700 active:bg-blue-800",
  ghost: "bg-transparent text-white hover:bg-white/10",
  danger: "bg-red-700 text-white hover:bg-red-600",
} as const;

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
} as const;

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  onPress,
}: ButtonProps) {
  const baseClasses = "rounded-lg font-medium transition-colors";
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
    disabled ? "opacity-50" : ""
  } ${className}`.trim();

  return React.createElement(
    "button",
    {
      className: classes,
      disabled,
      onClick: onPress,
      type: "button" as const,
    },
    children
  );
}
