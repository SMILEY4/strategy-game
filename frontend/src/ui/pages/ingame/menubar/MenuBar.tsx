import React, {ReactElement} from "react";
import {useOpenDevWindow} from "../windows/dev/DevWindow";
import {useOpenMapWindow} from "../windows/map/MapWindow";
import {useOpenCountryWindow} from "../windows/country/CountryWindow";
import {ButtonPrimary} from "../../../components/button/primary/ButtonPrimary";
import {HBox} from "../../../components/layout/hbox/HBox";
import {Spacer} from "../../../components/spacer/Spacer";
import {CgDebug} from "react-icons/cg";
import {FiFlag, FiHexagon, FiMap} from "react-icons/fi";
import {useEndTurn} from "../../../hooks/game/turn";
import {usePlayerCountry} from "../../../hooks/game/country";
import {useOpenCommandLogWindow} from "../windows/commandLog/CommandLogWindow";
import "./menubar.scoped.less";
import {PiScrollBold} from "react-icons/pi";
import {useOpenTileWindow} from "../windows/tile/TileWindow";

export function MenuBar(): ReactElement {

    const country = usePlayerCountry()
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

                    <ButtonPrimary blue round onClick={() => openCountryMenu(country.identifier.id, true)}>
                        <FiFlag/>
                    </ButtonPrimary>

                    <ButtonPrimary blue round onClick={openCommandLogMenu}>
                        <PiScrollBold/>
                    </ButtonPrimary>

                    {/*TODO: temporary, until tiles are clickable*/}
                    <ButtonPrimary blue round onClick={() => openTileMenu({id: "12345", q: -32, r: 16})}>
                        <FiHexagon/>
                    </ButtonPrimary>

                    <Spacer size="fill"/>

                    <ButtonPrimary green disabled={endTurnDisabled} onClick={endTurn}>End Turn</ButtonPrimary>
                </HBox>
            </div>
        </div>
    );

}