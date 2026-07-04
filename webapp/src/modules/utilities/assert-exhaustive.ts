/** Assert that e.g. an if-chain or switch/case is exhaustive at compile time. Throws at runtime if reached. */
export function assertExhaustive(variable: never): never {
    throw new Error("Failed exhaustiveness check for '" + variable + "'");
}