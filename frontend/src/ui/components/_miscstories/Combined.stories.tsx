import {StoryObj} from "@storybook/react";
import React from "react";
import {DecoratedPanel} from "../panels/decorated/DecoratedPanel";
import {VBox} from "../layout/vbox/VBox";
import {InsetPanel} from "../panels/inset/InsetPanel";
import {arrayOfSize} from "../../../common/utils";
import {HBox} from "../layout/hbox/HBox";
import "../base/base.less"
import {Txt} from "../text/Txt";
import {Button} from "../button/Button";

const meta = {
    title: "Combined",
    parameters: {
        layout: "centered",
    },
    tags: [],
    argTypes: {},
};
type Story = StoryObj<{}>
export default meta;


export const BasicWindowLayout: Story = {
    render: () => (
        <div style={{
            height: "200px",
        }}>
            <DecoratedPanel ornament fullSize>
                <VBox padding_l gap_m fullSize>

                    <Txt.Header2 dontGrow dontShrink>
                        <Txt.String>Some Header</Txt.String>
                    </Txt.Header2>

                    <InsetPanel grow shrink>
                        <VBox scrollable padding_s fullSize>

                                {arrayOfSize(10).map(it => (
                                    <DecoratedPanel simple dontShrink dontGrow>
                                        <HBox padding_s centerVertical>
                                            <Txt.Body grow><Txt.String>{"Item " + it + ".".repeat(it)}</Txt.String></Txt.Body>
                                            <Button small>Add</Button>
                                            <Button small>Remove</Button>
                                        </HBox>
                                    </DecoratedPanel>
                                ))}

                        </VBox>
                    </InsetPanel>

                </VBox>
            </DecoratedPanel>
        </div>
    ),
};
