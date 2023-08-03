import {ComponentMeta, ComponentStory} from "@storybook/react";
import {SelectField} from "../components/specific/test/SelectField";

export default {
	title: "SelectField",
	component: SelectField,
} as ComponentMeta<typeof SelectField>

const Template: ComponentStory<typeof SelectField> = (args) => {
	return (
		<>
			<div style={{height: "200px"}}>before</div>
			<div style={{
				padding: "50px 50px",
				overflow: "auto"
			}}>
				<div style={{
					overflow: "visible",
					maxHeight: "60px"
				}}>
				<SelectField></SelectField>
				</div>
			</div>
			<div style={{height: "200px"}}>after</div>
		</>
	)
}

export const DefaultSelectField = Template.bind({})
DefaultSelectField.args = {}
