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
import "./settlementWindow.less";
import {Building} from "../../../../../models/primitives/building";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/TooltipContext";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {Header4} from "../../../../components/header/Header";
import {SimpleDivider} from "../../../../components/divider/SimpleDivider";
import {joinClassNames} from "../../../../components/utils";

export interface SettlementWindowProps {
	windowId: string;
	identifier: string | null;
}

export function SettlementWindow(props: SettlementWindowProps): ReactElement {

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

				<Spacer size="m"/>

				<WindowSection title={"Production"}>
					<ProductionQueueSection {...data}/>
				</WindowSection>

				<Spacer size="m"/>

				<WindowSection title={"Buildings"}>
					<BuildingList {...data}/>
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
	);
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
			progress={props.productionQueue.activeEntry === null ? 0 : props.productionQueue.activeEntry.progress}
			onClick={props.productionQueue.open}
			className="production_queue__progress"
		>
			<Text relative>
				{props.productionQueue.activeEntry === null ? "" : props.productionQueue.activeEntry.type}
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

function BuildingList(props: UseSettlementWindow.Data): ReactElement {
	return (
		<>
			<HBox gap_s centerVertical left>
				<Text>{"Building-Slots: " + props.settlement.buildings.length + "/" + "?"}</Text>
			</HBox>
			<HBox gap_s top left wrap>
				{props.settlement.buildings.map((building, index) => (
					<BuildingEntry key={index} data={props} building={building}/>
				))}
			</HBox>
		</>
	);
}

function BuildingEntry(props: { data: UseSettlementWindow.Data, building: Building }): ReactElement {
	return (
		<BuildingInfoTooltip building={props.building}>
			<div
				className={joinClassNames(["settlement-content-box", props.building.active ? null : "settlement-content-box--disabled"])}
				style={{
					backgroundImage: "url('" + "icons/production/" + props.building.type + ".png')",
				}}
			/>
		</BuildingInfoTooltip>
	);
}

export function BuildingInfoTooltip(props: { building: Building, children?: any }) {
	return (
		<TooltipContext>
			<TooltipTrigger>
				{props.children}
			</TooltipTrigger>
			<TooltipContent>
				<TooltipPanel>

					<VBox padding_m gap_s fillParent>
						<Header4>{props.building.type}</Header4>
						<SimpleDivider/>
						{
							<>
								<HBox gap_xs>
									<Text>Active:</Text>
									<Text type={props.building.active ? "positive" : "negative"}>{props.building.active ? "Yes" : "No"}</Text>
								</HBox>
								<HBox gap_xs>
									<Text>Works Tile:</Text>
									<Text>{props.building.workedTile ? props.building.workedTile.q + "," + props.building.workedTile.r : "-"}</Text>
								</HBox>
							</>
						}
					</VBox>

				</TooltipPanel>
			</TooltipContent>
		</TooltipContext>
	);
}