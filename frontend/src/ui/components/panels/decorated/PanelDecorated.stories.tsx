import {Meta, StoryObj} from "@storybook/react";
import {PanelDecorated} from "./PanelDecorated";
import {PanelCloth} from "../cloth/panelCloth";
import React from "react";

const meta = {
    title: "Panel/Decorated",
    component: PanelDecorated,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
} satisfies Meta<typeof PanelDecorated>;

export default meta;
type Story = StoryObj<typeof PanelDecorated>;


export const Red: Story = {
    render: () => (
        <PanelDecorated color="red">
            <DummyContent/>
        </PanelDecorated>
    ),
};

export const Blue: Story = {
    render: () => (
        <PanelDecorated color="blue">
            <DummyContent/>
        </PanelDecorated>
    ),
};

export const OnCloth: Story = {
    render: () => (
        <PanelCloth color="blue">
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100vw",
                height: "100vh",
            }}>
                <PanelDecorated>
                    <DummyContent/>
                </PanelDecorated>
            </div>
        </PanelCloth>
    ),
};

function DummyContent() {
    return (
        <div style={{
            width: "200px",
            height: "200px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            Content
        </div>
    )
}
