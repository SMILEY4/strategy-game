
export interface ValidationResult {
    reason: string,
    valid: boolean,
}


export function validations(block: (ctx: ValidationContext) => void): ValidationContext {
    const ctx = new ValidationContext();
    block(ctx);
    return ctx;
}


export class ValidationContext {

    private readonly results: ValidationResult[] = [];

    public validate(reason: string, block: () => boolean) {
        const valid = block();
        this.results.push({reason: reason, valid: valid});
    }

    public getResults(): ValidationResult[] {
        return this.results;
    }

    public getResultsValid(): ValidationResult[] {
        return this.results.filter(r => r.valid);
    }

    public getResultsInvalid(): ValidationResult[] {
        return this.results.filter(r => !r.valid);
    }

    public isValid(): boolean {
        return this.results.every(r => r.valid);
    }

    public isInvalid(): boolean {
        return this.results.some(r => !r.valid);
    }

}

