import {ComponentMeta, ComponentStory} from "@storybook/react";
import {TextField} from "../ui/components/specific/TextField";
import {useState} from "react";

export default {
	title: "TextField",
	component: TextField,
} as ComponentMeta<typeof TextField>

const Template: ComponentStory<typeof TextField> = (args) => {
	const [value, setValue] = useState("")
	return (
		<TextField value={value} onAccept={(v) => {
			setValue(v)
			console.log("ACCEPT", v)
		}}/>
	)
}

export const DefaultTextField = Template.bind({})
DefaultTextField.args = {}
