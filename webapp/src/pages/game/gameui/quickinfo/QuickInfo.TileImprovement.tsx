import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {Txt} from "@modules/uicomponents/text/Txt.tsx";
import type {QuickInfoTileImprovementViewModel} from "@pages/game/gameui/quickinfo/quickinfo.view.model.ts";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {Spacer} from "@modules/uicomponents/layout/spacer/Spacer.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import {Icon} from "@modules/uicomponents/icon/Icon.tsx";

export function QuickInfo_TileImprovement(props: QuickInfoTileImprovementViewModel) {
    return (
        <VerticalLayout paddingS spacingS verticalStart horizontalStretch fillFlex fillWidth>

            <HorizontalLayout spacingXs horizontalStart verticalCenter>
                <Txt.Heading h4><Txt.String>{props.type}</Txt.String></Txt.Heading>
                <Spacer horizontal/>
                <Button circle sizeS disabled><Icon.ArrowUpRightFromSquare/></Button>
                <Button circle sizeS onClick={props.actions.focusCamera}><Icon.Eye/></Button>
            </HorizontalLayout>

            <VerticalLayout spacing3xs verticalStart horizontalStretch>
                <Txt.Line><Txt.String>Owner: </Txt.String><Txt.String>{`${props.owner}`}</Txt.String></Txt.Line>
                <Txt.Line><Txt.String>Id: </Txt.String><Txt.String>{`${props.id}`}</Txt.String></Txt.Line>
                <Txt.Line><Txt.String>Admin. Settlement: </Txt.String><Txt.String>{`${props.settlement}`}</Txt.String></Txt.Line>
            </VerticalLayout>

        </VerticalLayout>
    );
}