import {Simulate} from "react-dom/test-utils";

export namespace Client {

	const BASE_URL = "http://localhost:8080";
	const WS_BASE_URL = "ws://localhost:8080";

	export function getHello(name: string): Promise<string> {
		return fetch(`${BASE_URL}/hello/${name}`)
			.then(response => response.text())
			.catch(() => "Error");
	}

}