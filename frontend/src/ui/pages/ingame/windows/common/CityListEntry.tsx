import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {LinkButton} from "../../../../components/button/link/LinkButton";
import {RiVipCrown2Fill, RiVipCrown2Line} from "react-icons/ri";
import React from "react";
import {CityReduced} from "../../../../../models/city";
import {joinClassNames} from "../../../../components/utils";
import "./cityListEntry.less";

export function CityListEntry(props: { data: CityReduced, onOpen: () => void }) {
    return (
        <DecoratedPanel
            paddingSmall blue simpleBorder pattern
            className={joinClassNames([
                "city-list-entry",
                props.data.isPlanned ? "city-list-entry--planned" : null,
            ])}
        >
            <HBox centerVertical gap_s>
                <LinkButton onClick={props.onOpen}>{props.data.identifier.name}</LinkButton>
                {props.data.isCountryCapitol && <RiVipCrown2Fill/>}
                {props.data.isProvinceCapitol && <RiVipCrown2Line/>}
            </HBox>
        </DecoratedPanel>
    );
}
