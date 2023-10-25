import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {LinkButton} from "../../../../components/button/link/LinkButton";
import {BiChevronDown, BiChevronRight} from "react-icons/bi";
import React, {ReactElement, useState} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";
import {ProvinceReduced} from "../../../../../models/province";

export function ProvinceEntry(props: {
    data: ProvinceReduced,
    onOpenProvince: () => void,
    children?: any
}) {
    const [isOpen, setOpen] = useState(false);
    return (
        <DecoratedPanel blue simpleBorder>
            <VBox gap_xs>
                <HBox centerVertical spaceBetween>
                    <LinkButton onClick={props.onOpenProvince}>{props.data.identifier.name}</LinkButton>
                    <ExpandButton isOpen={isOpen} setOpen={setOpen}/>
                </HBox>
                {isOpen && <Spacer size={"xs"}/>}
                {isOpen && props.children}
            </VBox>
        </DecoratedPanel>
    );
}


function ExpandButton(props: {isOpen: boolean, setOpen: (open: boolean) => void}): ReactElement {
    return (
        <ButtonPrimary small round blue onClick={() => props.setOpen(!props.isOpen)}>
            {!props.isOpen && <BiChevronRight/>}
            {props.isOpen && <BiChevronDown/>}
        </ButtonPrimary>
    );
}
