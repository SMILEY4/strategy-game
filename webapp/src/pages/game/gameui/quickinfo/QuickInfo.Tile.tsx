import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {Txt} from "@modules/uicomponents/text/Txt.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import type {QuickInfoTileViewModel} from "@pages/game/gameui/quickinfo/quickinfo.view.model.ts";

export function QuickInfo_Tile(props: QuickInfoTileViewModel) {
        return (
            <VerticalLayout verticalStart horizontalStretch fillFlex fillWidth paddingM>
                <Txt.Line><Txt.String>Id: </Txt.String><Txt.String>{`${props.id}`}</Txt.String></Txt.Line>
                <Txt.Line><Txt.String>Position: </Txt.String><Txt.String>{`${props.position.q},${props.position.r}`}</Txt.String></Txt.Line>
                <Txt.Line><Txt.String>Elevation: </Txt.String><Txt.String>{`${props.terrain?.elevation}`}</Txt.String></Txt.Line>
                <Txt.Line><Txt.String>Biome: </Txt.String><Txt.String>{`${props.terrain?.biome}`}</Txt.String></Txt.Line>
                <Txt.Line><Txt.String>Feature: </Txt.String><Txt.String>{`${props.terrain?.feature}`}</Txt.String></Txt.Line>
                <Button disabled={!props.actions.foundCapital.available} onClick={props.actions.foundCapital.execute}>Found Capital</Button>
            </VerticalLayout>
        );
}