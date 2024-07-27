import React, {ReactElement} from "react";
import {ButtonPrimary} from "../../../components/button/primary/ButtonPrimary";
import {HBox} from "../../../components/layout/hbox/HBox";
import {Spacer} from "../../../components/spacer/Spacer";
import {CgDebug} from "react-icons/cg";
import {FiHexagon, FiMap} from "react-icons/fi";
import "./menubar.scoped.less";
import {AppCtx} from "../../../../appContext";
import {UseDevWindow} from "../windows/dev/useDevWindow";
import {UseMapWindow} from "../windows/map/useMapWindow";
import {UseTileWindow} from "../windows/tile/useTileWindow";
import {GameSessionDatabase} from "../../../../state/database/gameSessionDatabase";
import {PiScrollBold} from "react-icons/pi";
import {UseCommandLogWindow} from "../windows/commandlog/useCommandLogWindow";

export function MenuBar(): ReactElement {

    const openDevMenu = UseDevWindow.useOpen();
    const openMapMenu = UseMapWindow.useOpen();
    const openCommandLogMenu = UseCommandLogWindow.useOpen();
    const openTileMenu = UseTileWindow.useOpen();
    const currentTurn = GameSessionDatabase.useTurn()
    const [endTurnDisabled, endTurn] = useEndTurn();

    return (
        <div className="menubar">
            <div className="menubar__inner">
                <HBox padding_xs gap_xs fillParent className="menubar__content">

                    <ButtonPrimary blue round onClick={openDevMenu}>
                        <CgDebug/>
                    </ButtonPrimary>

                    <ButtonPrimary blue round onClick={openMapMenu}>
                        <FiMap/>
                    </ButtonPrimary>

                    <ButtonPrimary blue round onClick={openCommandLogMenu}>
                        <PiScrollBold/>
                    </ButtonPrimary>

                    <ButtonPrimary blue round onClick={() => openTileMenu(null)}>
                        <FiHexagon/>
                    </ButtonPrimary>

                    <Spacer size="fill"/>

                    <ButtonPrimary green disabled={endTurnDisabled} onClick={endTurn}>
                        {"End Turn " + currentTurn}
                    </ButtonPrimary>
                </HBox>
            </div>
        </div>
    );

}

function useEndTurn(): [boolean, () => void] {
    const endTurnService = AppCtx.TurnEndService();
    const disabled = GameSessionDatabase.useGameTurnState() === "waiting";
    const setTurnState = GameSessionDatabase.useSetGameTurnState();

    function endTurn() {
        endTurnService.endTurn();
        setTurnState("waiting");
    }

    return [disabled, endTurn];
}