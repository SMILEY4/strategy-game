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
import "./cityProductionWindow.less";
import {ProductionEntry} from "../../../../models/productionEntry";
import {joinClassNames} from "../../../../components/utils";

export interface CityProductionWindowProps {
    windowId: string;
}

export function CityProductionWindow(props: CityProductionWindowProps): ReactElement {

    const entries: ProductionEntry[] = [
        {
            name: "Farm",
            icon: "farm.png",
            disabled: false
        },
        {
            name: "Woodcutter",
            icon: "Woodcutter.png",
            disabled: false
        },
        {
            name: "Farm II",
            icon: "farm.png",
            disabled: true
        },
        {
            name: "Woodcutter II",
            icon: "Woodcutter.png",
            disabled: true
        },
    ];

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
                            <ConstructionEntry entry={entry}/>
                        ))}
                    </VBox>
                </InsetPanel>
            </VBox>
        </DecoratedWindow>
    );
}


function ConstructionEntry(props: { entry: ProductionEntry }) {
    return (
        <DecoratedPanel
            className={joinClassNames([
                "production-entry",
                props.entry.disabled ? "production-entry--disabled" : null,
            ])}
            simpleBorder
            paddingSmall
            blue
            background={
                <div
                    className={"construction-entry-background"}
                    style={{backgroundImage: "url('/icons/buildings/" + props.entry.icon + "')"}}
                />
            }
        >
            <HBox centerVertical spaceBetween>
                <Text>{props.entry.name}</Text>
                <ButtonPrimary blue small disabled={props.entry.disabled}>Add</ButtonPrimary>
            </HBox>
        </DecoratedPanel>
    );
}

export function useOpenCityProductionWindow() {
    const WINDOW_ID = "city-production";
    const addWindow = useOpenWindow();
    return () => {
        addWindow({
            id: WINDOW_ID,
            className: "city-production",
            left: 350,
            top: 350,
            width: 350,
            height: 400,
            content: <CityProductionWindow windowId={WINDOW_ID}/>,
        });
    };
}
