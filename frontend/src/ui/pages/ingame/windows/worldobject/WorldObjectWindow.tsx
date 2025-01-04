import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {UseWorldObjectWindow} from "./useWorldObjectWindow";
import {Button} from "../../../../components/button/Button";
import {Else, If, Then, When} from "react-if";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Banner} from "../../../../components/banner/Banner";
import {FiHexagon} from "react-icons/fi";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Divider} from "../../../../components/divider/Divider";
import {RxEyeOpen} from "react-icons/rx";
import {Txt} from "../../../../components/text/Txt";

export interface WorldObjectWindowProps {
	windowId: string;
	identifier: string | null;
}

export function WorldObjectWindow(props: WorldObjectWindowProps): ReactElement {

	const data: UseWorldObjectWindow.Data | null = UseWorldObjectWindow.useData(props.identifier);

	if (data === null) {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
				<Txt.Body center fullSize>
					<Txt.String>No object selected</Txt.String>
				</Txt.Body>
			</DecoratedWindow>
		);
	} else {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton noPadding>
				<VBox fullSize>

					<Banner
						title={data.worldObject.identifier.type.id}
						subtitle={"World Object"}
						color={data.worldObject.country.color}
						spaceAbove
					>
						<Button circle small onClick={data.open.tile}><FiHexagon/></Button>
						<Button circle small onClick={data.centerCamera}><RxEyeOpen/></Button>
					</Banner>

					<VBox padding_l gap_m scrollable grow shrink>
						{data.worldObject.country.isUserCountry && (
							<>
								<Txt.Header2 center>
									<Txt.String>Actions</Txt.String>
								</Txt.Header2>
								<Divider line/>

								<InsetPanel dontShrink dontGrow>
									<VBox padding_s gap_s fullSize>

										<When condition={data.movement.possible}>
											<If condition={data.movement.canCancel}>
												<Then>
													<Button onClick={data.movement.cancel}>
														Cancel Movement
													</Button>
												</Then>
												<Else>
													<Button onClick={data.movement.start}
															disabled={!data.movement.enabled}>
														Move
													</Button>
												</Else>
											</If>
										</When>

										<When condition={data.settlement.possible}>
											<Button onClick={data.settlement.start} disabled={!data.settlement.enabled}>
												Found Settlement
											</Button>
										</When>

									</VBox>
								</InsetPanel>
							</>
						)}
					</VBox>
				</VBox>
			</DecoratedWindow>
		);
	}

}
