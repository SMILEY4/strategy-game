import {HTMLInputTypeAttribute, ReactElement} from "react";
import {BorderMetallic} from "../../objects/border/metallic/BorderMetallic";
import {useTextInput} from "./useTextInput";
import {ElementInset} from "../../objects/element/inset/ElementInset";
import "./textInput.css";

export interface TextInputProps {
    value: string,
    type?: "text" | "email" | "password",
    border?: "gold" | "silver"
    disabled: boolean,
    onAccept: (value: string) => void
}

export function TextInput(props: TextInputProps): ReactElement {

    const {
        currentValue,
        isDisabled,
        handleChange,
        handleBlur,
        handleKeyDown,
    } = useTextInput(props.value, props.disabled, props.onAccept);

    return (
        <BorderMetallic color={props.border} className="text-input">
            <ElementInset className="text-input__content">
                <input
                    className="text-input__input"
                    placeholder=""
                    value={currentValue}
                    disabled={isDisabled}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    type={getType(props)}
                />
            </ElementInset>
        </BorderMetallic>
    );

    function getType(props: TextInputProps): HTMLInputTypeAttribute {
        if(props.type === "email") return "email"
        if(props.type === "password") return "password"
        return "text"
    }

}