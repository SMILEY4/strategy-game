import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {Txt} from "@modules/uicomponents/text/Txt.tsx";
import type {QuickInfoSettlementViewModel} from "@pages/game/gameui/quickinfo/quickinfo.view.model.ts";

export function QuickInfo_Settlement(_props: QuickInfoSettlementViewModel) {
    return (
        <VerticalLayout verticalStart horizontalStretch fillFlex fillWidth paddingM>
            <Txt.Body><Txt.String>{`todo: show information about selected settlement here`}</Txt.String></Txt.Body>
        </VerticalLayout>
    );
}