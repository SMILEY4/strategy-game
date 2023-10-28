import React, {ReactElement} from "react";
import {useOpenDevWindow} from "../windows/dev/DevWindow";
import {useOpenMapWindow} from "../windows/map/MapWindow";
import {useOpenCountryWindow} from "../windows/country/CountryWindow";
import {ButtonPrimary} from "../../../components/button/primary/ButtonPrimary";
import {HBox} from "../../../components/layout/hbox/HBox";
import {Spacer} from "../../../components/spacer/Spacer";
import {CgDebug} from "react-icons/cg";
import {FiFlag, FiHexagon, FiMap} from "react-icons/fi";
import {useOpenCommandLogWindow} from "../windows/commandLog/CommandLogWindow";
import {PiScrollBold} from "react-icons/pi";
import {useOpenTileWindow} from "../windows/tile/TileWindow";
import "./menubar.scoped.less";
import {Country} from "../../../../models/country";
import {GameStateAccess} from "../../../../state/access/GameStateAccess";
import {GameSessionStateAccess} from "../../../../state/access/GameSessionStateAccess";
import {AppCtx} from "../../../../appContext";

export function MenuBar(): ReactElement {

    const playerCountry = usePlayerCountry()
    const openDevMenu = useOpenDevWindow();
    const openMapMenu = useOpenMapWindow();
    const openCountryMenu = useOpenCountryWindow();
    const openCommandLogMenu = useOpenCommandLogWindow();
    const openTileMenu = useOpenTileWindow();
    const [endTurnDisabled, endTurn] = useEndTurn()

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

                    <ButtonPrimary blue round onClick={() => openCountryMenu(playerCountry.identifier.id, true)}>
                        <FiFlag/>
                    </ButtonPrimary>

                    <ButtonPrimary blue round onClick={openCommandLogMenu}>
                        <PiScrollBold/>
                    </ButtonPrimary>

                    <ButtonPrimary blue round onClick={() => openTileMenu(null)}>
                        <FiHexagon/>
                    </ButtonPrimary>

                    <Spacer size="fill"/>

                    <ButtonPrimary green disabled={endTurnDisabled} onClick={endTurn}>End Turn</ButtonPrimary>
                </HBox>
            </div>
        </div>
    );

}

function usePlayerCountry(): Country {
    const userId = AppCtx.UserService().getUserId();
    return GameStateAccess.useCountryByUserId(userId);
}

function useEndTurn(): [boolean, () => void] {
    const endTurnService = AppCtx.EndTurnService();
    const disabled = GameSessionStateAccess.useTurnState() === "waiting";
    const setTurnState = GameSessionStateAccess.useSetTurnState();

    function endTurn() {
        endTurnService.endTurn();
        setTurnState("waiting");
    }

    return [disabled, endTurn];
}