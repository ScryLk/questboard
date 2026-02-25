import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "warning" | "error" | "gold" | "legendary";
  size?: "sm" | "md";
  className?: string;
}

const variantClasses = {
  default: "bg-elevated text-text-secondary",
  accent: "bg-accent-muted text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  error: "bg-error/15 text-error",
  gold: "bg-gold-glow text-gold",
  legendary: "bg-legendary/15 text-legendary",
} as const;

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
} as const;

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
}: BadgeProps) {
  return React.createElement(
    "span",
    {
      className: `inline-flex items-center rounded-sm font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`,
    },
    children
  );
}
