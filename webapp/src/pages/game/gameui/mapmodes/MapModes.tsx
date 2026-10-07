import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import styles from "./mapmodes.module.less";
import {useMapModesViewModel} from "@pages/game/gameui/mapmodes/useMapModes.ts";

export function MapModes() {

    const viewModel = useMapModesViewModel();

    return (
        <HorizontalLayout className={styles["mapmode-panel"]} spacingXs>
            {viewModel.available.map(mode => (
                <Button
                    key={mode.id}
                    intent={mode === viewModel.selected ? "success" : "neutral"}
                    circle
                    onClick={() => viewModel.select(mode)}
                >
                    {mode.icon()}
                </Button>
            ))}
        </HorizontalLayout>
    );
}
