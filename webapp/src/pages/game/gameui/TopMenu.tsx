import type {ReactElement} from "react";
import {Panel} from "@modules/uicomponents/panel/Panel.tsx";
import styles from "./topmenu.module.less";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {Spacer} from "@modules/uicomponents/layout/spacer/Spacer.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";


export function TopMenu(): ReactElement {

    return (
        <Panel.Decorated
            className={styles.topmenu}
            neutral
            metalBorder
            sharpCorner
            paperPattern
        >
            <HorizontalLayout verticalCenter horizontalStart spacingS padding2xs>

                <Spacer/>

                <Button>End Turn</Button>

            </HorizontalLayout>
        </Panel.Decorated>
    );
}