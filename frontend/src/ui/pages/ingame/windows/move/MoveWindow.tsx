import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {UseMoveWindow} from "./useMoveWindow";
import {Header1} from "../../../../components/header/Header";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Spacer} from "../../../../components/spacer/Spacer";

export interface MoveWindowProps {
	windowId: string;
	identifier: string | null;
}

export function MoveWindow(props: MoveWindowProps): ReactElement {

	const data: UseMoveWindow.Data | null = UseMoveWindow.useData(props.identifier);

	if (data === null) {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton>
				<VBox fillParent center>
					<Text>No object selected</Text>
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
					minHeight: "160px",
				}}
			>
				<VBox fillParent gap_s top stretch>
					<Header1>Move Unit</Header1>
					<Text>{data.remainingPoints + "/" + data.totalPoints + " Movement Points left"}</Text>
					<Spacer size="s"/>
					<HBox right gap_s>
						<ButtonPrimary warn onClick={data.cancel}>Cancel</ButtonPrimary>
						<ButtonPrimary success onClick={data.accept}>Accept</ButtonPrimary>
					</HBox>
				</VBox>
			</DecoratedWindow>
		);
	}

}
