import {ReactElement} from "react";
import {useTextField, UseTextFieldProps} from "../../headless/useTextField";
import {joinClassNames} from "../../utils";
import "./textFieldOutline.scoped.css";

export interface TextFieldOutlineProps extends UseTextFieldProps {
    className?: string;
}

export function TextFieldOutline(props: TextFieldOutlineProps): ReactElement {

    const {elementProps, isDisabled, isReadOnly} = useTextField(props);

    return (
        <input
            {...elementProps}
            className={joinClassNames([
                "text-field",
                "text-field-outline",
                isDisabled ? "text-field-outline--disabled text-field--disabled" : null,
                isReadOnly ? "text-field-outline--readonly text-field--readonly" : null,
                props.className,
            ])}
        />
    );
}