import {type ReactElement} from "react";
import styles from "./textField.module.less";
import classNames from "classnames";
import {Txt} from "@modules/uicomponents/text/Txt.tsx";

type Intent =
    | "neutral"
    | "positive"
    | "negative"

type IntentShorthands = {
    neutral?: boolean;
    positive?: boolean;
    negative?: boolean;
}

type TextField_MessageProps = {
    intent?: Intent;
    className?: string;
    children?: string;
} & IntentShorthands

export function TextField_Message(props: TextField_MessageProps): ReactElement | null {
    const {
        className,
        children,

        // intent
        intent,
        neutral,
        positive,
        negative,

    } = props;

    if (children === undefined) {
        return null;
    }
    return (
        <Txt.Body>
            <Txt.String
                className={classNames(styles["text-field__message"], className)}
                intent={intent}
                neutral={neutral}
                positive={positive}
                negative={negative}
            >
                {children}
            </Txt.String>
        </Txt.Body>
    );
}

TextField_Message.displayName = "TextField.Message";

