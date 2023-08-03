import {HTMLInputTypeAttribute, ReactElement} from "react";
import {MetalBorder} from "../metalborder/MetalBorder";
import "./textInput.css";
import {useTextInput} from "./useTextInput";
import {InsetElement} from "../insetElement/InsetElement";

export interface TextInputProps {
    value: string,
    type?: "text" | "email" | "password",
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
        <MetalBorder className="text-input">
            <InsetElement className="text-input__content">
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
            </InsetElement>
        </MetalBorder>
    );

    function getType(props: TextInputProps): HTMLInputTypeAttribute {
        if(props.type === "email") return "email"
        if(props.type === "password") return "password"
        return "text"
    }

}