import {Meta, StoryObj} from "@storybook/react";
import {PanelDecorated} from "./PanelDecorated";

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


export const Default: Story = {
    render: () => (
        <PanelDecorated>
            <div style={{
                width: "200px",
                height: "200px",
            }}/>
        </PanelDecorated>
    ),
};