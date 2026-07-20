import { Panel } from "@/modules/uicomponents/panel/Panel";
import { Txt } from "@/modules/uicomponents/text/Txt";
import type {ReactElement} from "react";
import styles from "./infopanel.module.less"
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";

export function InfoPanel(): ReactElement {

    return (
        <Panel.Decorated
            className={styles.infopanel}
            neutral
            metalBorder
            roundedCorner
            paperPattern
        >
            <InfoNothing/>
            {/*<InfoTile/>*/}
        </Panel.Decorated>
    );
}

function InfoNothing() {
    return (
        <VerticalLayout center fillFlex fillWidth>
            <Txt.Body><Txt.String>Nothing Selected</Txt.String></Txt.Body>
        </VerticalLayout>
    )
}

// function InfoTile() {
//     return (
//         <VerticalLayout verticalStart horizontalStretch fillFlex fillWidth paddingM>
//             <Txt.Heading h5><Txt.String>Plains</Txt.String></Txt.Heading>
//             <Txt.Body><Txt.String>Kingdom of Gondor</Txt.String></Txt.Body>
//         </VerticalLayout>
//     )
// }