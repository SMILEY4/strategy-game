import React, {ReactElement} from "react";
import {CreateWorld} from "./createworld/CreateWorld";
import {JoinWorld} from "./joinworld/JoinWorld";
import "./pageHome.css";
import {UserHooks} from "../../../core/hooks/userHooks";

export function PageHome(): ReactElement {

	const logOut = UserHooks.useLogOut("/login")

	return (
		<div className="home">
			<div className="home-content">
				<CreateWorld/>
				<JoinWorld/>
				<div>
					<button onClick={logOut}>Log Out</button>
				</div>
			</div>
		</div>
	);
}