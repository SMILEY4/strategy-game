import type {DurationUnit} from "@modules/utilities/time-units.ts";

export function delay(duration: DurationUnit): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration.getValueMilliseconds()));
}