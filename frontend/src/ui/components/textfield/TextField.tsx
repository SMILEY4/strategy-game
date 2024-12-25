import {ReactElement} from "react";
import {useTextField, UseTextFieldProps} from "../headless/useTextField";
import {joinClassNames} from "../utils";
import "./textField.scoped.less";

export interface TextFieldProps extends UseTextFieldProps {
    className?: string;
}

export function TextField(props: TextFieldProps): ReactElement {

    const {elementProps, isDisabled, isReadOnly} = useTextField(props);

    return (
        <div
            className={joinClassNames([
                "text-field",
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
}