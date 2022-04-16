
export namespace Client {

	const BASE_URL = import.meta.env.PUB_BACKEND_URL;

	export function getHello(name: string): Promise<string> {
		return fetch(`${BASE_URL}/hello/${name}`)
			.then(response => response.text())
			.catch(() => "Error");
	}

}