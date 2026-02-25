import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onPress?: () => void;
}

const variantClasses = {
  primary: "bg-accent text-text-inverse hover:bg-accent-hover shadow-glow",
  secondary: "bg-secondary text-text-inverse hover:bg-secondary-hover",
  outline: "bg-transparent border border-border-default text-text-primary hover:bg-hover hover:border-border-hover",
  ghost: "bg-transparent text-text-secondary hover:bg-hover hover:text-text-primary",
  danger: "bg-error text-text-inverse hover:opacity-90",
} as const;

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
} as const;

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  className = "",
  onPress,
}: ButtonProps) {
  const classes = [
    "rounded-md font-semibold font-body transition-all duration-fast inline-flex items-center justify-center",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    disabled ? "opacity-40 pointer-events-none" : "active:scale-[0.97]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

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
