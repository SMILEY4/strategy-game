export class InteractionBusyError extends Error {
    readonly code = "INTERACTION_BUSY";

    constructor() {
        super("An interaction is already active");
    }
}

export class InteractionDefinitionError extends Error {
    readonly code = "INVALID_INTERACTION_DEFINITION";

    constructor(message: string) {
        super(message);
    }
}
