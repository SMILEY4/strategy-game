import {Panel} from "@/modules/uicomponents/panel/Panel";
import {Txt} from "@/modules/uicomponents/text/Txt";
import {type ReactElement, useState} from "react";
import styles from "./quickinfo.module.less";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {Tabbar} from "@modules/uicomponents/tabbar/Tabbar.tsx";
import {type QuickinfoViewModel, useQuickInfoViewModel} from "@pages/game/gameui/quickinfo/quickinfo.view.model.ts";
import {QuickInfo_Tile} from "@pages/game/gameui/quickinfo/QuickInfo.Tile.tsx";
import {QuickInfo_Settlement} from "@pages/game/gameui/quickinfo/QuickInfo.Settlement.tsx";

export function QuickInfo(): ReactElement {
    const viewModel = useQuickInfoViewModel();
    return (
        <Panel.Decorated
            className={styles.quickinfo}
            neutral
            metalBorder
            roundedCorner
            paperPattern
        >
            <InfoSelected {...viewModel}/>
        </Panel.Decorated>
    );
}

function InfoSelected(props: QuickinfoViewModel) {

    const [selectedTab, setSelectedTab] = useState(props.availableInfo.length > 0 ? props.availableInfo[0] : "");

    if (props.availableInfo.length == 0) {
        return (
            <VerticalLayout verticalStart horizontalStretch fillFlex fillWidth paddingM>
                <Txt.Body><Txt.String>{`nothing selected`}</Txt.String></Txt.Body>
            </VerticalLayout>
        );
    } else {
        return (
            <VerticalLayout verticalStart horizontalStretch fillFlex fillWidth>
                <Tabbar.Root selectedTab={selectedTab} onSelectTab={it => setSelectedTab(it as any)}>
                    {props.availableInfo.map(tab => (
                        <Tabbar.Tab value={tab}>
                            <Txt.Heading h6><Txt.String>{tab}</Txt.String></Txt.Heading>
                        </Tabbar.Tab>
                    ))}
                </Tabbar.Root>
                {selectedTab === "tile" && (<QuickInfo_Tile {...props.tile!}/>)}
                {selectedTab === "settlement" && (<QuickInfo_Settlement {...props.settlement!}/>)}
            </VerticalLayout>
        );
    }
}
