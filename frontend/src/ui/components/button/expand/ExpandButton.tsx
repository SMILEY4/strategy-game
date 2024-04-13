import React, {ReactElement} from "react";
import {ButtonPrimary} from "../primary/ButtonPrimary";
import {BiChevronDown, BiChevronRight} from "react-icons/bi";
import {joinClassNames} from "../../utils";

export interface ExpandButtonProps {
    isOpen: boolean,
    setOpen: (open: boolean) => void
    className?: string
}

export function ExpandButton(props: ExpandButtonProps): ReactElement {
    return (
        <ButtonPrimary
            small round blue
            className={joinClassNames(["button-expand", props.className])}
            onClick={() => props.setOpen(!props.isOpen)}
        >
            {!props.isOpen && <BiChevronRight/>}
            {props.isOpen && <BiChevronDown/>}
        </ButtonPrimary>
    );
}
