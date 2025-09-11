import {ReactElement} from "react";
import {useTextField, UseTextFieldProps} from "../headless/useTextField";
import {joinClassNames} from "../window/utils";
import "./textField.scoped.less";
import {BaseProps} from "../base/base";

export interface TextFieldProps extends UseTextFieldProps, BaseProps {
}

export function TextField(props: TextFieldProps): ReactElement {

    const {elementProps, isDisabled, isReadOnly} = useTextField(props);

    return (
        <div
            className={joinClassNames([
                "text-field",
                isDisabled ? "text-field--disabled" : null,
                isReadOnly ? "text-field--readonly" : null,
                ...BaseProps.buildBaseClassNames(props)
            ])}
            style={props.style}
        >
            <div className="text-field__inner">
                <input {...elementProps}/>
            </div>
        </div>
    );
}