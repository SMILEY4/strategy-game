import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Text} from "../../../../components/text/Text";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {joinClassNames} from "../../../../components/utils";
import {BuildingInfoTooltip} from "../common/BuildingInfoTooltip";
import "./cityProductionWindow.less";
import {useAddProductionEntry, useAvailableProductionEntries} from "../../../../hooks/game/city";
import {ProductionEntry} from "../../../../../models/city";

export function useOpenCityProductionWindow() {
    const WINDOW_ID = "city-production";
    const addWindow = useOpenWindow();
    return (cityId: string) => {
        addWindow({
            id: WINDOW_ID,
            className: "city-production",
            left: 350,
            top: 350,
            width: 350,
            height: 400,
            content: <CityProductionWindow windowId={WINDOW_ID} cityId={cityId}/>,
        });
    };
}


export interface CityProductionWindowProps {
    windowId: string;
    cityId: string;
}

export function CityProductionWindow(props: CityProductionWindowProps): ReactElement {

    const entries = useAvailableProductionEntries(props.cityId);
    const addEntry = useAddProductionEntry(props.cityId);


    return (
        <DecoratedWindow
            windowId={props.windowId}
            withCloseButton
            className={"window-city-production"}
            style={{
                minWidth: "fit-content",
                minHeight: "250px",
            }}
        >
            <VBox fillParent gap_s top stretch>
                <Header1>Production</Header1>
                <Spacer size="s"/>
                <InsetPanel fillParent hideOverflow noPadding>
                    <VBox top stretch gap_xs padding_s scrollable fillParent>
                        {entries.map(entry => (
                            <ConstructionEntry entry={entry} onAdd={() => addEntry(entry)}/>
                        ))}
                    </VBox>
                </InsetPanel>
            </VBox>
        </DecoratedWindow>
    );
}


function ConstructionEntry(props: { entry: ProductionEntry, onAdd: () => void }) {
    return (
        <DecoratedPanel
            className={joinClassNames([
                "production-entry",
                props.entry.disabled ? "production-entry--disabled" : null,
            ])}
            background={
                <div
                    className={"construction-entry-background"}
                    style={{backgroundImage: "url('/icons/buildings/" + props.entry.icon + "')"}}
                />
            }
            simpleBorder paddingSmall blue
        >
            <HBox centerVertical spaceBetween>
                <BuildingInfoTooltip>
                    <Text>{props.entry.name}</Text>
                </BuildingInfoTooltip>
                <BuildingInfoTooltip>
                    <ButtonPrimary blue small disabled={props.entry.disabled} onClick={props.onAdd}>Add</ButtonPrimary>
                </BuildingInfoTooltip>
            </HBox>
        </DecoratedPanel>
    );
}

