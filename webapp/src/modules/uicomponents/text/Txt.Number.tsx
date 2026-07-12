import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import "./text.less";

export type Txt_NumberProps = {
    value: number,
    decimals?: number,
    percentage?: boolean,
    forceSign?: boolean,
    colored?: boolean,
} & ComponentPropsWithRef<"span">

export function Txt_Number(props: Txt_NumberProps): ReactElement {

    const {
        value,
        decimals,
        percentage = false,
        forceSign = false,
        colored = false,
        className,
        ...rest
    } = props;

    let formatted: string;

    if (!isFinite(value)) {
        formatted = "—";
    } else {
        const displayValue = percentage ? value * 100 : value;
        const fixedDecimals = decimals ?? (percentage ? 0 : 0);

        formatted = displayValue.toFixed(fixedDecimals);

        if (percentage) {
            formatted += "%";
        }

        if (forceSign && value > 0) {
            formatted = "+" + formatted;
        }
    }

    const colorClass = colored
        ? value > 0
            ? "txt__number--positive"
            : value < 0
                ? "txt__number--negative"
                : "txt__number--zero"
        : undefined;

    return (
        <span
            {...rest}
            className={classNames("txt__number", colorClass, className)}
        >
            {formatted}
        </span>
    );
}
