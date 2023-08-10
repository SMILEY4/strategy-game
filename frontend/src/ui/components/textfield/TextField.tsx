import {ReactElement} from "react";
import {MetalBorder} from "../objects/metalborder/MetalBorder";
import {Depression} from "../objects/depression/Depression";
import "../variables.css"
import "./textField.css"
import {useTextInput} from "./useTextInput";

export interface TextFieldProps {
    borderType?: "gold" | "silver"
    value: string,
    placeholder?: string,
    type?: "text" | "email" | "password",
    onAccept: (value: string) => void
    className?: string;
}

export function TextField(props: TextFieldProps): ReactElement {

    const {
        currentValue,
        isDisabled,
        handleChange,
        handleBlur,
        handleKeyDown,
    } = useTextInput(props.value, false, props.onAccept);

    return (
        <MetalBorder className="text-field" type={props.borderType || "gold"}>
            <Depression interactiveFocus>
                <input
                    className="text-field__input"
                    placeholder={props.placeholder}
                    value={currentValue}
                    disabled={isDisabled}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    type={props.type || "text"}
                />
            </Depression>
        </MetalBorder>
    );
}