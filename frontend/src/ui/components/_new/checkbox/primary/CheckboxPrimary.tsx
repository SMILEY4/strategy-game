import React, {ReactElement, useState} from "react";
import {Depression} from "../../depression/Depression";
import {MetalBorder} from "../../metalborder/MetalBorder";
import {joinClassNames} from "../../../utils";
import {GiCheckMark} from "react-icons/gi";
import "../../variables.css";
import "./checkboxPrimary.css";

export interface CheckboxPrimaryProps {
    borderType?: "gold" | "silver"
    round?: boolean,
    onSelect?: (selected: boolean) => void,
    className?: string;
}

export function CheckboxPrimary(props: CheckboxPrimaryProps): ReactElement {

    const [selected, setSelected] = useState(false);

    return (
        <MetalBorder
            className={joinClassNames([
                "checkbox",
                "checkbox-primary",
                props.className
            ])}
            type={props.borderType || "gold"}
            round={props.round}
            onClick={handleClick}
        >
            <Depression className="checkbox-primary__inner" interactiveHover onClick={handleClick} >
                {selected && (
                    <GiCheckMark className="checkbox-primary__checkmark"/>
                )}
            </Depression>
        </MetalBorder>
    );

    function handleClick() {
        const nextValue = !selected
        setSelected(nextValue);
        props.onSelect && props.onSelect(nextValue)
    }

}