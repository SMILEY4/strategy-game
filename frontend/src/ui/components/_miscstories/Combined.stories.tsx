import {StoryObj} from "@storybook/react";
import React from "react";
import {DecoratedPanel} from "../panels/decorated/DecoratedPanel";
import {VBox} from "../layout/vbox/VBox";
import {Header2} from "../header/Header";
import {InsetPanel} from "../panels/inset/InsetPanel";
import {arrayOfSize} from "../../../common/utils";
import {HBox} from "../layout/hbox/HBox";
import "../base/base.less"
import {Text} from "../text/Text"
import {Button} from "../button/primary/Button";

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

                    <Header2 dontGrow dontShrink>Some Header</Header2>

                    <InsetPanel grow shrink>
                        <VBox scrollable padding_s fullSize>

                                {arrayOfSize(10).map(it => (
                                    <DecoratedPanel simple dontShrink dontGrow>
                                        <HBox padding_s centerVertical>
                                            <Text grow>{"Item " + it + ".".repeat(it)}</Text>
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
