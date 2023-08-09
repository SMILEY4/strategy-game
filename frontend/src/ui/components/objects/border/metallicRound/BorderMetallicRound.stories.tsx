import {Meta, StoryObj} from "@storybook/react";
import {BorderMetallicRound} from "./BorderMetallicRound";

const meta = {
    title: "Object/Border/Metallic_Round",
    component: BorderMetallicRound,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof BorderMetallicRound>;

export default meta;
type Story = StoryObj<typeof BorderMetallicRound>;


export const Gold: Story = {
    render: () => (
        <BorderMetallicRound color="gold">
            <div style={{
                width: "50px",
                height: "50px",
                backgroundColor: "gray",
            }}/>
        </BorderMetallicRound>
    ),
};

export const Silver: Story = {
    render: () => (
        <BorderMetallicRound color="silver">
            <div style={{
                width: "50px",
                height: "50px",
                backgroundColor: "gray",
            }}/>
        </BorderMetallicRound>
    ),
};