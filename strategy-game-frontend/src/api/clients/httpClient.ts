export class HttpClient {

	private readonly baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl ? baseUrl : "";
	}


	/**
	 * Perform a "GET"-request
	 * @param url the url
	 */
	public get(url: string): Promise<Response> {
		return fetch(this.baseUrl + "" + url);
	}


	/**
	 * Perform a "POST"-request
	 * @param url the url
	 * @param content the content of the body (optional)
	 */
	public post(url: string, content?: object): Promise<Response> {
		return fetch(this.baseUrl + "" + url, {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				body: (content !== undefined && content != null)
					? JSON.stringify(content, null, "   ")
					: undefined
			}
		);
	}

}
