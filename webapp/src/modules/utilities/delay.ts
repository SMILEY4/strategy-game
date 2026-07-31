import type {DurationUnit} from "@modules/utilities/time-units.ts";

/** Return a promise that resolves after the given duration. */
export function delay(duration: DurationUnit): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration.getValueMilliseconds()));
}