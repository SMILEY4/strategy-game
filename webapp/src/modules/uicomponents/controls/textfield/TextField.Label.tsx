import {type ReactElement} from "react";
import "./textField.less";
import classNames from "classnames";

interface TextField_LabelProps {
    children?: string;
    className?: string;
}

export function TextField_Label(props: TextField_LabelProps): ReactElement | null {
    const {
        className,
        children
    } = props;

    if (children === undefined) {
        return null;
    }
    return (
        <span className={classNames("text-field__label", className)}>
            {children}
        </span>
    );
}

TextField_Label.displayName = "TextField.Label";

