import React, {ReactElement} from "react";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {VBox} from "../../components/layout/vbox/VBox";
import {Header1} from "../../components/header/Header";
import {BackgroundImagePanel} from "../../components/panels/backgroundimage/BackgroundImagePanel";
import {TextField} from "../../components/textfield/TextField";
import {ButtonPrimary} from "../../components/button/primary/ButtonPrimary";
import {HBox} from "../../components/layout/hbox/HBox";
import {Spacer} from "../../components/spacer/Spacer";
import {GotoHooks} from "../../hooks/goto";
import {LoginHooks} from "./login";


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
		<BackgroundImagePanel fillParent centerContent image="/images/image_1.png">
			<DecoratedPanel red floating>
				<VBox gap_s centerVertical stretch>

					<Header1>Login</Header1>

					<Spacer size="s"/>

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

					<Spacer size="s"/>

					<HBox gap_s centerVertical right>
						<ButtonPrimary blue onClick={gotoSignup}>
							Sign-Up
						</ButtonPrimary>
						<ButtonPrimary green onClick={login}>
							Login
						</ButtonPrimary>
					</HBox>


				</VBox>
			</DecoratedPanel>
		</BackgroundImagePanel>
	);
}
