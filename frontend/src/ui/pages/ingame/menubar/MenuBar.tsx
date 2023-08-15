import "./menuBar.css";
import React, {ReactElement} from "react";
import {MetalBorder} from "../../../components/objects/metalborder/MetalBorder";
import {ButtonPrimary} from "../../../components/button/primary/ButtonPrimary";
import {CgDebug} from "react-icons/cg";
import {FiFlag, FiMap} from "react-icons/fi";
import {useOpenDevWindow} from "../windows/dev/DevWindow";
import {useOpenMapWindow} from "../windows/map/MapWindow";
import {useOpenCountryWindow} from "../windows/country/CountryWindow";
import {Inset} from "../../../components/objects/inset/Inset";

export function MenuBar(): ReactElement {

    const openDevMenu = useOpenDevWindow();
    const openMapMenu = useOpenMapWindow();
    const openCountryMenu = useOpenCountryWindow();

    function onEndTurn() {
        console.log("menubar: end turn");
    }

    function onOpenDebugMenu() {
        openDevMenu();
    }

    function onMapMenu() {
        openMapMenu();
    }

    function onCountryMenu() {
        openCountryMenu("4370345", true);
    }


    return (
        <MetalBorder type="gold" className="menubar">
            <Inset>
                <div className="menubar__content">

                    <ButtonPrimary round className="btn-menu" onClick={onOpenDebugMenu}>
                        <CgDebug/>
                    </ButtonPrimary>

                    <ButtonPrimary round className="btn-menu" onClick={onMapMenu}>
                        <FiMap/>
                    </ButtonPrimary>

                    <ButtonPrimary round className="btn-menu" onClick={onCountryMenu}>
                        <FiFlag/>
                    </ButtonPrimary>

                    <div className="menubar__spacer"/>

                    <ButtonPrimary className="btn-end-turn" onClick={onEndTurn}>
                        End Turn
                    </ButtonPrimary>

                </div>
            </Inset>
        </MetalBorder>
    );

}