import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {UseWorldObjectWindow} from "./useWorldObjectWindow";
import {Button} from "../../../../components/button/primary/Button";
import {Else, If, Then, When} from "react-if";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Banner} from "../../../../components/banner/Banner";
import {FiHexagon} from "react-icons/fi";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";

export interface WorldObjectWindowProps {
    windowId: string;
    identifier: string | null;
}

export function WorldObjectWindow(props: WorldObjectWindowProps): ReactElement {

    const data: UseWorldObjectWindow.Data | null = UseWorldObjectWindow.useData(props.identifier);

    if (data === null) {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton>
                <VBox fullSize center>
                    <Text secondary>No object selected</Text>
                </VBox>
            </DecoratedWindow>
        );
    } else {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton noPadding>
                <VBox fullSize>

                    <Banner
                        title={data.worldObject.type.id}
                        subtitle={"World Object"}
                        color={data.worldObject.country.color}
                        spaceAbove
                    >
                        <Button circle small onClick={data.open.tile}><FiHexagon/></Button>
                    </Banner>

                    <VBox grow shrink scrollable gap_s padding_m>

                        <Text>Available Actions:</Text>

                        <InsetPanel dontShrink dontGrow>
                            <VBox  fullSize padding_s gap_s>

                                <When condition={data.movement.possible}>
                                    <If condition={data.movement.canCancel}>
                                        <Then>
                                            <Button onClick={data.movement.cancel}>
                                                Cancel Movement
                                            </Button>
                                        </Then>
                                        <Else>
                                            <Button onClick={data.movement.start} disabled={!data.movement.enabled}>
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

                    </VBox>
                </VBox>
            </DecoratedWindow>
        );
    }

}
