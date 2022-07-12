import {ComponentMeta, ComponentStory} from "@storybook/react";
import {SoCButton} from "../ui/components/specific/socButton/SoCButton";
import {SoCPanel2} from "../ui/components/specific/socButton/SoCPanel2";

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
