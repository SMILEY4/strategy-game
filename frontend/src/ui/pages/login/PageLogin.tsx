import React, {ReactElement} from "react";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {VBox} from "../../components/layout/vbox/VBox";
import {TextField} from "../../components/textfield/TextField";
import {Button} from "../../components/button/Button";
import {HBox} from "../../components/layout/hbox/HBox";
import {VSpacer} from "../../components/spacer/Spacer";
import {GotoHooks} from "../../hooks/goto";
import {LoginHooks} from "./login";
import {BackgroundPanel} from "../../components/panels/background/BackgroundPanel";
import {Txt} from "../../components/text/Txt";


export function PageLogin(): ReactElement {

	const {
		email,
		setEmail,
		password,
		setPassword,
		login,
		error,
	} = LoginHooks.useLogin();

	const gotoSignup = GotoHooks.useSignup();

	return (
		<BackgroundPanel image="/images/image_1.png">

			<DecoratedPanel ornament>
				<VBox padding_l centerVertical gap_s>

					<Txt.Header1>
						<Txt.String>Login</Txt.String>
					</Txt.Header1>

					<VSpacer size_s/>

					<TextField
						value={email}
						placeholder={"Email"}
						type="email"
						onChange={setEmail}
					/>

					<TextField
						value={password}
						placeholder={"Password"}
						type="password"
						onChange={setPassword}
					/>

					<VSpacer size_s/>

					<HBox right gap_s>
						<Button info onClick={gotoSignup}>Sign-Up</Button>
						<Button success onClick={login}>Login</Button>
					</HBox>

				</VBox>
			</DecoratedPanel>

		</BackgroundPanel>
	);
}
