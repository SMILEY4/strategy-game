export function assertExhaustive(variable: never): never {
    throw new Error("Failed exhaustiveness check for '" + variable + "'");
}