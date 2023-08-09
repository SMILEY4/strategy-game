import "./menuBar.css";
import React, {ReactElement} from "react";
import {BorderMetallic} from "../../../components/objects/border/metallic/BorderMetallic";
import {ButtonGem} from "../../../components/controls/button/gem/ButtonGem";
import {BorderMetallicRound} from "../../../components/objects/border/metallicRound/BorderMetallicRound";
import {CgDebug, CgShapeHexagon} from "react-icons/cg";
import {FiMap} from "react-icons/fi";

export function MenuBar(): ReactElement {

    return (
        <div className="menubar">
            <BorderMetallic className="menubar__panel">
                <div className="menubar__panel__content"/>
            </BorderMetallic>
            <ButtonGem className="menubar__end-turn">End Turn</ButtonGem>
            <div className="menubar_tool_panel">

                <BorderMetallicRound className="menubar__tool">
                    <CgDebug/>
                </BorderMetallicRound>

                <BorderMetallicRound className="menubar__tool">
                    <FiMap/>
                </BorderMetallicRound>

                <BorderMetallicRound className="menubar__tool">
                    <CgShapeHexagon/>
                </BorderMetallicRound>

            </div>
        </div>
    );

}