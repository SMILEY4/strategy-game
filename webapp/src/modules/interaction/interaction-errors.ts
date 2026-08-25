import type {InteractionCancelReason} from "./interaction.types.ts";

export class InteractionBusyError extends Error {
    readonly code = "INTERACTION_BUSY";

    constructor() {
        super("An interaction is already active");
    }
}

export class InteractionCancelledError extends Error {
    readonly code = "INTERACTION_CANCELLED";
    readonly reason: InteractionCancelReason;

    constructor(reason: InteractionCancelReason) {
        super("Interaction was cancelled");
        this.reason = reason;
    }
}

export class InteractionDefinitionError extends Error {
    readonly code = "INVALID_INTERACTION_DEFINITION";

    constructor(message: string) {
        super(message);
    }
}
