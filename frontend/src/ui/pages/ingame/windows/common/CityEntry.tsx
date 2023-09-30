import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {LinkButton} from "../../../../components/button/link/LinkButton";
import {RiVipCrown2Fill, RiVipCrown2Line} from "react-icons/ri";
import React from "react";
import {CityReduced} from "../../../../../models/city";

export function CityEntry(props: { data: CityReduced, onOpen: () => void }) {
    return (
        <DecoratedPanel paddingSmall blue simpleBorder>
            <HBox centerVertical gap_s>
                <LinkButton onClick={props.onOpen}>{props.data.identifier.name}</LinkButton>
                {props.data.isCountryCapitol && <RiVipCrown2Fill/>}
                {props.data.isProvinceCapitol && <RiVipCrown2Line/>}
            </HBox>
        </DecoratedPanel>
    );
}