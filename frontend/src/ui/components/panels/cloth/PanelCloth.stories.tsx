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


export const Gray: Story = {
    render: () => (
        <PanelCloth color="gray">
            <DummyContent/>
        </PanelCloth>
    )
};

export const Red: Story = {
    render: () => (
        <PanelCloth color="red">
            <DummyContent/>

        </PanelCloth>
    )
};

export const Blue: Story = {
    render: () => (
        <PanelCloth color="blue">
            <DummyContent/>
        </PanelCloth>
    )
};

function DummyContent() {
    return (
        <div style={{
            width: "500px",
            height: "500px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            Content
        </div>
    )
}
