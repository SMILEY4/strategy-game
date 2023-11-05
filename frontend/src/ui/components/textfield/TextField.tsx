import {ReactElement} from "react";
import {useTextField, UseTextFieldProps} from "../headless/useTextField";
import {joinClassNames} from "../utils";
import "./textField.scoped.less";

export type TextFieldColor = "blue" | "red" | "green" | "paper"

export interface TextFieldProps extends UseTextFieldProps {
    red?: boolean,
    green?: boolean,
    blue?: boolean,
    paper?: boolean,
    color?: TextFieldColor;
    className?: string;
}

export function TextField(props: TextFieldProps): ReactElement {

    const {elementProps, isDisabled, isReadOnly} = useTextField(props);

    return (
        <div
            className={joinClassNames([
                "text-field",
                "text-field--" + getColor(props),
                isDisabled ? "text-field--disabled" : null,
                isReadOnly ? "text-field--readonly" : null,
                props.className,
            ])}
        >
            <div className="text-field__inner">
                <input {...elementProps}/>
            </div>
        </div>
    );

    function getColor(props: TextFieldProps): TextFieldColor {
        return props.color
            || (props.red ? "red" : undefined)
            || (props.green ? "green" : undefined)
            || (props.blue ? "blue" : undefined)
            || (props.paper ? "paper" : undefined)
            || "red";
    }
}