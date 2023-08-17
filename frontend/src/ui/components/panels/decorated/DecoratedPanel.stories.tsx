import {DecoratedPanel} from "./DecoratedPanel";
import {StoryObj} from "@storybook/react";
import React from "react";

const meta = {
    title: "Panels/Decorated",
    component: DecoratedPanel,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<typeof DecoratedPanel>
export default meta;


export const Red: Story = {
    render: () => (
        <DecoratedPanel color="red">
            <DummyContent/>
        </DecoratedPanel>
    ),
};

export const Green: Story = {
    render: () => (
        <DecoratedPanel color="green">
            <DummyContent/>
        </DecoratedPanel>
    ),
};

export const Blue: Story = {
    render: () => (
        <DecoratedPanel color="blue">
            <DummyContent/>
        </DecoratedPanel>
    ),
};

export const Paper: Story = {
    render: () => (
        <DecoratedPanel color="paper">
            <DummyContent/>
        </DecoratedPanel>
    ),
};


export const Stacked: Story = {
    render: () => (
        <DecoratedPanel color="red">
            <DecoratedPanel color="green">
                <DecoratedPanel color="blue">
                    <DecoratedPanel color="paper">
                        <DummyContent/>
                    </DecoratedPanel>
                </DecoratedPanel>
            </DecoratedPanel>
        </DecoratedPanel>
    ),
};

function DummyContent() {
    return (
        <div style={{
            width: "150px",
            height: "150px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "gray"
        }}>
            Content
        </div>
    );
}
