import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {UseMoveWindow} from "./useMoveWindow";
import {Header2} from "../../../../components/header/Header";
import {Button} from "../../../../components/button/primary/Button";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Divider} from "../../../../components/divider/Divider";

export interface MoveWindowProps {
	windowId: string;
	identifier: string | null;
}

export function MoveWindow(props: MoveWindowProps): ReactElement {

	const data: UseMoveWindow.Data | null = UseMoveWindow.useData(props.identifier);

	if (data === null) {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton>
				<VBox fullSize center>
					<Text center secondary>No object selected</Text>
				</VBox>
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
					<Header2>Move Unit</Header2>
					<Divider line/>
					<Text>{data.remainingPoints + "/" + data.totalPoints + " Movement Points left"}</Text>
					<HBox right gap_s>
						<Button warn onClick={data.cancel}>Cancel</Button>
						<Button success onClick={data.accept}>Accept</Button>
					</HBox>
				</VBox>
			</DecoratedWindow>
		);
	}

}
