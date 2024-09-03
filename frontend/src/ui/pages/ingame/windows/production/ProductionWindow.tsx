import React, {ReactElement} from "react";
import {UseProductionWindow} from "./useProductionWindow";
import {DefaultDecoratedWindowWithHeader} from "../../../../components/windows/decorated/DecoratedWindow";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {formatNumber, joinClassNames} from "../../../../components/utils";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Text} from "../../../../components/text/Text";
import {ChangeInfoText} from "../../../../components/info/ChangeInfoText";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import "./productionWindow.less";
import {ProductionOptionAggregate} from "../../../../../models/aggregates/SettlementAggregate";

export interface ProductionWindowProps {
	windowId: string;
	settlementId: string;
}

export function ProductionWindow(props: ProductionWindowProps): ReactElement {
	const data: UseProductionWindow.Data = UseProductionWindow.useData(props.settlementId);
	return (
		<DefaultDecoratedWindowWithHeader windowId={props.windowId} title="Production" withoutScroll>
			<InsetPanel fillParent hideOverflow noPadding>
				<VBox top stretch gap_xs padding_s scrollable fillParent>
					{data.entries.map(entry => (
						<ProductionListEntry
							key={entry.type.id}
							data={data}
							entry={entry}
						/>
					))}
				</VBox>
			</InsetPanel>
		</DefaultDecoratedWindowWithHeader>
	);
}


function ProductionListEntry(props: { data: UseProductionWindow.Data, entry: ProductionOptionAggregate }) {
	return (
		<DecoratedPanel
			simpleBorder paddingSmall blue
			className={joinClassNames([
				"production-entry",
				props.entry.available ? null : "production-entry--disabled",
			])}
			background={
				<div
					className="production-entry-background"
					style={{backgroundImage: "url('" + props.entry.type.image + "')"}}
				/>
			}
		>
			<HBox centerVertical gap_s>
				<Text className="production-entry__name">
					{props.entry.type.name}
				</Text>
				<ChangeInfoText
					className={"production-entry__count"}
					prevValue={formatNumber(props.entry.queueCount, true, true)}
					nextValue={formatNumber(props.entry.queueCount + props.entry.commandCount, true, true)}
				/>
				<ButtonPrimary
					blue small
					className={"production-entry__button"}
					disabled={!props.entry.available}
					onClick={() => props.data.produce(props.entry)}
				>
					Add
				</ButtonPrimary>
			</HBox>
		</DecoratedPanel>
	);
}