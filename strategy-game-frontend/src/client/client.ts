export namespace Client {

	const BASE_URL = import.meta.env.PUB_BACKEND_URL;


	export function getHello(name: string): Promise<string> {
		return get(`${BASE_URL}/api/test/hello/${name}`)
			.then(response => response.text())
			.catch(() => "Error");
	}


	export interface WorldMeta {
		worldId: string;
	}


	export function createWorld(): Promise<WorldMeta> {
		return post(`${BASE_URL}/api/world/create`)
			.then(response => response.json())
			.then(data => ({worldId: data.worldId}))
			.catch(() => {
				throw new Error("Error creating world");
			});
	}


	export function joinWorld(worldId: string, playerId: string): Promise<void> {
		// TODO: do something
		return Promise.resolve();
	}


	function get(url: string): Promise<Response> {
		return fetch(url);
	}


	function post(url: string, body?: any): Promise<Response> {
		return fetch(url, {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				body: (body !== undefined && body != null)
					? JSON.stringify(body, null, "   ")
					: undefined
			}
		);
	}

}