import React, {ReactElement, useState} from "react";
import {joinClassNames} from "../../utils";
import {GiCheckMark} from "react-icons/gi";
import "../../variables.css";
import "./checkboxOutline.css";

export interface CheckboxOutlineProps {
    round?: boolean,
    onSelect?: (selected: boolean) => void,
    className?: string;
}

export function CheckboxOutline(props: CheckboxOutlineProps): ReactElement {

    const [selected, setSelected] = useState(false);

    return (
        <div
            className={joinClassNames([
                "checkbox",
                "checkbox-outline",
                props.round ? "checkbox-outline--round" : null,
                props.className
            ])}
            onClick={handleClick}
        >
            {selected && (
                <GiCheckMark className="checkbox-outline__checkmark"/>
            )}
        </div>
    );

    function handleClick() {
        const nextValue = !selected
        setSelected(nextValue);
        props.onSelect && props.onSelect(nextValue)
    }

}