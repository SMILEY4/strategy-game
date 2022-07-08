import {Button} from "../ui/components/button/Button";
import {ComponentMeta, ComponentStory} from "@storybook/react";

export default {
	title: "Button",
	component: Button,
	argTypes: {
		onAction: {action: "action"}
	}
} as ComponentMeta<typeof Button>

const Template: ComponentStory<typeof Button> = (args) => (
	<Button style={args.style} disabled={args.disabled}>{args.children}</Button>
)

export const DefaultButton = Template.bind({})
DefaultButton.args = {style: "default", disabled: false, children: "Click Me"}
