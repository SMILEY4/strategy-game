import React, {ReactElement} from "react";
import {DefaultDecoratedWindowWithHeader} from "../../../../components/windows/decorated/DecoratedWindow";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {joinClassNames} from "../../../../components/utils";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Text} from "../../../../components/text/Text";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {UseProductionQueueWindow} from "./useProductionQueueWindow";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {AudioType} from "../../../../../shared/audioService";
import {CgClose} from "react-icons/cg";
import {ProductionQueueEntryAggregate} from "../../../../../models/aggregates/SettlementAggregate";
import "./productionQueueWindow.less";

export interface ProductionQueueWindowProps {
	windowId: string;
	settlementId: string;
}

export function ProductionQueueWindow(props: ProductionQueueWindowProps): ReactElement {
	const data: UseProductionQueueWindow.Data = UseProductionQueueWindow.useData(props.settlementId);

	return (
		<DefaultDecoratedWindowWithHeader windowId={props.windowId} title="Production Queue" withoutScroll>

			<InsetPanel fillParent hideOverflow noPadding>
				<VBox top stretch gap_xs padding_s scrollable fillParent>
					{data.entries.map((entry, index) => (
						<QueueEntry
							key={entry.entryId}
							data={data}
							entry={entry}
							position={index + 1}
						/>
					))}
				</VBox>
			</InsetPanel>

		</DefaultDecoratedWindowWithHeader>
	);
}


function QueueEntry(props: {
	data: UseProductionQueueWindow.Data,
	entry: ProductionQueueEntryAggregate,
	position: number
}): ReactElement {
	return (
		<DecoratedPanel
			className={joinClassNames(["queue-entry", props.entry.isCommand ? "queue-entry--command" : null])}
			background={
				<div
					className={"queue-entry-background"}
					style={{backgroundImage: "url('" + "icons/production/" + props.entry.type + ".png')"}}
				/>
			}
			simpleBorder paddingSmall blue
		>
			<HBox centerVertical spaceBetween gap_s>
				<Text className="queue-entry__name">{props.position + ". " + props.entry.type}</Text>
				{!props.entry.isCommand && props.position === 1 && (
					<ProgressBar progress={props.entry.progress} className="production_queue__progress"/>)}
				<ButtonPrimary
					square round small
					onClick={() => props.data.cancel(props.entry)}
					soundId={AudioType.CLICK_CLOSE.id}
				>
					<CgClose/>
				</ButtonPrimary>
			</HBox>
		</DecoratedPanel>
	);
}