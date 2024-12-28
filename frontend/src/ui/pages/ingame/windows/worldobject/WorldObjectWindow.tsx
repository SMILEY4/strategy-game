import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {UseWorldObjectWindow} from "./useWorldObjectWindow";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Else, If, Then, When} from "react-if";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Banner} from "../../../../components/banner/Banner";
import {FiHexagon} from "react-icons/fi";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {Spacer} from "../../../../components/spacer/Spacer";

export interface WorldObjectWindowProps {
    windowId: string;
    identifier: string | null;
}

export function WorldObjectWindow(props: WorldObjectWindowProps): ReactElement {

    const data: UseWorldObjectWindow.Data | null = UseWorldObjectWindow.useData(props.identifier);

    if (data === null) {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton>
                <VBox fillParent center>
                    <Text>No object selected</Text>
                </VBox>
            </DecoratedWindow>
        );
    } else {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton noPadding>
                <VBox fillParent>

                    <Banner
                        title={data.worldObject.type.id}
                        subtitle={"World Object"}
                        color={data.worldObject.country.color}
                        spaceAbove
                    >
                        <ButtonPrimary info circle small onClick={data.open.tile}>
                            <FiHexagon/>
                        </ButtonPrimary>
                    </Banner>

                    <VBox scrollable gap_s stableScrollbar top stretch padding_m>

                        <Text>Available Actions:</Text>

                        <InsetPanel>

                            <VBox gap_s top stretch>

                                <When condition={data.movement.possible}>
                                    <If condition={data.movement.canCancel}>
                                        <Then>
                                            <ButtonPrimary info onClick={data.movement.cancel}>
                                                Cancel Movement
                                            </ButtonPrimary>
                                        </Then>
                                        <Else>
                                            <ButtonPrimary info onClick={data.movement.start}
                                                           disabled={!data.movement.enabled}>
                                                Move
                                            </ButtonPrimary>
                                        </Else>
                                    </If>
                                </When>

                                <When condition={data.settlement.possible}>
                                    <ButtonPrimary info onClick={data.settlement.start}
                                                   disabled={!data.settlement.enabled}>
                                        Found Settlement
                                    </ButtonPrimary>
                                </When>

                            </VBox>

                        </InsetPanel>

                        <Spacer size={"s"}/>

                        <InsetKeyValueGrid>
                            <EnrichedText>Id</EnrichedText>
                            <EnrichedText>{data.worldObject.id}</EnrichedText>
                        </InsetKeyValueGrid>

                    </VBox>

                    {/*<VBox scrollable fillParent gap_s stableScrollbar top stretch padding_m>*/}

                    {/*    <WindowSection>*/}
                    {/*        <InsetKeyValueGrid>*/}

                    {/*            <EnrichedText>Id</EnrichedText>*/}
                    {/*            <EnrichedText>{data.worldObject.id}</EnrichedText>*/}

                    {/*            <EnrichedText>Position</EnrichedText>*/}
                    {/*            <EnrichedText>{data.worldObject.tile.q + ", " + data.worldObject.tile.r}</EnrichedText>*/}

                    {/*            <EnrichedText>Country</EnrichedText>*/}
                    {/*            <EnrichedText>{data.worldObject.country.name}</EnrichedText>*/}

                    {/*        </InsetKeyValueGrid>*/}
                    {/*    </WindowSection>*/}


                    {/*</VBox>*/}
                </VBox>
            </DecoratedWindow>
        );
    }

}
