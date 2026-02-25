import React from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({
  value,
  max,
  size = "sm",
  className = "",
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  let fillColor = "bg-accent";
  if (percentage >= 100) fillColor = "bg-error";
  else if (percentage >= 80) fillColor = "bg-warning";

  const heightClass = size === "sm" ? "h-1.5" : "h-2.5";

  return React.createElement(
    "div",
    {
      className: `w-full ${heightClass} rounded-full bg-elevated overflow-hidden ${className}`,
    },
    React.createElement("div", {
      className: `${heightClass} rounded-full ${fillColor} transition-all duration-normal`,
      style: { width: `${percentage}%` },
    })
  );
}
