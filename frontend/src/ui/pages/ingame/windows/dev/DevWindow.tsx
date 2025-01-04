import React, {ReactElement} from "react";
import {Button} from "../../../../components/button/Button";
import {UseDevWindow} from "./useDevWindow";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETNumber} from "../../../../components/textenriched/elements/ETNumber";
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

				<Button onClick={data.open.devStats}>More Statistics</Button>

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

			<EnrichedText>Camera.Pos</EnrichedText>
			<EnrichedText>
				<ETNumber unstyled decPlaces={2}>{props.camera.x}</ETNumber>, <ETNumber unstyled
																						decPlaces={2}>{props.camera.y}</ETNumber>
			</EnrichedText>

			<EnrichedText>Camera.Zoom</EnrichedText>
			<EnrichedText>
				<ETNumber unstyled decPlaces={4}>{props.camera.zoom}</ETNumber>
			</EnrichedText>

		</InsetKeyValueGrid>
	);
}
