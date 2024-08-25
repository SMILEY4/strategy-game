import React, {ReactElement} from "react";
import {
	DefaultDecoratedWindow,
	DefaultDecoratedWindowWithBanner,
} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {WindowSection} from "../../../../components/section/ContentSection";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {UseSettlementWindow} from "./useSettlementWindow";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {FiPlus} from "react-icons/fi";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {CgClose} from "react-icons/cg";
import "./settlementWindow.less"

export interface WorldObjectWindowProps {
	windowId: string;
	identifier: string | null;
}

export function SettlementWindow(props: WorldObjectWindowProps): ReactElement {

	const data: UseSettlementWindow.Data | null = UseSettlementWindow.useData(props.identifier);

	if (data === null) {
		return (
			<DefaultDecoratedWindow windowId={props.windowId}>
				<VBox fillParent center>
					<Text>No settlement selected</Text>
				</VBox>
			</DefaultDecoratedWindow>
		);
	} else {
		return (
			<DefaultDecoratedWindowWithBanner
				windowId={props.windowId}
				title={data.settlement.identifier.name}
				subtitle={"Settlement"}
			>

				<WindowSection>
					<InsetKeyValueGrid>

						<EnrichedText>Id</EnrichedText>
						<EnrichedText>{data.settlement.identifier.id}</EnrichedText>

						<EnrichedText>Position</EnrichedText>
						<EnrichedText>{data.settlement.tile.q + ", " + data.settlement.tile.r}</EnrichedText>

						<EnrichedText>Country</EnrichedText>
						<EnrichedText>{data.settlement.country.name}</EnrichedText>

						<EnrichedText>Province</EnrichedText>
						<EnrichedText>{data.province.identifier.id}</EnrichedText>

					</InsetKeyValueGrid>
				</WindowSection>

				<Spacer size="m"/>

				<WindowSection title="Province Settlements">
					<InsetPanel>
						{data.province.settlements.map(settlement => (
							<EnrichedText>{settlement.name}</EnrichedText>
						))}
					</InsetPanel>
				</WindowSection>

				<WindowSection title={"Buildings"}>
					<ProductionQueueSection {...data}/>
				</WindowSection>

			</DefaultDecoratedWindowWithBanner>
		);
	}

}

function ProductionQueueSection(props: UseSettlementWindow.Data) {
	return (
		<HBox centerVertical left gap_s>
			<ProductionQueueAddButton {...props}/>
			<ProductionQueueProgressBar {...props}/>
			<ProductionQueueCancelButton {...props}/>
		</HBox>
	)
}

function ProductionQueueAddButton(props: UseSettlementWindow.Data): ReactElement {
	return (
		<ButtonPrimary square onClick={props.productionQueue.add}>
			<FiPlus/>
		</ButtonPrimary>
	);
}

function ProductionQueueProgressBar(props: UseSettlementWindow.Data): ReactElement {
	return (
		<ProgressBar
			progress={props.productionQueue.activeEntry=== null ? 0 : props.productionQueue.activeEntry.progress}
			onClick={props.productionQueue.open}
			className="production_queue__progress"
		>
			<Text relative>
				{props.productionQueue.activeEntry === null ? "" : props.productionQueue.activeEntry.optionType.name}
			</Text>
		</ProgressBar>
	);
}

function ProductionQueueCancelButton(props: UseSettlementWindow.Data): ReactElement {
	return (
		<ButtonPrimary square round small onClick={props.productionQueue.cancel}>
			<CgClose/>
		</ButtonPrimary>
	);
}

