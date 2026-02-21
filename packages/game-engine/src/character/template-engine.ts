export interface FieldDefinition {
  key: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "boolean";
  min?: number;
  max?: number;
  options?: string[];
  defaultValue?: unknown;
  formula?: string;
}

export interface TemplateSchema {
  fields: FieldDefinition[];
}

/**
 * Validate character data against a template schema.
 */
export function validateCharacterData(
  data: Record<string, unknown>,
  schema: TemplateSchema
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of schema.fields) {
    const value = data[field.key];

    if (value === undefined || value === null) continue;

    switch (field.type) {
      case "number": {
        if (typeof value !== "number") {
          errors.push(`${field.label}: deve ser um número`);
          continue;
        }
        if (field.min !== undefined && value < field.min) {
          errors.push(`${field.label}: mínimo ${field.min}`);
        }
        if (field.max !== undefined && value > field.max) {
          errors.push(`${field.label}: máximo ${field.max}`);
        }
        break;
      }
      case "text":
      case "textarea": {
        if (typeof value !== "string") {
          errors.push(`${field.label}: deve ser texto`);
        }
        break;
      }
      case "boolean": {
        if (typeof value !== "boolean") {
          errors.push(`${field.label}: deve ser verdadeiro/falso`);
        }
        break;
      }
      case "select": {
        if (
          typeof value !== "string" ||
          (field.options && !field.options.includes(value))
        ) {
          errors.push(`${field.label}: valor inválido`);
        }
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get default values from a template schema.
 */
export function getDefaultValues(
  schema: TemplateSchema
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of schema.fields) {
    if (field.defaultValue !== undefined) {
      defaults[field.key] = field.defaultValue;
    }
  }
  return defaults;
}
