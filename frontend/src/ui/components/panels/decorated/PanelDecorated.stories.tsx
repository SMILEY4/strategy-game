import {ComponentMeta, ComponentStory} from "@storybook/react";
import {Button} from "../../../../uiOLD/components/specific/test/Button";

export default {
    title: "Button",
    component: Button,
} as ComponentMeta<typeof Button>

const Template: ComponentStory<typeof Button> = (args) => (
    <Button disabled={args.disabled} onAction={() => {
        return new Promise(resolve => setTimeout(resolve, 1000))
    }}>
        Click Me
    </Button>
)

export const DefaultButton = Template.bind({})
DefaultButton.args = {
    disabled: false
}
