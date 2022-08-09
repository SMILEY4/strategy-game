export class HttpClient {

    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }


    get(data: GetData): Promise<Response> {
        return fetch(this.baseUrl + data.url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                ...HttpClient.buildAuthHeader(!!data.requireAuth, data.token)
            }
        });
    }


    post(data: PostData): Promise<Response> {
        return fetch(this.baseUrl + data.url, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                ...HttpClient.buildAuthHeader(!!data.requireAuth, data.token)
            },
            body: (data.body !== undefined && data.body !== null)
                ? JSON.stringify(data.body, null, "   ")
                : undefined
        });
    }


    delete(data: DeleteData): Promise<Response> {
        return fetch(this.baseUrl + data.url, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                ...HttpClient.buildAuthHeader(!!data.requireAuth, data.token)
            },
            body: (data.body !== undefined && data.body !== null)
                ? JSON.stringify(data.body, null, "   ")
                : undefined
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
