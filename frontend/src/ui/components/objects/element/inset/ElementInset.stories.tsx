import {Meta, StoryObj} from "@storybook/react";
import {ElementInset} from "./ElementInset";

const meta = {
    title: "Object/Element/Inset",
    component: ElementInset,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ElementInset>;

export default meta;
type Story = StoryObj<typeof ElementInset>;


export const Default: Story = {
    render: () => (
        <ElementInset>
            <div style={{
                width: "200px",
                height: "50px",
            }}/>
        </ElementInset>
    ),
};