import React, {ReactElement} from "react";
import {ButtonPrimary} from "../../../components/button/primary/ButtonPrimary";
import {HBox} from "../../../components/layout/hbox/HBox";
import {Spacer} from "../../../components/spacer/Spacer";
import {CgDebug} from "react-icons/cg";
import {FiFlag, FiHexagon, FiMap} from "react-icons/fi";
import {PiScrollBold} from "react-icons/pi";
import "./menubar.scoped.less";
import {Country} from "../../../../models/country";
import {AppCtx} from "../../../../appContext";
import {UseCommandLogWindow} from "../windows/commandLog/useCommandLogWindow";
import {UseCountryWindow} from "../windows/country/useCountryWindow";
import {UseDevWindow} from "../windows/dev/useDevWindow";
import {UseMapWindow} from "../windows/map/useMapWindow";
import {UseTileWindow} from "../windows/tile/useTileWindow";
import {GameSessionDatabase} from "../../../../state_new/gameSessionDatabase";
import {CountryDatabase} from "../../../../state_new/countryDatabase";

export function MenuBar(): ReactElement {

    const playerCountry = usePlayerCountry();
    const openDevMenu = UseDevWindow.useOpen();
    const openMapMenu = UseMapWindow.useOpen();
    const openCountryMenu = UseCountryWindow.useOpen();
    const openCommandLogMenu = UseCommandLogWindow.useOpen();
    const openTileMenu = UseTileWindow.useOpen();
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
    return CountryDatabase.useCountryByUserId(userId);
}

function useEndTurn(): [boolean, () => void] {
    const endTurnService = AppCtx.EndTurnService();
    const disabled = GameSessionDatabase.useGameTurnState() === "waiting";
    const setTurnState = GameSessionDatabase.useSetGameTurnState();

    function endTurn() {
        endTurnService.endTurn();
        setTurnState("waiting");
    }

    return [disabled, endTurn];
}