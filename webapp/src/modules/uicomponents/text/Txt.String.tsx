import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import styles from "./text.module.less";

type Intent =
    | "neutral"
    | "positive"
    | "negative"

type IntentShorthands = {
    neutral?: boolean;
    positive?: boolean;
    negative?: boolean;
}

export type Txt_StringProps = {
        intent?: Intent;
        children: string
    }
    & Omit<ComponentPropsWithRef<"span">, "children">
    & IntentShorthands


export function Txt_String(props: Txt_StringProps): ReactElement {

    const {
        className,
        children,

        // intent
        intent,
        neutral,
        positive,
        negative,

        ...rest
    } = props;

    const intentResolved = resolveIntent({intent, neutral, positive, negative});

    return (
        <span
            {...rest}
            className={classNames(styles.txt__string, className)}
            data-intent={intentResolved}
        >
            {children}
        </span>
    );
}

function resolveIntent(props: { intent?: Intent } & IntentShorthands): Intent | undefined {
    if (props.intent) return props.intent;
    if (props.neutral) return "neutral";
    if (props.positive) return "positive";
    if (props.negative) return "negative";
    return undefined;
}