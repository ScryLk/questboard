import React from "react";

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  type?: "text" | "email" | "password" | "number";
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
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
  multiline = false,
  rows = 4,
  maxLength,
}: TextInputProps) {
  const inputClasses = [
    "w-full rounded-md border bg-surface px-4 py-3 text-base text-text-primary font-body",
    "placeholder:text-text-muted outline-none transition-all duration-fast",
    error
      ? "border-error"
      : "border-border-default focus:border-accent focus:shadow-glow",
    disabled ? "opacity-50 pointer-events-none" : "",
  ].join(" ");

  return React.createElement(
    "div",
    { className: `flex flex-col gap-1.5 ${className}` },
    label &&
      React.createElement(
        "label",
        { className: "text-sm font-medium text-text-secondary" },
        label
      ),
    multiline
      ? React.createElement("textarea", {
          value,
          onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChangeText(e.target.value),
          placeholder,
          disabled,
          rows,
          maxLength,
          className: `${inputClasses} resize-none`,
        })
      : React.createElement("input", {
          type,
          value,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            onChangeText(e.target.value),
          placeholder,
          disabled,
          maxLength,
          className: inputClasses,
        }),
    (error || maxLength) &&
      React.createElement(
        "div",
        { className: "flex justify-between" },
        error
          ? React.createElement(
              "span",
              { className: "text-xs text-error" },
              error
            )
          : React.createElement("span", null),
        maxLength
          ? React.createElement(
              "span",
              { className: "text-xs text-text-muted" },
              `${value.length}/${maxLength}`
            )
          : null
      )
  );
}
