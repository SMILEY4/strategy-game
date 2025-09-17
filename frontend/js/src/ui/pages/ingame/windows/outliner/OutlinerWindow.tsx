import React, {ReactElement} from "react";
import {UseOutlinerWindow} from "./useOutlinerWindow";
import {Divider} from "../../../../components/divider/Divider";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {TabBar, TabOption} from "../../../../components/tab/TabBar";
import {HSpacer} from "../../../../components/spacer/Spacer";
import {Button} from "../../../../components/button/Button";
import {Txt} from "../../../../components/text/Txt";

export interface OutlinerWindowProps {
	windowId: string,
}

export function OutlinerWindow(props: OutlinerWindowProps): ReactElement {

	const data = UseOutlinerWindow.useData();

	return (
		<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
			<VBox padding_l gap_m fullSize>

				<Txt.Header1 center>
					<Txt.String>Outliner</Txt.String>
				</Txt.Header1>

				<Divider line/>

				<TabBar noPadding initial={"All"}>

					<TabOption name="All">
						<InsetPanel shrink>
							<VBox scrollable padding_s gap_s fullSize>
								<SectionRealms {...data}/>
								<SectionWorldObjects {...data}/>
							</VBox>
						</InsetPanel>
					</TabOption>

					<TabOption name="Realms">
						<InsetPanel shrink>
							<VBox scrollable padding_s gap_s fullSize>
								<SectionRealms {...data}/>
							</VBox>
						</InsetPanel>
					</TabOption>

					<TabOption name="Units">
						<InsetPanel shrink>
							<VBox scrollable padding_s gap_s fullSize>
								<SectionWorldObjects {...data}/>
							</VBox>
						</InsetPanel>
					</TabOption>

				</TabBar>


			</VBox>
		</DecoratedWindow>
	);
}

function SectionRealms(props: UseOutlinerWindow.Data): ReactElement {
	return (
		<>
			{props.realms.entries.length > 0 && (
				<Txt.Header5>
					<Txt.String>Realms</Txt.String>
				</Txt.Header5>
			)}
			{props.realms.entries.map(realm => (
				<DecoratedPanel
					key={realm.id}
					pattern
					blue
				>
					<HBox fullSize gap_s padding_s>
						<Txt.Body>
							<Txt.Link onClick={() => props.realms.open(realm)}>
								<Txt.String>{realm.name}</Txt.String>
							</Txt.Link>
						</Txt.Body>
						<HSpacer grow/>
					</HBox>
				</DecoratedPanel>
			))}
		</>
	);
}

function SectionWorldObjects(props: UseOutlinerWindow.Data): ReactElement {
	return (
		<>
			{props.unit.entries.length > 0 && (
				<Txt.Header5>
					<Txt.String>Units</Txt.String>
				</Txt.Header5>
			)}
			{props.unit.entries.map(worldObject => (
				<DecoratedPanel
					key={worldObject.id}
					pattern
					blue
				>
					<HBox fullSize gap_s padding_s>
						<Txt.Body>
							<Txt.Link onClick={() => props.unit.open(worldObject)}>
								<Txt.String>{worldObject.type.group + "/" + worldObject.type.name}</Txt.String>
							</Txt.Link>
						</Txt.Body>
						<HSpacer grow/>
						<Button circle small onClick={() => props.unit.focusCamera(worldObject)}>
							<Txt.Icon.Eye/>
						</Button>
					</HBox>
				</DecoratedPanel>
			))}
		</>
	);
}