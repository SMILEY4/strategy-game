import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {Txt} from "@modules/uicomponents/text/Txt.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import type {QuickInfoTileViewModel} from "@pages/game/gameui/quickinfo/quickinfo.view.model.ts";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {Spacer} from "@modules/uicomponents/layout/spacer/Spacer.tsx";
import {Icon} from "@/modules/uicomponents/icon/Icon";

export function QuickInfo_Tile(props: QuickInfoTileViewModel) {
    return (
        <VerticalLayout paddingS spacingS verticalStart horizontalStretch fillFlex fillWidth>

            <HorizontalLayout spacingXs horizontalStart verticalCenter>
                <Txt.Heading h4><Txt.String>Plains</Txt.String></Txt.Heading>
                <Spacer horizontal/>
                <Button circle sizeS disabled><Icon.ArrowUpRightFromSquare/></Button>
                <Button circle sizeS onClick={props.actions.focusCamera}><Icon.Eye/></Button>
            </HorizontalLayout>

            <HorizontalLayout spacingXs horizontalStart verticalCenter>

                {props.actions.foundSettlementFirst.available && (
                    <Button
                        disabled={!props.actions.foundSettlementFirst.possible}
                        onClick={props.actions.foundSettlementFirst.execute}
                    >
                        Found Capital
                    </Button>
                )}

                {props.actions.foundSettlement.available && (
                    <Button
                        disabled={!props.actions.foundSettlement.possible}
                        onClick={props.actions.foundSettlement.execute}
                    >
                        Found Settlement
                    </Button>
                )}

            </HorizontalLayout>

            <VerticalLayout spacing3xs verticalStart horizontalStretch>
                <Txt.Line><Txt.String>Position: </Txt.String><Txt.String>{`${props.position.q},${props.position.r}`}</Txt.String></Txt.Line>
                <Txt.Line><Txt.String>Elevation: </Txt.String><Txt.String>{`${props.terrain?.elevation}`}</Txt.String></Txt.Line>
                <Txt.Line><Txt.String>Biome: </Txt.String><Txt.String>{`${props.terrain?.biome}`}</Txt.String></Txt.Line>
                <Txt.Line><Txt.String>Feature: </Txt.String><Txt.String>{`${props.terrain?.feature}`}</Txt.String></Txt.Line>
                <Txt.Line><Txt.String>Id: </Txt.String><Txt.String>{`${props.id}`}</Txt.String></Txt.Line>
            </VerticalLayout>

            <VerticalLayout spacing3xs verticalStart horizontalStretch>
                <Txt.Line><Txt.String>Control: </Txt.String></Txt.Line>
                {props.control.map(control => (
                    <Txt.Line>
                        <Txt.String>{`- ${control.source}:` }</Txt.String>
                        <Txt.String>{`${control.amount}`}</Txt.String>
                    </Txt.Line>
                ))}
            </VerticalLayout>

        </VerticalLayout>
    );
}