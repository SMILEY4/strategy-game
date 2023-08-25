import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {LinkButton} from "../../../../components/button/link/LinkButton";
import {BiChevronDown, BiChevronRight} from "react-icons/all";
import React, {useState} from "react";
import {ReducedProvinceData} from "../../../../models/province/reducedProvinceData";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";

export function ProvinceEntry(props: {
    data: ReducedProvinceData,
    onOpenProvince: () => void,
    onOpenCity: (cityId: string) => void,
    children?: any
}) {
    const [isOpen, setOpen] = useState(false);
    return (
        <DecoratedPanel blue simpleBorder>
            <VBox gap_xs>
                <HBox centerVertical spaceBetween>
                    <LinkButton onClick={props.onOpenProvince}>{props.data.identifier.name}</LinkButton>
                    <ButtonPrimary small round blue onClick={() => setOpen(!isOpen)}>
                        {!isOpen && <BiChevronRight/>}
                        {isOpen && <BiChevronDown/>}
                    </ButtonPrimary>
                </HBox>
                {isOpen && <Spacer size={"xs"}/>}
                {isOpen && props.children}
            </VBox>
        </DecoratedPanel>
    );
}
