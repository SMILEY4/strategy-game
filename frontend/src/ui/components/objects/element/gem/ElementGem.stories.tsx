import {Meta, StoryObj} from "@storybook/react";
import {ElementGem} from "./ElementGem";

const meta = {
    title: "Object/Element/Gem",
    component: ElementGem,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ElementGem>;

export default meta;
type Story = StoryObj<typeof ElementGem>;


export const Default: Story = {
    render: () => (
        <ElementGem interactive>
            <div style={{
                width: "200px",
                height: "50px",
            }}/>
        </ElementGem>
    ),
};