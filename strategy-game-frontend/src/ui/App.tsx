import "./App.css";
import {useState} from "react";
import {Client} from "../client/client";

export function App() {

	const [text, setText] = useState("");
	const [response, setResponse] = useState("");

	return (
		<div className="app">
			<b>Hello-World Rest<br/></b>
			<input type="text" value={text} onChange={onChangeText}/>
			<button onClick={onSubmit}>Submit</button>
			<div className="response">{response}</div>
		</div>
	);

	function onChangeText(e: any) {
		setText(e.target.value);
	}

	function onSubmit() {
		Client.getHello(text).then(setResponse);
	}

}
