import {Panel} from "./Panel";
import {StoryObj} from "@storybook/react";
import React from "react";
import {Block} from "../block/Block";
import {Border} from "../border/Border";

const meta = {
    title: "Panel",
    component: Panel,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<typeof Panel>
export default meta;


export const Red: Story = {
    render: () => (
        <Panel color="red">
            <DummyContent/>
        </Panel>
    ),
};

export const Green: Story = {
    render: () => (
        <Panel color="green">
            <DummyContent/>
        </Panel>
    ),
};

export const Blue: Story = {
    render: () => (
        <Panel color="blue">
            <DummyContent/>
        </Panel>
    ),
};

export const Paper: Story = {
    render: () => (
        <Panel color="paper">
            <DummyContent/>
        </Panel>
    ),
};


export const Stacked: Story = {
    render: () => (
        <Panel color="red">
            <Panel color="green">
                <Panel color="blue">
                    <Panel color="paper">
                        {/*<Border>*/}
                        {/*    <Block/>*/}
                        {/*</Border>*/}

                        <div className="test">
                            <div className="test__inner">
                               Content
                            </div>
                        </div>

                    </Panel>
                </Panel>
            </Panel>
        </Panel>
    ),
};

function DummyContent() {
    return (
        <div style={{
            width: "200px",
            height: "200px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            Content
        </div>
    );
}
