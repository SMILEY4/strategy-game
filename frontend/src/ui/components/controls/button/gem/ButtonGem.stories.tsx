import {Meta, StoryObj} from "@storybook/react";
import {ButtonGem} from "./ButtonGem";

const meta = {
    title: "Control/Button/Gem",
    component: ButtonGem,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ButtonGem>;

export default meta;
type Story = StoryObj<typeof ButtonGem>;


export const GoldBorder: Story = {
    render: () => (
        <ButtonGem border="gold">
            Button
        </ButtonGem>
    ),
};

export const SilverBorder: Story = {
    render: () => (
        <ButtonGem border="silver">
            Button
        </ButtonGem>
    ),
};
