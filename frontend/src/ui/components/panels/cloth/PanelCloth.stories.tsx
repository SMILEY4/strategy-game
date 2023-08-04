import {Meta, StoryObj} from "@storybook/react";
import {PanelCloth} from "./panelCloth";

const meta = {
    title: "Panel/Cloth",
    component: PanelCloth,
    parameters: {
        layout: "centered"
    },
    tags: ["autodocs"],
} satisfies Meta<typeof PanelCloth>

export default meta;
type Story = StoryObj<typeof PanelCloth>;


export const Default: Story = {
    render: () => (
        <PanelCloth>
            <div style={{
                width: "500px",
                height: "500px",
            }}/>
        </PanelCloth>
    )
};

export const Red: Story = {
    render: () => (
        <PanelCloth type="red">
            <div style={{
                width: "500px",
                height: "500px",
            }}/>
        </PanelCloth>
    )
};

export const Blue: Story = {
    render: () => (
        <PanelCloth type="blue">
            <div style={{
                width: "500px",
                height: "500px",
            }}/>
        </PanelCloth>
    )
};

