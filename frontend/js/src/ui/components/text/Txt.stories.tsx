import {StoryObj} from "@storybook/react";
import React from "react";
import {DecoratedPanel} from "../panels/decorated/DecoratedPanel";
import {Txt} from "./Txt";
import {VBox} from "../layout/vbox/VBox";
import {Tooltip} from "../tooltip/Tooltip";
import {HBox} from "../layout/hbox/HBox";


const meta = {
    title: "Static/Text",
    component: Text,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<{ value: number}>
export default meta;


export const Default: Story = {
    render: (args) => (
        <DecoratedPanel style={{width: "200px"}}>
            <VBox padding_m>

                <Txt.Header2 center>
                    <Txt.Icon name="command"/>
                    <Txt.String>Info</Txt.String>
                    <Txt.Icon name="metal"/>
                </Txt.Header2>

                <Txt.Body>
                    <Txt.Link onClick={() => alert("click")}>
                        <Txt.Icon name="command"/>
                        <Txt.String>Income:</Txt.String>
                    </Txt.Link>
                    <Txt.Whitespace/>
                    <Txt.Number>{6}</Txt.Number>
                    <Txt.Whitespace/>
                    <Tooltip.Context inline>
                        <Tooltip.Trigger>
                            <Txt.Icon name="food"/>
                            <Txt.Whitespace/>
                            <Txt.String>Food</Txt.String>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            Some description for food.
                        </Tooltip.Content>
                    </Tooltip.Context>
                </Txt.Body>

                <Txt.Body secondary>
                    <Txt.Link onClick={() => alert("click")}>
                        <Txt.Icon name="command"/>
                        <Txt.String>Income:</Txt.String>
                    </Txt.Link>
                    <Txt.Whitespace/>
                    <Txt.Number>{6}</Txt.Number>
                    <Txt.Whitespace/>
                    <Tooltip.Context inline>
                        <Tooltip.Trigger>
                            <Txt.Icon name="food"/>
                            <Txt.Whitespace/>
                            <Txt.String>Food</Txt.String>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            Some description for food.
                        </Tooltip.Content>
                    </Tooltip.Context>
                </Txt.Body>

            </VBox>
        </DecoratedPanel>
    ),
};
