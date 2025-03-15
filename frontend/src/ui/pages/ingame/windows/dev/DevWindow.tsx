import React, {ReactElement} from "react";
import {Button} from "../../../../components/button/Button";
import {UseDevWindow} from "./useDevWindow";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Divider} from "../../../../components/divider/Divider";
import {Txt} from "../../../../components/text/Txt";

export interface DevWindowProps {
	windowId: string;
}

export function DevWindow(props: DevWindowProps): ReactElement {

	const data: UseDevWindow.Data = UseDevWindow.useData();

	return (
		<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
			<VBox padding_l gap_m fullSize scrollable>

				<Txt.Header1 center>
					<Txt.String>Dev & Debug</Txt.String>
				</Txt.Header1>

				<Divider line/>

				<BaseInformation {...data}/>

				<VBox gap_s>
					<Button onClick={data.fullscreen.enter}>Enter Fullscreen</Button>
					<Button onClick={data.fullscreen.exit}>Exit Fullscreen</Button>
				</VBox>

				<VBox gap_s>
					<Button onClick={data.webgl.loose}>Loose WebGL-Context</Button>
					<Button onClick={data.webgl.restore}>Restore WebGL-Context</Button>
				</VBox>

			</VBox>
		</DecoratedWindow>
	);
}


function BaseInformation(props: UseDevWindow.Data): ReactElement {
	return (
		<InsetKeyValueGrid dontShrink dontGrow>

			<Txt.Body><Txt.String>Camera Pos:</Txt.String></Txt.Body>
			<Txt.Body>
				<Txt.Number behaviour="neutral" decimalPlaces={2}>{props.camera.x}</Txt.Number>
				<Txt.String>, </Txt.String>
				<Txt.Number behaviour="neutral" decimalPlaces={2}>{props.camera.y}</Txt.Number>
			</Txt.Body>

			<Txt.Body><Txt.String>Camera Zoom:</Txt.String></Txt.Body>
			<Txt.Body><Txt.Number behaviour="neutral" decimalPlaces={4}>{props.camera.zoom}</Txt.Number></Txt.Body>

		</InsetKeyValueGrid>
	);
}
