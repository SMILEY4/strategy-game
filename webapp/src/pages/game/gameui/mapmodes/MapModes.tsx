import {Icon} from "@/modules/uicomponents/icon/Icon";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import styles from "./mapmodes.module.less";
import {useMapModesViewModel} from "@pages/game/gameui/mapmodes/useMapModes.ts";
import {MapMode} from "@app/features/game/models/map-mode.ts";

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
                    <MapModeIcon mode={mode}/>
                </Button>
            ))}
        </HorizontalLayout>
    );
}

function MapModeIcon(props: { mode: MapMode }) {
    switch (props.mode) {
        case MapMode.TERRAIN:
            return <Icon.Mountain/>;
        case MapMode.POLITICAL:
            return <Icon.Flag/>;
        case MapMode.SETTLEMENT_LOCATIONS:
            return <Icon.HouseFlag/>;
        default: {
            return <Icon.Question/>;
        }
    }
}