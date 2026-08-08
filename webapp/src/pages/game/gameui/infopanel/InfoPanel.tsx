import {Panel} from "@/modules/uicomponents/panel/Panel";
import {Txt} from "@/modules/uicomponents/text/Txt";
import {type ReactElement, useState} from "react";
import styles from "./infopanel.module.less";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {Tabbar} from "@modules/uicomponents/tabbar/Tabbar.tsx";
import {type InfoPanelViewModel, useInfoPanelViewModel} from "@pages/game/gameui/infopanel/info-panel.view-model.ts";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";

export function InfoPanel(): ReactElement {

    const viewModel = useInfoPanelViewModel();

    return (
        <Panel.Decorated
            className={styles.infopanel}
            neutral
            metalBorder
            roundedCorner
            paperPattern
        >
            <InfoSelected {...viewModel}/>
        </Panel.Decorated>
    );
}


function InfoSelected(props: InfoPanelViewModel) {

    const tabs = [
        "Tile",
        "Resources",
        "Settlement",
        "Units",
        "Roads",
    ];
    const [selectedTab, setSelectedTab] = useState(tabs[0]);

    return (
        <VerticalLayout verticalStart horizontalStretch fillFlex fillWidth>
            <Tabbar.Root selectedTab={selectedTab} onSelectTab={setSelectedTab}>
                {tabs.map(tab => (
                    <Tabbar.Tab value={tab}>
                        <Txt.Heading h6><Txt.String>{tab}</Txt.String></Txt.Heading>
                    </Tabbar.Tab>
                ))}
            </Tabbar.Root>
            {selectedTab === "Tile" && (<InfoSelectedTile {...props}/>)}
            {selectedTab === "Resources" && (<InfoResources/>)}
            {selectedTab === "Settlement" && (<InfoSettlement/>)}
            {selectedTab === "Units" && (<InfoUnits/>)}
            {selectedTab === "Roads" && (<InfoRoads/>)}
        </VerticalLayout>
    );
}

function InfoSelectedTile(props: InfoPanelViewModel) {
    if (props.tile) {
        return (
            <VerticalLayout verticalStart horizontalStretch fillFlex fillWidth paddingM>
                <Txt.Line><Txt.String>Id: </Txt.String><Txt.String>{`${props.tile.id}`}</Txt.String></Txt.Line>
                <Txt.Line><Txt.String>Position: </Txt.String><Txt.String>{`${props.tile.position.q},${props.tile.position.r}`}</Txt.String></Txt.Line>
                <Button disabled={!props.foundCapital.available} onClick={props.foundCapital.execute}>Found Capital</Button>
            </VerticalLayout>
        );
    } else {
        return (
            <VerticalLayout verticalStart horizontalStretch fillFlex fillWidth paddingM>
                <Txt.Body><Txt.String>{`no tile selected`}</Txt.String></Txt.Body>
            </VerticalLayout>
        );
    }
}

function InfoResources() {
    return (
        <VerticalLayout verticalStart horizontalStretch fillFlex fillWidth paddingM>
            <Txt.Body><Txt.String>{`todo: show information about selected resources here`}</Txt.String></Txt.Body>
        </VerticalLayout>
    );
}

function InfoSettlement() {
    return (
        <VerticalLayout verticalStart horizontalStretch fillFlex fillWidth paddingM>
            <Txt.Body><Txt.String>{`todo: show information about selected settlement here`}</Txt.String></Txt.Body>
        </VerticalLayout>
    );
}

function InfoUnits() {
    return (
        <VerticalLayout verticalStart horizontalStretch fillFlex fillWidth paddingM>
            <Txt.Body><Txt.String>{`todo: show information about selected units here`}</Txt.String></Txt.Body>
        </VerticalLayout>
    );
}

function InfoRoads() {
    return (
        <VerticalLayout verticalStart horizontalStretch fillFlex fillWidth paddingM>
            <Txt.Body><Txt.String>{`todo: show information about selected roads here`}</Txt.String></Txt.Body>
        </VerticalLayout>
    );
}