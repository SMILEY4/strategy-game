import {type ReactElement} from "react";
import "./textField.less";
import classNames from "classnames";

interface TextField_MessageProps {
    children?: string;
    className?: string;
}

export function TextField_Message(props: TextField_MessageProps): ReactElement | null {
    const {
        className,
        children
    } = props;

    if (children === undefined) {
        return null;
    }
    return (
        <span className={classNames("text-field__message", className)}>
            {children}
        </span>
    );
}

TextField_Message.displayName = "TextField.Message";

