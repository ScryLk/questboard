import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return React.createElement(
    "div",
    {
      className: `rounded-card bg-surface-light p-4 shadow-card ${className}`,
    },
    children
  );
}
