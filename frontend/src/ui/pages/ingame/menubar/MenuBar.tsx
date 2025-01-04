import React, {ReactElement} from "react";
import {Button} from "../../../components/button/Button";
import {HBox} from "../../../components/layout/hbox/HBox";
import {HSpacer} from "../../../components/spacer/Spacer";
import {CgDebug} from "react-icons/cg";
import {FiMap} from "react-icons/fi";
import "./menubar.less";
import {UseDevWindow} from "../windows/dev/useDevWindow";
import {UseMapWindow} from "../windows/map/useMapWindow";
import {PiListBold, PiScrollBold} from "react-icons/pi";
import {UseCommandLogWindow} from "../windows/commandlog/useCommandLogWindow";
import {useDI} from "../../../../appContext";
import {TurnEndService} from "../../../../logic/game/turnEndService";
import {SessionRepository} from "../../../../state/repository/sessionRepository";
import {useIsBlockingWindowOpen} from "../../../components/window/windowHooks";
import {UseOutlinerWindow} from "../windows/outliner/useOutlinerWindow";

export function MenuBar(): ReactElement {

    const openDevMenu = UseDevWindow.useOpen();
    const openMapMenu = UseMapWindow.useOpen();
    const openCommandLogMenu = UseCommandLogWindow.useOpen();
    const openOutlinerMenu = UseOutlinerWindow.useOpen();
    const currentTurn = SessionRepository.useTurn();
    const isBlocked = useIsBlockingWindowOpen();
    const [endTurnDisabled, endTurn] = useEndTurn(isBlocked);

    return (
        <div className="menubar">
            <div className="menubar__inner">
                <HBox fullSize padding_xs gap_xs className="menubar__content">

                    <Button circle onClick={openDevMenu} disabled={isBlocked}><CgDebug/></Button>
                    <Button circle onClick={openMapMenu} disabled={isBlocked}><FiMap/></Button>
                    <Button circle onClick={openCommandLogMenu} disabled={isBlocked}><PiScrollBold/></Button>
                    <Button circle onClick={openOutlinerMenu} disabled={isBlocked}><PiListBold  /></Button>


                    <HSpacer fullWidth/>

                    <Button success disabled={endTurnDisabled} onClick={endTurn}>{"End Turn " + currentTurn}</Button>

                </HBox>
            </div>
        </div>
    );

}

function useEndTurn(isBlocked: boolean): [boolean, () => void] {
    const isWaiting = SessionRepository.useGameTurnState() === "waiting";
    const isDisabled = isBlocked || isWaiting;

    const endTurnService = useDI<TurnEndService>(TurnEndService.name);

    function endTurn() {
        endTurnService.endTurn();
    }

    return [isDisabled, endTurn];
}