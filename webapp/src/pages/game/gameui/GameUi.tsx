import {TopBar} from "@pages/game/gameui/topbar/TopBar.tsx";
import {QuickInfo} from "@pages/game/gameui/quickinfo/QuickInfo.tsx";
import {useDevPanel} from "@pages/game/gameui/dev/DevPanel.tsx";
import {MapModes} from "@pages/game/gameui/mapmodes/MapModes.tsx";


export function GameUi() {
    useDevPanel();
    return (
        <>
            <TopBar/>
            <QuickInfo/>
            <MapModes/>
        </>
    );
}
