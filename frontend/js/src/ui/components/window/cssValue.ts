export interface CssValue {
    unit: "px" | "%" | "raw";
    value: number | string;
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

    export function raw(value: string): CssValue {
        return {
            unit: "raw",
            value: value,
        };
    }

    export function format(value: CssValue | null): string | undefined {
        if (value?.unit === "px") {
            return value.value + "px";
        }
        if (value?.unit === "%") {
            return value.value + "%";
        }
        if (value?.unit === "raw") {
            return value.value + "";
        }
        return undefined;
    }

}