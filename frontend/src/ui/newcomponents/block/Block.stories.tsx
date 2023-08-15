import {StoryObj} from "@storybook/react";
import React from "react";
import {Block} from "./Block";
import {Panel} from "../panel/Panel";
import {Border} from "../border/Border";

const meta = {
    title: "Block",
    component: Block,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<typeof Block>
export default meta;


export const Default: Story = {
};

export const OnPanel: Story = {
    render: () => (
        <Panel color={"red"}>
            <DummyPadding padding="30px">
                <Border>
                    <Block/>
                </Border>
            </DummyPadding>
        </Panel>
    )
};



function DummyPadding(props: { padding: string, children?: any }) {
    return (
        <div style={{
            padding: props.padding,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem"
        }}>
            {props.children}
        </div>
    );
}
