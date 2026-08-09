import type {ParameterDef, ParameterType, ParameterValue} from "./atlas.types.ts";

const TYPES: ParameterType[] = ["boolean", "string", "number"];

export function isParameterType(value: unknown): value is ParameterType {
    return typeof value === "string" && TYPES.includes(value as ParameterType);
}

export function defaultValueForType(type: ParameterType): ParameterValue {
    switch (type) {
        case "boolean":
            return false;
        case "number":
            return 0;
        case "string":
            return "";
    }
}

export function coerceToType(value: unknown, type: ParameterType): ParameterValue {
    switch (type) {
        case "boolean":
            return value === true || value === "true" || value === 1;
        case "number":
            if (typeof value === "number") {
                return Number.isFinite(value) ? value : 0;
            }
            if (typeof value === "string" && value.trim() !== "") {
                const parsed = Number(value);
                return Number.isFinite(parsed) ? parsed : 0;
            }
            if (typeof value === "boolean") {
                return value ? 1 : 0;
            }
            return 0;
        case "string":
            return String(value ?? "");
    }
}

/** Builds the default value map for every parameter of a project. */
export function defaultAttributes(parameters: ParameterDef[]): Record<string, ParameterValue> {
    return Object.fromEntries(parameters.map(param => [param.id, defaultValueForType(param.type)]));
}

/** Fills missing keys with defaults and coerces existing values to each parameter's type. */
export function normalizeAttributes(
    attributes: Partial<Record<string, unknown>> | null | undefined,
    parameters: ParameterDef[],
): Record<string, ParameterValue> {
    const result = defaultAttributes(parameters);
    if (attributes == null) {
        return result;
    }
    for (const param of parameters) {
        const value = attributes[param.id];
        if (value !== undefined) {
            result[param.id] = coerceToType(value, param.type);
        }
    }
    return result;
}
