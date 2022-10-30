import {ComponentMeta, ComponentStory} from "@storybook/react";
import {SoCButton} from "../components/specific/test/SoCButton";
import {SoCPanel2} from "../components/specific/test/SoCPanel2";

export default {
    title: "SoCButton",
    component: SoCButton,
} as ComponentMeta<typeof SoCButton>;

const Template: ComponentStory<typeof SoCButton> = (args) => (
    <SoCPanel2>
        <SoCButton>Click Me</SoCButton>
    </SoCPanel2>
);

export const DefaultButton = Template.bind({});
DefaultButton.args = {};
