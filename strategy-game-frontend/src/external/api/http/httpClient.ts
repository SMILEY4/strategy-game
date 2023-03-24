export class HttpClient {

    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    get(data: GetData): Promise<Response> {
        return this.makeRequest(this.baseUrl + data.url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                ...HttpClient.buildAuthHeader(!!data.requireAuth, data.token),
            },
        });
    }


    post(data: PostData): Promise<Response> {
        return this.makeRequest(this.baseUrl + data.url, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                ...HttpClient.buildAuthHeader(!!data.requireAuth, data.token),
            },
            body: (data.body !== undefined && data.body !== null)
                ? JSON.stringify(data.body, null, "   ")
                : undefined,
        });
    }


    delete(data: DeleteData): Promise<Response> {
        return this.makeRequest(this.baseUrl + data.url, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                ...HttpClient.buildAuthHeader(!!data.requireAuth, data.token),
            },
            body: (data.body !== undefined && data.body !== null)
                ? JSON.stringify(data.body, null, "   ")
                : undefined,
        });
    }

    private makeRequest(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
        return fetch(input, init)
            .catch(error => {
                throw new NetworkError(input.toString(), "" + init.method, error);
            });

    }

    private static buildAuthHeader(requireAuth: boolean, token?: String): Record<string, string> {
        return requireAuth ? {"Authorization": "Bearer " + token} : {};
    }

}


export interface GetData {
    url: string,
    body?: any,
    requireAuth?: boolean,
    token?: string
}


export interface PostData {
    url: string,
    body?: any,
    requireAuth?: boolean,
    token?: string
}


export interface DeleteData {
    url: string,
    body?: any,
    requireAuth?: boolean,
    token?: string
}


export class NetworkError extends Error {

    private readonly url: string;
    private readonly method: string;

    constructor(url: string, method: string, cause?: any) {
        super("Encountered a network error when attempting to make request.");
        this.name = "CustomNetworkError";
        this.url = url;
        this.method = method;
        this.cause = cause;
    }
}