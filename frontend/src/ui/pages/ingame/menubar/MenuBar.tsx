import React, {ReactElement} from "react";
import {useOpenDevWindow} from "../windows/dev/DevWindow";
import {useOpenMapWindow} from "../windows/map/MapWindow";
import {useOpenCountryWindow} from "../windows/country/CountryWindow";
import "./menubar.scoped.less";
import {ButtonPrimary} from "../../../components/button/primary/ButtonPrimary";
import {HBox} from "../../../components/layout/hbox/HBox";
import {Spacer} from "../../../components/static/spacer/Spacer";

import {CgDebug} from "react-icons/cg";
import {FiFlag, FiMap} from "react-icons/fi";

export function MenuBar(): ReactElement | null {

    const openDevMenu = useOpenDevWindow();
    const openMapMenu = useOpenMapWindow();
    const openCountryMenu = useOpenCountryWindow();

    function onEndTurn() {
        console.log("menubar: end turn");
    }

    function onOpenDebugMenu() {
        openDevMenu();
    }

    function onOpenMapMenu() {
        openMapMenu();
    }

    function onOpenCountryMenu() {
        openCountryMenu("4370345", true);
    }


    return (
        <div className="menubar">
            <div className="menubar__inner">
                <HBox padding_xs gap_xs fillParent className="menubar__content">

                    <ButtonPrimary blue round onClick={onOpenDebugMenu}>
                        <CgDebug/>
                    </ButtonPrimary>

                    <ButtonPrimary blue round onClick={onOpenMapMenu}>
                        <FiMap/>
                    </ButtonPrimary>

                    <ButtonPrimary blue round onClick={onOpenCountryMenu}>
                        <FiFlag/>
                    </ButtonPrimary>

                    <Spacer size="fill"/>

                    <ButtonPrimary green>End Turn</ButtonPrimary>
                </HBox>
            </div>
        </div>
    );

}