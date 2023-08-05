import {Meta, StoryObj} from "@storybook/react";
import {BorderMetallic} from "./BorderMetallic";

const meta = {
    title: "Object/Border/Metallic",
    component: BorderMetallic,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof BorderMetallic>;

export default meta;
type Story = StoryObj<typeof BorderMetallic>;


export const Gold: Story = {
    render: () => (
        <BorderMetallic color="gold">
            <div style={{
                width: "200px",
                height: "50px",
                backgroundColor: "gray",
            }}/>
        </BorderMetallic>
    ),
};

export const Silver: Story = {
    render: () => (
        <BorderMetallic color="silver">
            <div style={{
                width: "200px",
                height: "50px",
                backgroundColor: "gray",
            }}/>
        </BorderMetallic>
    ),
};