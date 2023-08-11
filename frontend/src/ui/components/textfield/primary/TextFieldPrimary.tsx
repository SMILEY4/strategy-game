import {ReactElement} from "react";
import {MetalBorder} from "../../objects/metalborder/MetalBorder";
import {Depression} from "../../objects/depression/Depression";
import "../../variables.css";
import "./textFieldPrimary.css";
import {useTextField, UseTextFieldProps} from "../../headless/useTextField";
import {joinClassNames} from "../../utils";

export interface TextFieldPrimaryProps extends UseTextFieldProps {
    borderType?: "gold" | "silver";
    className?: string;
}

export function TextFieldPrimary(props: TextFieldPrimaryProps): ReactElement {

    const {elementProps, isDisabled, isReadOnly} = useTextField(props);

    return (
        <MetalBorder
            className={joinClassNames([
                "text-field",
                "text-field-primary",
                isDisabled ? "text-field-primary--disabled text-field--disabled" : null,
                isReadOnly ? "text-field-primary--readonly text-field--readonly" : null,
                props.className,
            ])}
            type={props.borderType || "gold"}
        >
            <Depression interactiveFocus={!isDisabled && !isReadOnly}>
                <input
                    {...elementProps}
                    className="text-field-primary__input"
                />
            </Depression>
        </MetalBorder>
    );
}