import {CK3Button} from "../ui/components/specific/ck3button/CK3Button";
import {ComponentMeta, ComponentStory} from "@storybook/react";

export default {
	title: "CK3Button",
	component: CK3Button,
	argTypes: {
		onAction: {action: "action"}
	}
} as ComponentMeta<typeof CK3Button>

const Template: ComponentStory<typeof CK3Button> = (args) => (
	<CK3Button>Click Me</CK3Button>
)

export const DefaultButton = Template.bind({})
DefaultButton.args = {}
