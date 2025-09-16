import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Banner} from "../../../../components/banner/Banner";
import {Txt} from "../../../../components/text/Txt";
import {RealmId} from "../../../../../models/country/realmId";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {Divider} from "../../../../components/divider/Divider";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {VSpacer} from "../../../../components/spacer/Spacer";
import {UseRealmWindow} from "./useRealmWindow";

export interface RealmWindowProps {
	windowId: string;
	identifier: RealmId | null;
}

export function RealmWindow(props: RealmWindowProps): ReactElement {

	const data: UseRealmWindow.Data | null = UseRealmWindow.useData(props.identifier);

	if (data === null) {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
				<Txt.Body secondary center fullSize>
					<Txt.String>No realm selected.</Txt.String>
				</Txt.Body>
			</DecoratedWindow>
		);

	} else {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton noPadding>
				<VBox fullSize>

					<Banner
						title={data.realm.name}
						subtitle={"Realm"}
						color={data.realm.color}
						spaceAbove
					/>

					<VBox padding_l gap_m scrollable grow shrink>

						<Txt.Header2 center>
							<Txt.String>Overview</Txt.String>
						</Txt.Header2>
						<Divider line/>

						<SectionBaseInformation {...data}/>
						<VSpacer size_s/>

						<Txt.Header2 center>
							<Txt.String>Units</Txt.String>
						</Txt.Header2>
						<Divider line/>

						<SectionUnits {...data}/>

					</VBox>

				</VBox>
			</DecoratedWindow>
		);
	}

}


function SectionBaseInformation(props: UseRealmWindow.Data): ReactElement {
	return (
		<InsetKeyValueGrid dontGrow dontShrink>

			<Txt.Body><Txt.String>Name:</Txt.String></Txt.Body>
			<Txt.Body><Txt.String>{props.realm.name}</Txt.String></Txt.Body>

			<Txt.Body><Txt.String>Player:</Txt.String></Txt.Body>
			<Txt.Body><Txt.String>{props.realm.player.name}</Txt.String></Txt.Body>

		</InsetKeyValueGrid>
	);
}

function SectionUnits(props: UseRealmWindow.Data): ReactElement {
	return (
		<InsetPanel dontShrink dontGrow>
			<VBox padding_s gap_s fullSize>

				{props.realm.worldObjects.length === 0 && (
					<Txt.Body center secondary>
						<Txt.String>No units.</Txt.String>
					</Txt.Body>
				)}

				{props.realm.worldObjects.map(worldObject => (
					<DecoratedPanel
						key={worldObject.id}
						pattern
						blue
					>
						<HBox fullSize padding_s gap_s>
							<Txt.Body>
								<Txt.Link onClick={() => props.open.worldObject(worldObject)}>
									<Txt.String>{worldObject.type.group + "/" + worldObject.type.name}</Txt.String>
								</Txt.Link>
							</Txt.Body>
						</HBox>
					</DecoratedPanel>
				))}

			</VBox>
		</InsetPanel>
	);
}