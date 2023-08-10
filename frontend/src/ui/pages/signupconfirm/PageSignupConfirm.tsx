import React, {ReactElement} from "react";
import {PanelDecorated} from "../../components/objects/panels/decorated/PanelDecorated";
import {PanelCloth} from "../../components/objects/panels/cloth/PanelCloth";
import {useNavigate} from "react-router-dom";
import "./pageSignupConfirm.css";
import {ButtonOutline} from "../../components/button/outline/ButtonOutline";


export function PageSignupConfirm(): ReactElement {

    const navigate = useNavigate();

    return (
        <PanelCloth className="page-signup-confirm" color="blue">
            <PanelDecorated classNameContent="page-signup-confirm__content">
                <h1>Confirm E-Mail</h1>
                <p>A confirmation email has been sent to the specified address.</p>
                <p>Complete the signup by clicking the link in the email.</p>
                <ButtonOutline onClick={login}>Return to Login</ButtonOutline>
            </PanelDecorated>
        </PanelCloth>
    );

    function login() {
        navigate("/login")
    }
}