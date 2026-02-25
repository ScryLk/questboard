import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  selected?: boolean;
  variant?: "default" | "dashed" | "gold";
  onPress?: () => void;
}

export function Card({
  children,
  className = "",
  interactive = false,
  selected = false,
  variant = "default",
  onPress,
}: CardProps) {
  const baseClasses = "rounded-lg p-5 transition-all duration-fast";

  const variantClasses = {
    default: selected
      ? "bg-accent-muted border-2 border-accent shadow-glow"
      : "bg-surface border border-border-default",
    dashed: "bg-transparent border border-dashed border-border-default",
    gold: "bg-surface border border-gold shadow-glow-gold",
  };

  const interactiveClasses = interactive
    ? "cursor-pointer hover:border-border-hover hover:shadow-sm"
    : "";

  const classes = [baseClasses, variantClasses[variant], interactiveClasses, className]
    .filter(Boolean)
    .join(" ");

  const props: Record<string, unknown> = { className: classes };
  if (onPress) {
    props.onClick = onPress;
    props.role = "button";
    props.tabIndex = 0;
  }

  return React.createElement("div", props, children);
}
