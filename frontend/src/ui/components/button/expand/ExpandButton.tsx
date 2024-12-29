import React, {ReactElement} from "react";
import {Button} from "../primary/Button";
import {BiChevronDown, BiChevronRight} from "react-icons/bi";
import {joinClassNames} from "../../window/utils";

export interface ExpandButtonProps {
    isOpen: boolean,
    setOpen: (open: boolean) => void
    className?: string
}

export function ExpandButton(props: ExpandButtonProps): ReactElement {
    return (
        <Button
            small circle info
            className={joinClassNames(["button-expand", props.className])}
            onClick={() => props.setOpen(!props.isOpen)}
        >
            {!props.isOpen && <BiChevronRight/>}
            {props.isOpen && <BiChevronDown/>}
        </Button>
    );
}
