import React, {ReactElement} from "react";
import {CreateWorld} from "./createworld/CreateWorld";
import {JoinWorld} from "./joinworld/JoinWorld";
import "./pageHome.css";

export function PageHome(): ReactElement {
	return (
		<div className="home">
			<div className="home-content">
				<CreateWorld/>
				<JoinWorld/>
			</div>
		</div>
	);
}