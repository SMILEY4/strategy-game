import {Meta, StoryObj} from "@storybook/react";
import {ButtonOutline} from "./ButtonOutline";

const meta = {
    title: "Control/Button/Outline",
    component: ButtonOutline,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ButtonOutline>;

export default meta;
type Story = StoryObj<typeof ButtonOutline>;


export const Default: Story = {
    render: () => (
        <ButtonOutline>
            Button
        </ButtonOutline>
    ),
};

export const Disabled: Story = {
    render: () => (
        <ButtonOutline disabled>
            Disabled
        </ButtonOutline>
    ),
};
