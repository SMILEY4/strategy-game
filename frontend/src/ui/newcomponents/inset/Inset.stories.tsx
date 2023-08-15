import {Inset} from "./Inset";
import {StoryObj} from "@storybook/react";
import React from "react";
import {Panel} from "../panel/Panel";

const meta = {
    title: "Inset",
    component: Inset,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<typeof Inset>
export default meta;


export const Default: Story = {
    render: () => (
        <Inset>
            <DummyContent/>
        </Inset>
    ),
};

export const OnPanel: Story = {
    render: () => (
        <Panel color="red">
            <DummyPadding padding="0">
                <Inset>
                    <DummyContent/>
                </Inset>
                <Inset>
                    <DummyContent/>
                </Inset>
            </DummyPadding>
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
            gap: "1rem"
        }}>
            Content
        </div>
    );
}

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
