import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import styles from "./text.module.less";

export type Txt_NumberProps = {
    decimals?: number,
    percentage?: boolean,
    forceSign?: boolean,
    colored?: boolean,
    children: number,
} & Omit<ComponentPropsWithRef<"span">, "children">

export function Txt_Number(props: Txt_NumberProps): ReactElement {

    const {
        decimals,
        percentage = false,
        forceSign = false,
        colored = false,
        className,
        children,
        ...rest
    } = props;

    const value = children;

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
            ? styles["txt__number--positive"]
            : value < 0
                ? styles["txt__number--negative"]
                : styles["txt__number--zero"]
        : undefined;

    return (
        <span
            {...rest}
            className={classNames(styles.txt__number, colorClass, className)}
        >
            {formatted}
        </span>
    );
}
