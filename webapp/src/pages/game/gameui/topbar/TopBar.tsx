import type {ReactElement} from "react";
import {Panel} from "@modules/uicomponents/panel/Panel.tsx";
import styles from "./topbar.module.less";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {Spacer} from "@modules/uicomponents/layout/spacer/Spacer.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import {Icon} from "@modules/uicomponents/icon/Icon.tsx";
import {useTopBarViewModel} from "@pages/game/gameui/topbar/top-bar.view-model.ts";


export function TopBar(): ReactElement {

    const viewModel = useTopBarViewModel();

    return (
        <Panel.Decorated
            className={styles.topbar}
            neutral
            metalBorder
            sharpCorner
            paperPattern
        >
            <HorizontalLayout verticalCenter horizontalStart spacingS padding2xs>

                <Spacer/>

                <Button disabled={!viewModel.submitTurn.available} onClick={viewModel.submitTurn.execute}>
                    End Turn
                    <Icon.ChevronRight/>
                </Button>

            </HorizontalLayout>
        </Panel.Decorated>
    );
}