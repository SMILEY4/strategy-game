import {DecoratedPanel} from "./DecoratedPanel";
import {StoryObj} from "@storybook/react";
import React from "react";
import {VBox} from "../../layout/vbox/VBox";
import {Header2} from "../../header/Header";

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
        <DecoratedPanel red>
            <DummyContent/>
        </DecoratedPanel>
    ),
};

export const RedSimplified: Story = {
    render: () => (
        <DecoratedPanel red simpleBorder>
            <DummyContent/>
        </DecoratedPanel>
    ),
};

export const Green: Story = {
    render: () => (
        <DecoratedPanel green>
            <DummyContent/>
        </DecoratedPanel>
    ),
};

export const Blue: Story = {
    render: () => (
        <DecoratedPanel blue>
            <DummyContent/>
        </DecoratedPanel>
    ),
};

export const Paper: Story = {
    render: () => (
        <DecoratedPanel paper>
            <DummyContent/>
        </DecoratedPanel>
    ),
};


export const Stacked: Story = {
    render: () => (
        <DecoratedPanel red>
            <DecoratedPanel green simpleBorder>
                <DecoratedPanel blue simpleBorder>
                    <DecoratedPanel paper simpleBorder>
                        <DummyContent/>
                    </DecoratedPanel>
                </DecoratedPanel>
            </DecoratedPanel>
        </DecoratedPanel>
    ),
};

function DummyContent(props: { width?: string, height?: string }) {
    return (
        <div style={{
            width: props.width || "150px",
            height: props.height || "150px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            Content
        </div>
    );
}
