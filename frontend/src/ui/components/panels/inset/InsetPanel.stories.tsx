import {StoryObj} from "@storybook/react";
import React from "react";
import {InsetPanel} from "./InsetPanel";
import {DecoratedPanel} from "../decorated/DecoratedPanel";

const meta = {
    title: "Panels/Inset",
    component: InsetPanel,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<typeof InsetPanel>
export default meta;


export const Default: Story = {
    render: () => (
        <InsetPanel>
            <DummyContent/>
        </InsetPanel>
    ),
};

export const OnPanel: Story = {
    render: () => (
        <DecoratedPanel color="red">
            <DummyPadding padding="0">
                <InsetPanel>
                    <DummyContent/>
                </InsetPanel>
                <InsetPanel>
                    <DummyContent/>
                </InsetPanel>
            </DummyPadding>
        </DecoratedPanel>
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
            gap: "1rem",
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
            gap: "1rem",
        }}>
            {props.children}
        </div>
    );
}
