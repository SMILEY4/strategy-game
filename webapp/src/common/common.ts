export function checkExhaustive(variable: never): never {
    throw new Error("Reached exhaustiveness check for '" + variable + "'");
}