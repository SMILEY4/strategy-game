import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {UseMoveWindow} from "./useMoveWindow";
import {Button} from "../../../../components/button/Button";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Divider} from "../../../../components/divider/Divider";
import {Txt} from "../../../../components/text/Txt";
import {WorldObject} from "../../../../../models/worldobject/worldObject";

export interface MoveWindowProps {
	windowId: string;
	identifier: WorldObject.Id;
}

export function MoveWindow(props: MoveWindowProps): ReactElement {

	const data: UseMoveWindow.Data | null = UseMoveWindow.useData(props.windowId, props.identifier);

	if (data === null) {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton>
				<Txt.Header1 center fullSize>
					<Txt.String>No object selected</Txt.String>
				</Txt.Header1>
			</DecoratedWindow>
		);
	} else {
		return (
			<DecoratedWindow
				windowId={props.windowId}
				withCloseButton={false}
				noPadding={false}
				style={{
					minWidth: "280px",
					minHeight: "180px",
					maxHeight: "180px",
				}}
			>
				<VBox padding_l gap_m fullSize>
					<Txt.Header2>
						<Txt.String>Move Unit</Txt.String>
					</Txt.Header2>
					<Divider line/>
					<Txt.Body>
						<Txt.String>{data.remainingPoints + "/" + data.totalPoints + " Movement Points left"}</Txt.String>
					</Txt.Body>
					<HBox right gap_s>
						<Button warn onClick={data.cancel}>Cancel</Button>
						<Button success onClick={data.accept}>Accept</Button>
					</HBox>
				</VBox>
			</DecoratedWindow>
		);
	}

}
