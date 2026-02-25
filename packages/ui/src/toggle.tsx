import React from "react";

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  value,
  onChange,
  disabled = false,
  className = "",
}: ToggleProps) {
  return React.createElement(
    "button",
    {
      type: "button" as const,
      role: "switch",
      "aria-checked": value,
      disabled,
      onClick: () => onChange(!value),
      className: `relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-fast ${
        value ? "bg-accent" : "bg-elevated border border-border-default"
      } ${disabled ? "opacity-40 pointer-events-none" : "cursor-pointer"} ${className}`,
    },
    React.createElement("span", {
      className: `pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-fast ${
        value ? "translate-x-5" : "translate-x-0.5"
      }`,
    })
  );
}
