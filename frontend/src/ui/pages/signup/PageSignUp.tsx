import React, {ReactElement} from "react";
import {BackgroundImagePanel} from "../../components/panels/backgroundimage/BackgroundImagePanel";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {VBox} from "../../components/layout/vbox/VBox";
import {Header1} from "../../components/header/Header";
import {TextField} from "../../components/textfield/TextField";
import {HBox} from "../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../components/spacer/Spacer";
import {SignupHooks} from "./signup";
import {GotoHooks} from "../../hooks/goto";


export function PageSignUp(): ReactElement {

	const {
		username,
		setUsername,
		email,
		setEmail,
		password,
		setPassword,
		signUp,
		error,
	} = SignupHooks.useSignup();

	const gotoLogin = GotoHooks.useLogin();

	return (
		<BackgroundImagePanel fillParent centerContent image="/images/image_3.bmp">
			<DecoratedPanel floating>
				<VBox gap_s centerVertical stretch>

					<Header1>Sign-Up</Header1>

					<Spacer size="s"/>

					<TextField
						value={username}
						placeholder={"Username"}
						type="text"
						onChange={setUsername}
					/>

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
						<ButtonPrimary info onClick={gotoLogin}>
							Login
						</ButtonPrimary>
						<ButtonPrimary success onClick={signUp}>
							Sign-Up
						</ButtonPrimary>
					</HBox>

				</VBox>
			</DecoratedPanel>
		</BackgroundImagePanel>
	);
}
