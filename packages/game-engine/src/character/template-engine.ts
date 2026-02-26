/**
 * Template Engine — evaluate formulas, compute derived fields, validate,
 * generate defaults, and migrate character data between template versions.
 */

// ── Types ──

export interface FieldDefinition {
  key: string;
  label: string;
  type: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: unknown;
  formula?: string;
  computed?: boolean;
  readOnly?: boolean;
  condition?: string;
  group?: string;
  maxFormula?: string;
  tempHp?: boolean;
  slotLevels?: number[];
  denominations?: Array<{ key: string; label: string; rate: number }>;
  itemFields?: FieldDefinition[];
  successCount?: number;
  failCount?: number;
}

export interface TemplateSection {
  id: string;
  label: string;
  icon?: string;
  columns?: number;
  fields: FieldDefinition[];
}

export interface TemplateSchema {
  sections: TemplateSection[];
}

export interface FormulaContext {
  data: Record<string, unknown>;
  level: number;
  experience: number;
}

// ── Formula Evaluation ──

/**
 * Evaluate a formula string with field references.
 * Supports: {field.path}, floor(), ceil(), min(), max(), if(), lookup(),
 * arithmetic operators (+, -, *, /, %), parentheses.
 *
 * Examples:
 *   "{abilities.strength.score}" → 18
 *   "floor(({abilities.dexterity.score} - 10) / 2)" → 3
 *   "if({level} >= 5, 3, 2)" → proficiency bonus
 *   "10 + {armor.base} + {abilities.dexterity.modifier}" → AC
 */
export function evaluateFormula(
  formula: string,
  context: FormulaContext
): number {
  try {
    // Replace field references with values
    let expr = formula.replace(/\{([^}]+)\}/g, (_match, path: string) => {
      const value = resolveFieldPath(path, context);
      return typeof value === "number" ? String(value) : "0";
    });

    // Replace function calls
    expr = replaceFunctions(expr);

    // Sanitize: only allow numbers, operators, parentheses, spaces, dots
    const sanitized = expr.replace(/[^0-9+\-*/%()._, ]/g, "");

    // Evaluate safely using Function (no eval)
    const fn = new Function(`"use strict"; return (${sanitized});`);
    const result = fn();

    if (typeof result !== "number" || !isFinite(result)) return 0;
    return result;
  } catch {
    return 0;
  }
}

function resolveFieldPath(path: string, context: FormulaContext): unknown {
  // Built-in paths
  if (path === "level") return context.level;
  if (path === "experience") return context.experience;

  // Traverse data object
  const parts = path.split(".");
  let current: unknown = context.data;

  for (const part of parts) {
    if (current === null || current === undefined) return 0;
    if (typeof current === "object" && !Array.isArray(current)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return 0;
    }
  }

  return typeof current === "number" ? current : 0;
}

function replaceFunctions(expr: string): string {
  // Process if(condition, trueVal, falseVal)
  expr = expr.replace(
    /if\s*\(([^,]+),\s*([^,]+),\s*([^)]+)\)/gi,
    (_match, condition: string, trueVal: string, falseVal: string) => {
      const condResult = evaluateCondition(condition.trim());
      return condResult ? trueVal.trim() : falseVal.trim();
    }
  );

  // Process floor(), ceil(), min(), max()
  expr = expr.replace(/floor\s*\(([^)]+)\)/gi, "Math.floor($1)");
  expr = expr.replace(/ceil\s*\(([^)]+)\)/gi, "Math.ceil($1)");
  expr = expr.replace(/min\s*\(([^)]+)\)/gi, "Math.min($1)");
  expr = expr.replace(/max\s*\(([^)]+)\)/gi, "Math.max($1)");

  // Process lookup(value, v1:r1, v2:r2, ...)
  expr = expr.replace(
    /lookup\s*\(([^)]+)\)/gi,
    (_match, args: string) => {
      const parts = args.split(",").map((s) => s.trim());
      if (parts.length < 2) return "0";
      const lookupValue = parseFloat(parts[0] ?? "0") || 0;
      for (let i = 1; i < parts.length; i++) {
        const pair = (parts[i] ?? "").split(":");
        if (pair.length === 2) {
          const threshold = parseFloat(pair[0] ?? "0") || 0;
          const result = parseFloat(pair[1] ?? "0") || 0;
          if (lookupValue <= threshold) return String(result);
        }
      }
      const lastPair = (parts[parts.length - 1] ?? "").split(":");
      return lastPair.length === 2 ? (lastPair[1] ?? "0") : "0";
    }
  );

  return expr;
}

function evaluateCondition(condition: string): boolean {
  const operators = [">=", "<=", "!=", "==", ">", "<"] as const;

  for (const op of operators) {
    const idx = condition.indexOf(op);
    if (idx !== -1) {
      const left = parseFloat(condition.slice(0, idx).trim()) || 0;
      const right = parseFloat(condition.slice(idx + op.length).trim()) || 0;
      switch (op) {
        case ">=": return left >= right;
        case "<=": return left <= right;
        case ">": return left > right;
        case "<": return left < right;
        case "==": return left === right;
        case "!=": return left !== right;
      }
    }
  }

  return parseFloat(condition) > 0;
}

// ── Computed Fields ──

/**
 * Compute all fields that have formulas in the template.
 * Returns a map of fieldPath -> computed value.
 */
export function computeAllFields(
  schema: TemplateSchema,
  formulas: Record<string, string>,
  context: FormulaContext
): Record<string, number> {
  const computed: Record<string, number> = {};

  // First pass: compute formula-based fields from the formulas map
  for (const [fieldPath, formula] of Object.entries(formulas)) {
    computed[fieldPath] = evaluateFormula(formula, context);
  }

  // Second pass: compute inline formulas from field definitions
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.formula && !formulas[field.key]) {
        computed[field.key] = evaluateFormula(field.formula, context);
      }
      if (field.maxFormula) {
        computed[`${field.key}.max`] = evaluateFormula(field.maxFormula, context);
      }
    }
  }

  return computed;
}

/**
 * Get all field paths that depend on a given field path.
 * Used for incremental recomputation when a single field changes.
 */
export function getDependents(
  fieldPath: string,
  formulas: Record<string, string>,
  schema: TemplateSchema
): string[] {
  const dependents: string[] = [];
  const pattern = `{${fieldPath}}`;

  for (const [path, formula] of Object.entries(formulas)) {
    if (formula.includes(pattern)) {
      dependents.push(path);
    }
  }

  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.formula?.includes(pattern)) {
        dependents.push(field.key);
      }
      if (field.maxFormula?.includes(pattern)) {
        dependents.push(`${field.key}.max`);
      }
    }
  }

  return dependents;
}

/**
 * Resolve a dice notation that may contain field references.
 * E.g., "1d20+{abilities.dexterity.modifier}" → "1d20+3"
 */
export function resolveDiceNotation(
  notation: string,
  context: FormulaContext
): string {
  return notation.replace(/\{([^}]+)\}/g, (_match, path: string) => {
    const value = resolveFieldPath(path, context);
    const num = typeof value === "number" ? value : 0;
    return num >= 0 ? `+${num}` : String(num);
  }).replace(/^\+/, "");
}

// ── Validation ──

/**
 * Validate character data against a template schema.
 */
export function validateCharacterData(
  data: Record<string, unknown>,
  schema: TemplateSchema
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.computed || field.readOnly) continue;

      const value = getNestedValue(data, field.key);
      if (value === undefined || value === null) continue;

      switch (field.type) {
        case "number":
        case "ability_score":
        case "resource_counter": {
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
        case "textarea":
        case "markdown": {
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
          if (typeof value !== "string") {
            errors.push(`${field.label}: valor inválido`);
          } else if (field.options && !field.options.some((o) => o.value === value)) {
            errors.push(`${field.label}: opção inválida`);
          }
          break;
        }
        case "hp": {
          if (typeof value === "object" && value !== null) {
            const hp = value as Record<string, unknown>;
            if (typeof hp["current"] !== "number" || typeof hp["max"] !== "number") {
              errors.push(`${field.label}: formato HP inválido`);
            }
          }
          break;
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get default values from a template schema.
 */
export function getDefaultValues(
  schema: TemplateSchema,
  defaults: Record<string, unknown> = {}
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...defaults };

  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.defaultValue !== undefined && !(field.key in result)) {
        result[field.key] = field.defaultValue;
      }
      if (!(field.key in result)) {
        switch (field.type) {
          case "number":
          case "ability_score":
          case "resource_counter":
            result[field.key] = field.min ?? 0;
            break;
          case "hp":
            result[field.key] = { current: 0, max: 0, temp: 0 };
            break;
          case "death_saves":
            result[field.key] = { successes: 0, failures: 0 };
            break;
          case "currency":
            if (field.denominations) {
              const currency: Record<string, number> = {};
              for (const denom of field.denominations) {
                currency[denom.key] = 0;
              }
              result[field.key] = currency;
            }
            break;
          case "boolean":
            result[field.key] = false;
            break;
          case "text":
          case "textarea":
          case "markdown":
            result[field.key] = "";
            break;
          case "spell_slot":
            result[field.key] = {};
            break;
          case "condition_tracker":
            result[field.key] = [];
            break;
          case "repeatable":
            result[field.key] = [];
            break;
        }
      }
    }
  }

  return result;
}

// ── Migration ──

/**
 * Migrate character data from one template version to another.
 * Preserves existing fields, adds new defaults, removes obsolete fields.
 */
export function migrateData(
  currentData: Record<string, unknown>,
  oldSchema: TemplateSchema,
  newSchema: TemplateSchema,
  newDefaults: Record<string, unknown> = {}
): { data: Record<string, unknown>; changes: string[] } {
  const changes: string[] = [];
  const newData: Record<string, unknown> = {};

  const newFieldKeys = new Set<string>();
  for (const section of newSchema.sections) {
    for (const field of section.fields) {
      newFieldKeys.add(field.key);
    }
  }

  const oldFieldKeys = new Set<string>();
  for (const section of oldSchema.sections) {
    for (const field of section.fields) {
      oldFieldKeys.add(field.key);
    }
  }

  for (const key of newFieldKeys) {
    if (key in currentData) {
      newData[key] = currentData[key];
    } else {
      const defaultVal = newDefaults[key];
      if (defaultVal !== undefined) {
        newData[key] = defaultVal;
        changes.push(`Added field: ${key}`);
      }
    }
  }

  for (const key of oldFieldKeys) {
    if (!newFieldKeys.has(key)) {
      changes.push(`Removed field: ${key}`);
    }
  }

  return { data: newData, changes };
}

// ── Helpers ──

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === "object" && !Array.isArray(current)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Set a nested value in an object by dot-path.
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const parts = path.split(".");
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    if (!(part in current) || typeof current[part] !== "object" || current[part] === null) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1]!;
  current[lastPart] = value;
}

/**
 * Get all field definitions from a template schema, flattened.
 */
export function getAllFields(schema: TemplateSchema): FieldDefinition[] {
  const fields: FieldDefinition[] = [];
  for (const section of schema.sections) {
    fields.push(...section.fields);
  }
  return fields;
}
