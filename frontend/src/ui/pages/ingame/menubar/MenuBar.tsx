import "./menuBar.css";
import React, {ReactElement} from "react";
import {MetalBorder} from "../../../components/objects/metalborder/MetalBorder";
import {Depression} from "../../../components/objects/depression/Depression";
import {ButtonPrimary} from "../../../components/button/primary/ButtonPrimary";
import {CgDebug} from "react-icons/cg";
import {FiFlag, FiMap} from "react-icons/fi";

export function MenuBar(): ReactElement {

    function onEndTurn() {
        console.log("menubar: end turn");
    }

    function onOpenDebugMenu() {
        console.log("menubar: open debug menu");
    }

    function onCountryMenu() {
        console.log("menubar: open country menu");
    }

    function onMapMenu() {
        console.log("menubar: open map menu");
    }

    return (
        <MetalBorder type="gold" className="menubar">
            <Depression>
                <div className="menubar__content">

                    <ButtonPrimary round className="btn-menu" onClick={onOpenDebugMenu}>
                        <CgDebug/>
                    </ButtonPrimary>

                    <ButtonPrimary round className="btn-menu" onClick={onCountryMenu}>
                        <FiFlag/>
                    </ButtonPrimary>

                    <ButtonPrimary round className="btn-menu" onClick={onMapMenu}>
                        <FiMap/>
                    </ButtonPrimary>

                    <div className="menubar__spacer"/>

                    <ButtonPrimary className="btn-end-turn" onClick={onEndTurn}>
                        End Turn
                    </ButtonPrimary>

                </div>
            </Depression>
        </MetalBorder>
    );

}