import { Panel } from "@/modules/uicomponents/panel/Panel";
import { Txt } from "@/modules/uicomponents/text/Txt";
import {type ReactElement, useState} from "react";
import styles from "./infopanel.module.less"
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {Tabbar} from "@modules/uicomponents/tabbar/Tabbar.tsx";

export function InfoPanel(): ReactElement {

    return (
        <Panel.Decorated
            className={styles.infopanel}
            neutral
            metalBorder
            roundedCorner
            paperPattern
        >
            <InfoSelected/>
        </Panel.Decorated>
    );
}


function InfoSelected() {

    const tabs = [
        "Tile",
        "Resources",
        "Settlement",
        "Units",
        "Roads"
    ]
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
            <VerticalLayout verticalStart horizontalStretch fillFlex fillWidth paddingM>
                <Txt.Body><Txt.String>{`todo: show information about ${selectedTab} here`}</Txt.String></Txt.Body>
            </VerticalLayout>
        </VerticalLayout>
    )
}