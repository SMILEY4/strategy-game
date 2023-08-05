import React, {ReactElement} from "react";
import {PanelDecorated} from "../../components/panels/decorated/PanelDecorated";
import {PanelCloth} from "../../components/panels/cloth/PanelCloth";
import {useNavigate} from "react-router-dom";
import {ButtonText} from "../../components/controls/button/text/ButtonText";
import "./pageSignupConfirm.css";


export function PageSignupConfirm(): ReactElement {

    const navigate = useNavigate();

    return (
        <PanelCloth className="page-signup-confirm" color="blue">
            <PanelDecorated classNameContent="page-signup-confirm__content">
                <h1>Confirm E-Mail</h1>
                <p>A confirmation email has been sent to the specified address.</p>
                <p>Complete the signup by clicking the link in the email.</p>
                <ButtonText onClick={login}>Return to Login</ButtonText>
            </PanelDecorated>
        </PanelCloth>
    );

    function login() {
        navigate("/login")
    }
}