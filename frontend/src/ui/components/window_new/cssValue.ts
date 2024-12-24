export interface CssValue {
    unit: "px" | "%" | "fit-content";
    value: number;
}

export namespace CssValue {

    export function px(value: number): CssValue {
        return {
            unit: "px",
            value: value,
        };
    }

    export function percent(value: number): CssValue {
        return {
            unit: "%",
            value: value,
        };
    }

    export function fitContent(): CssValue {
        return {
            unit: "fit-content",
            value: 0,
        };
    }

    export function format(value: CssValue | null): string | undefined {
        if (value?.unit === "px") {
            return value.value + "px";
        }
        if (value?.unit === "%") {
            return value.value + "%";
        }
        if (value?.unit === "fit-content") {
            return "fit-content";
        }
        return undefined;
    }

}