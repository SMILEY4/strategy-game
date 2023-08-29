import React, {ReactElement} from "react";
import {useOpenDevWindow} from "../windows/dev/DevWindow";
import {useOpenMapWindow} from "../windows/map/MapWindow";
import {useOpenCountryWindow} from "../windows/country/CountryWindow";
import {ButtonPrimary} from "../../../components/button/primary/ButtonPrimary";
import {HBox} from "../../../components/layout/hbox/HBox";
import {Spacer} from "../../../components/spacer/Spacer";
import "./menubar.scoped.less";

import {CgDebug} from "react-icons/cg";
import {FiFlag, FiMap} from "react-icons/fi";
import {useEndTurn} from "../../../hooks/turn";

export function MenuBar(): ReactElement | null {

    const openDevMenu = useOpenDevWindow();
    const openMapMenu = useOpenMapWindow();
    const openCountryMenu = useOpenCountryWindow();
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

                    <ButtonPrimary blue round onClick={() => openCountryMenu("4370345", true)}>
                        <FiFlag/>
                    </ButtonPrimary>

                    <Spacer size="fill"/>

                    <ButtonPrimary green disabled={endTurnDisabled} onClick={endTurn}>End Turn</ButtonPrimary>
                </HBox>
            </div>
        </div>
    );

}