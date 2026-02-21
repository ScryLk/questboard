import React from "react";

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  type?: "text" | "email" | "password";
}

export function TextInput({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  disabled = false,
  className = "",
  type = "text",
}: TextInputProps) {
  return React.createElement(
    "div",
    { className: `flex flex-col gap-1 ${className}` },
    label &&
      React.createElement(
        "label",
        { className: "text-sm font-medium text-gray-300" },
        label
      ),
    React.createElement("input", {
      type,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        onChangeText(e.target.value),
      placeholder,
      disabled,
      className: `rounded-lg border bg-surface-light px-4 py-2 text-white placeholder-gray-500 outline-none transition-colors ${
        error ? "border-red-500" : "border-gray-700 focus:border-brand-accent"
      } ${disabled ? "opacity-50" : ""}`,
    }),
    error &&
      React.createElement(
        "span",
        { className: "text-xs text-red-400" },
        error
      )
  );
}
