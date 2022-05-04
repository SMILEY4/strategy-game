import {AuthProvider} from "../../core/ports/provided/authProvider";

export class HttpClient {

	private readonly baseUrl: string;
	private readonly authProvider: AuthProvider;

	constructor(baseUrl: string, authProvider: AuthProvider) {
		this.baseUrl = baseUrl;
		this.authProvider = authProvider;
	}


	/**
	 * Perform a "GET"-request
	 * @param url the url
	 * @param requireAuth whether authorization is required
	 */
	public get(url: string, requireAuth?: Boolean): Promise<Response> {
		return fetch(this.baseUrl + "" + url, {
			headers: {
				"Accept": "application/json",
				...this.buildAuthHeader(!!requireAuth)
			}
		});
	}


	/**
	 * Perform a "POST"-request
	 * @param url the url
	 * @param content the content of the body (optional)
	 * @param requireAuth whether authorization is required
	 */
	public post(url: string, content?: object, requireAuth?: boolean): Promise<Response> {
		return fetch(this.baseUrl + "" + url, {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					...this.buildAuthHeader(!requireAuth)
				},
				body: (content !== undefined && content != null)
					? JSON.stringify(content, null, "   ")
					: undefined
			}
		);
	}

	private buildAuthHeader(requireAuth: Boolean): Record<string, string> {
		if (requireAuth) {
			return {
				"Authorization": "Bearer " + this.authProvider.getToken()
			};
		} else {
			return {};
		}
	}

}
