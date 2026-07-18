import {assertExhaustive} from "@modules/utilities/assert-exhaustive.ts";

export type CssValue =
    | { unit: "px", value: number }
    | { unit: "%", value: number }
    | { unit: "raw", value: string }

export const CssValueUtils = {

    px: (value: number): CssValue => ({
        unit: "px", value: value,
    }),

    percentage: (value: number): CssValue => ({
        unit: "%", value: value,
    }),

    raw: (value: string): CssValue => ({
        unit: "raw", value: value,
    }),

    format: (value: CssValue | null): string | undefined => {
        if (value === null) return null
        if (value.unit === "px") return `${value.value}px`;
        if (value.unit === "%") return `${value.value}%`;
        if (value.unit === "raw") return value.value;
        assertExhaustive(value);
    },
};