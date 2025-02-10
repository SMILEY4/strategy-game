import React, {ReactElement} from "react";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {VBox} from "../../components/layout/vbox/VBox";
import {HBox} from "../../components/layout/hbox/HBox";
import {Button} from "../../components/button/Button";
import {VSpacer} from "../../components/spacer/Spacer";
import {GotoHooks} from "../../hooks/goto";
import {BackgroundPanel} from "../../components/panels/background/BackgroundPanel";
import {Divider} from "../../components/divider/Divider";
import {Txt} from "../../components/text/Txt";


export function PageSignupConfirm(): ReactElement {

	const gotoLogin = GotoHooks.useLogin();

	return (
		<BackgroundPanel image="/images/image_2.bmp">

			<DecoratedPanel ornament>
				<VBox padding_l centerVertical gap_s>

					<Txt.Header1>
						<Txt.String>Confirm E-Mail</Txt.String>
					</Txt.Header1>

					<Divider line/>

					<Txt.Body>
						<Txt.String>A confirmation email has been sent to the specified address.</Txt.String>
						<br/>
                        <Txt.String>Complete the signup by clicking the link in the email.</Txt.String>
					</Txt.Body>

					<VSpacer size_s/>

					<HBox right>
						<Button info onClick={gotoLogin}>Return to Login</Button>
					</HBox>

				</VBox>
			</DecoratedPanel>

		</BackgroundPanel>
	);

}