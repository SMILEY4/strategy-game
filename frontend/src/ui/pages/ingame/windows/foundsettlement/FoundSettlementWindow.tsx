import {TileIdentifier} from "../../../../../models/tile";
import React from "react";
import {TextField} from "../../../../components/textfield/TextField";
import {DefaultDecoratedWindowWithHeader} from "../../../../components/windows/decorated/DecoratedWindow";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {BasicTooltip} from "../../../../components/tooltip/BasicTooltip";
import {UseFoundSettlementWindow} from "./useFoundSettlementWindow";

export interface FoundSettlementWindowProps {
	windowId: string;
	tile: TileIdentifier,
	worldObjectId: string
}


export function FoundSettlementWindow(props: FoundSettlementWindowProps) {

	const data: UseFoundSettlementWindow.Data = UseFoundSettlementWindow.useData(props.windowId, props.tile, props.worldObjectId);

	return (
		<>

			<DefaultDecoratedWindowWithHeader
				windowId={props.windowId}
				minHeight="150px"
				withoutScroll
				header={2}
				title={"Found Settlement"}
			>

				<TextField
					value={data.input.name.value}
					placeholder={"Settlement Name"}
					type="text"
					onChange={data.input.name.set}
				/>

				<HBox right centerVertical gap_s>

					<ButtonPrimary red onClick={data.cancel}>
						Cancel
					</ButtonPrimary>

					<BasicTooltip
						enabled={!data.input.valid}
						delay={500}
						content={<ul>{data.input.reasonsInvalid.map(e => (<li>{e}</li>))}</ul>}
					>
						<ButtonPrimary green disabled={!data.input.valid} onClick={data.create}>
							Create
						</ButtonPrimary>
					</BasicTooltip>

				</HBox>

			</DefaultDecoratedWindowWithHeader>
		</>
	);
}