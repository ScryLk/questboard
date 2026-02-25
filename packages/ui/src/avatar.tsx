import React from "react";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  showOnline?: boolean;
  isOnline?: boolean;
  className?: string;
}

const sizeMap = {
  xs: { container: "w-8 h-8", text: "text-xs", indicator: "w-2 h-2" },
  sm: { container: "w-10 h-10", text: "text-sm", indicator: "w-2.5 h-2.5" },
  md: { container: "w-12 h-12", text: "text-base", indicator: "w-3 h-3" },
  lg: { container: "w-16 h-16", text: "text-lg", indicator: "w-3.5 h-3.5" },
  xl: { container: "w-24 h-24", text: "text-2xl", indicator: "w-4 h-4" },
  "2xl": { container: "w-32 h-32", text: "text-3xl", indicator: "w-5 h-5" },
} as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  src,
  name,
  size = "md",
  showOnline = false,
  isOnline = false,
  className = "",
}: AvatarProps) {
  const sizes = sizeMap[size];

  return React.createElement(
    "div",
    { className: `relative inline-flex shrink-0 ${className}` },
    src
      ? React.createElement("img", {
          src,
          alt: name,
          className: `${sizes.container} rounded-full border-2 border-border-default object-cover`,
        })
      : React.createElement(
          "div",
          {
            className: `${sizes.container} rounded-full border-2 border-border-default bg-accent flex items-center justify-center`,
          },
          React.createElement(
            "span",
            { className: `${sizes.text} font-display font-bold text-text-inverse` },
            getInitials(name)
          )
        ),
    showOnline &&
      React.createElement("span", {
        className: `absolute bottom-0 right-0 ${sizes.indicator} rounded-full border-2 border-surface ${
          isOnline ? "bg-success" : "bg-text-muted"
        }`,
      })
  );
}
