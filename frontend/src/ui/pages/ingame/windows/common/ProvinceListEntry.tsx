import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {LinkButton} from "../../../../components/button/link/LinkButton";
import React, {useState} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Spacer} from "../../../../components/spacer/Spacer";
import {ProvinceReduced} from "../../../../../models/province";
import {ExpandButton} from "../../../../components/button/expand/ExpandButton";
import {joinClassNames} from "../../../../components/utils";
import "./provinceListEntry.less"

export function ProvinceListEntry(props: {
    data: ProvinceReduced,
    onOpenProvince: () => void,
    children?: any
}) {
    const [isOpen, setOpen] = useState(false);
    return (
        <DecoratedPanel
            paddingSmall blue simpleBorder
            className={joinClassNames([
                "province-list-entry",
                props.data.isPlanned ? "province-list-entry--planned" : null,
            ])}
        >
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
