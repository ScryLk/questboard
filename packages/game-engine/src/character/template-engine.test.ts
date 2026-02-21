import { describe, it, expect } from "vitest";
import {
  validateCharacterData,
  getDefaultValues,
} from "./template-engine.js";
import type { TemplateSchema } from "./template-engine.js";

const testSchema: TemplateSchema = {
  fields: [
    { key: "name", label: "Nome", type: "text" },
    {
      key: "level",
      label: "Nível",
      type: "number",
      min: 1,
      max: 20,
      defaultValue: 1,
    },
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "isNpc", label: "NPC", type: "boolean", defaultValue: false },
    {
      key: "alignment",
      label: "Alinhamento",
      type: "select",
      options: ["lawful-good", "neutral", "chaotic-evil"],
      defaultValue: "neutral",
    },
  ],
};

describe("validateCharacterData", () => {
  it("returns valid for correct data", () => {
    const data = {
      name: "Gandalf",
      level: 10,
      bio: "A wizard",
      isNpc: false,
      alignment: "neutral",
    };
    const result = validateCharacterData(data, testSchema);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("allows missing optional fields", () => {
    const data = { name: "Frodo" };
    const result = validateCharacterData(data, testSchema);
    expect(result.valid).toBe(true);
  });

  it("reports error for wrong number type", () => {
    const data = { level: "ten" };
    const result = validateCharacterData(data, testSchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Nível: deve ser um número");
  });

  it("reports error for number below min", () => {
    const data = { level: 0 };
    const result = validateCharacterData(data, testSchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Nível: mínimo 1");
  });

  it("reports error for number above max", () => {
    const data = { level: 25 };
    const result = validateCharacterData(data, testSchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Nível: máximo 20");
  });

  it("reports error for wrong text type", () => {
    const data = { name: 42 };
    const result = validateCharacterData(data, testSchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Nome: deve ser texto");
  });

  it("reports error for wrong boolean type", () => {
    const data = { isNpc: "yes" };
    const result = validateCharacterData(data, testSchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("NPC: deve ser verdadeiro/falso");
  });

  it("reports error for invalid select option", () => {
    const data = { alignment: "true-neutral" };
    const result = validateCharacterData(data, testSchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Alinhamento: valor inválido");
  });

  it("reports error for non-string select value", () => {
    const data = { alignment: 42 };
    const result = validateCharacterData(data, testSchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Alinhamento: valor inválido");
  });

  it("validates textarea type", () => {
    const data = { bio: 123 };
    const result = validateCharacterData(data, testSchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Bio: deve ser texto");
  });

  it("reports multiple errors", () => {
    const data = { level: "abc", isNpc: 0 };
    const result = validateCharacterData(data, testSchema);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("getDefaultValues", () => {
  it("returns defaults for fields that have them", () => {
    const defaults = getDefaultValues(testSchema);
    expect(defaults).toEqual({
      level: 1,
      isNpc: false,
      alignment: "neutral",
    });
  });

  it("returns empty object for schema with no defaults", () => {
    const schema: TemplateSchema = {
      fields: [{ key: "name", label: "Nome", type: "text" }],
    };
    expect(getDefaultValues(schema)).toEqual({});
  });
});
