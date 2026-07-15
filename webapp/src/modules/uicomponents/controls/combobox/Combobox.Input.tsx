import {type ComponentPropsWithoutRef, type ReactElement} from "react";
import classNames from "classnames";
import "./combobox.less";
import {useComboBoxContext} from "@modules/uicomponents/controls/combobox/ComboBox.Context.tsx";


type Combobox_InputProps = {}
    & ComponentPropsWithoutRef<"input">

export function Combobox_Input(props: Combobox_InputProps): ReactElement {

    const combobox = useComboBoxContext();

    const {
        className,
        placeholder,
        ...rest
    } = props;

    return (
        <input
            {...rest}
            className={classNames("combobox__input", className)}
            type="text"
            autoComplete="off"
            placeholder={placeholder}
            aria-placeholder={placeholder}
            {...combobox.data.textFieldProps}
        />
    );
}

Combobox_Input.displayName = "Combobox.Input";
