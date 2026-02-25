import React from "react";

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className = "" }: DividerProps) {
  if (!label) {
    return React.createElement("hr", {
      className: `border-border-default ${className}`,
    });
  }

  return React.createElement(
    "div",
    { className: `flex items-center gap-4 ${className}` },
    React.createElement("div", { className: "flex-1 border-t border-border-default" }),
    React.createElement(
      "span",
      { className: "text-sm text-text-muted" },
      label
    ),
    React.createElement("div", { className: "flex-1 border-t border-border-default" })
  );
}
