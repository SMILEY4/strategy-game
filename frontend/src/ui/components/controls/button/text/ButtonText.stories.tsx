import {Meta, StoryObj} from "@storybook/react";
import {ButtonText} from "./ButtonText";

const meta = {
    title: "Control/Button/Text",
    component: ButtonText,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ButtonText>;

export default meta;
type Story = StoryObj<typeof ButtonText>;


export const Default: Story = {
    render: () => (
        <ButtonText>
            Text Button
        </ButtonText>
    ),
};
