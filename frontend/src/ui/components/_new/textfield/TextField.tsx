import {ReactElement} from "react";
import {MetalBorder} from "../metalborder/MetalBorder";
import {Depression} from "../depression/Depression";
import {useTextInput} from "../../controls/textinputfield/useTextInput";
import "./../variables.css"
import "./textField.css"

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
            <Depression>
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