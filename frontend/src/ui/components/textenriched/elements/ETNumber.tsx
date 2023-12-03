import {ReactElement} from "react";
import "./etElements.scoped.less";
import {joinClassNames} from "../../utils";

export interface ETNumberProps {
    /*
    - none: always no color, independent of provided value
    - pos:  always "positive" (green) color, independent of provided value
    - neg:  always "negative" (red) color, independent of provided value
    - auto:  color determined by provided value -> "-x" = "negative color", "+x" = "positive color", color of "0" dependent on format
    - auto-inv:  color determined by provided value -> "-x" = "positive color", "+x" = "negative color", color of "0" dependent on format
    */
    type?: "none" | "pos" | "neg" | "info" | "auto" | "auto-inv";
    typeNone?: boolean,
    pos?: boolean,
    neg?: boolean,
    info?: boolean,
    typeAuto?: boolean,
    typeAutoInv?: boolean,
    /*
    - signed:       always add "+" or "-" to non-zero values
    - signed-0p:    always add "+" or "-", zero with "+" (-> zero counts as "positive" value)
    - signed-0n:    always add "+" or "-", zero with "-" (-> zero counts as "negative" value)
    - unsigned:     never add "+", "-" still added
     */
    format?: "signed" | "signed-0p" | "signed-0n" | "unsigned";
    signed?: boolean,
    signed0p?: boolean,
    signed0n?: boolean,
    unsigned?: boolean,
    /*
    number of decimal places
     */
    decPlaces?: number;
    /*
    the value to format and display
    */
    children: number
}

export function ETNumber(props: ETNumberProps): ReactElement {
    const format = getFormat(props);
    const type = getType(props, format, props.children);
    const decPlaces = getDecimalPlaces(props);
    return (
        <span className={joinClassNames([
            "et-element",
            "et-number",
            "et-number--type-" + type,
        ])}>
            {formatValue(format, props.children, decPlaces)}
        </span>
    );

    function getFormat(props: ETNumberProps): "signed" | "signed-0p" | "signed-0n" | "unsigned" {
        if (props.format === "signed" || props.signed) {
            return "signed";
        }
        if (props.format === "signed-0p" || props.signed0p) {
            return "signed-0p";
        }
        if (props.format === "signed-0n" || props.signed0n) {
            return "signed-0n";
        }
        if (props.format === "unsigned" || props.unsigned) {
            return "unsigned";
        }
        return "signed";
    }

    function getType(props: ETNumberProps, format: "signed" | "signed-0p" | "signed-0n" | "unsigned", value: number): "pos" | "neg" | "info" | "none" {
        if (props.type === "none" || props.typeNone) {
            return "none";
        }
        if (props.type === "pos" || props.pos) {
            return "pos";
        }
        if (props.type === "neg" || props.neg) {
            return "neg";
        }
        if (props.type === "info" || props.info) {
            return "info";
        }
        if (props.type === "auto" || props.typeAuto) {
            return getTypeAuto(format, value);
        }
        if (props.type === "auto-inv" || props.typeAutoInv) {
            const type = getTypeAuto(format, value);
            if (type === "pos") return "neg";
            if (type === "neg") return "pos";
            return "none";
        }
        return getTypeAuto(format, value);
    }

    function getTypeAuto(format: "signed" | "signed-0p" | "signed-0n" | "unsigned", value: number): "pos" | "neg" | "none" {
        if (format === "signed-0p") {
            if (value >= 0) return "pos";
            if (value < 0) return "neg";
            return "none";
        }
        if (format === "signed-0n") {
            if (value > 0) return "pos";
            if (value <= 0) return "neg";
            return "none";
        }
        if (value > 0) return "pos";
        if (value < 0) return "neg";
        return "none";
    }

    function getDecimalPlaces(props: ETNumberProps): number {
        return (props.decPlaces === undefined || props.decPlaces === null) ? 4 : props.decPlaces;
    }

    function formatValue(format: "signed" | "signed-0p" | "signed-0n" | "unsigned", value: number, decPlaces: number): string {
        const d = Math.pow(10, decPlaces);
        const formattedValue = Math.round(value * d) / d;
        const absFormattedValue = Math.abs(formattedValue);
        if (format === "signed") {
            if (formattedValue > 0) return "+" + absFormattedValue;
            if (formattedValue < 0) return "-" + absFormattedValue;
            return "0";
        }
        if (format === "signed-0p") {
            if (formattedValue > 0) return "+" + absFormattedValue;
            if (formattedValue < 0) return "-" + absFormattedValue;
            return "+0";
        }
        if (format === "signed-0n") {
            if (formattedValue > 0) return "+" + absFormattedValue;
            if (formattedValue < 0) return "-" + absFormattedValue;
            return "-0";
        }
        if (format === "unsigned") {
            if (formattedValue > 0) return "" + absFormattedValue;
            if (formattedValue < 0) return "-" + absFormattedValue;
            return "0";
        }
        return "err";
    }


}