export class HttpClient {

    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    get<T>(data: GetData): Promise<T> {
        return this.makeRequest(this.baseUrl + data.url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                ...HttpClient.buildAuthHeader(!!data.requireAuth, data.token),
            },
            body: HttpClient.buildRequestBody(data.body),
        }).then(response => {
            return this.handleResponse(response, data.responseType);
        });
    }


    post<T>(data: PostData): Promise<T> {
        return this.makeRequest(this.baseUrl + data.url, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                ...HttpClient.buildAuthHeader(!!data.requireAuth, data.token),
            },
            body: HttpClient.buildRequestBody(data.body),
        }).then(response => {
            return this.handleResponse(response, data.responseType);
        });
    }


    delete<T>(data: DeleteData): Promise<T> {
        return this.makeRequest(this.baseUrl + data.url, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                ...HttpClient.buildAuthHeader(!!data.requireAuth, data.token),
            },
            body: HttpClient.buildRequestBody(data.body),
        }).then(response => {
            return this.handleResponse(response, data.responseType);
        });
    }

    private static buildAuthHeader(requireAuth: boolean, token?: string | null): Record<string, string> {
        return requireAuth ? {"Authorization": "Bearer " + token} : {};
    }

    private static buildRequestBody(body: any | null | undefined) {
        return (body !== undefined && body !== null)
            ? JSON.stringify(body, null, "   ")
            : undefined;
    }

    private makeRequest(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
        return fetch(input, init)
            .catch(error => {
                throw new NetworkError(input.toString(), "" + init.method, error);
            });
    }

    private handleResponse<T>(response: Response, type?: "json" | "text"): Promise<T> {
        if (response.ok) {
            if (type === "json" || type === undefined) {
                return response.json() as Promise<T>;
            } else {
                return response.text() as Promise<T>;
            }
        } else {
            return response.text().then(content => {
                throw ResponseError.from(content, response.status);
            });
        }
    }

}


export interface GetData {
    url: string,
    body?: any,
    requireAuth?: boolean,
    token?: string | null,
    responseType?: "json" | "text"
}


export interface PostData {
    url: string,
    body?: any,
    requireAuth?: boolean,
    token?: string | null,
    responseType?: "json" | "text"
}


export interface DeleteData {
    url: string,
    body?: any,
    requireAuth?: boolean,
    token?: string | null,
    responseType?: "json" | "text"
}


export class NetworkError extends Error {

    readonly url: string;
    readonly method: string;

    constructor(url: string, method: string, cause?: any) {
        super("Encountered a network error when attempting to make request.");
        this.name = "CustomNetworkError";
        this.url = url;
        this.method = method;
        this.cause = cause;
    }
}

export class ResponseError extends Error {

    readonly type: string;
    readonly status: number;
    readonly title: string;
    readonly errorCode: string;
    readonly detail: string;
    readonly context: any | null;

    constructor(type: string, status: number, title: string, errorCode: string, detail: string, context: any) {
        super("Http-Response returned " + status + ".");
        this.type = type;
        this.status = status;
        this.title = title;
        this.errorCode = errorCode;
        this.detail = detail;
        this.context = context;
    }

    public static from(str: string, status: number): ResponseError {
        try {
            const jsonContent = JSON.parse(str);
            const isErrorResponse = Object.hasOwn(jsonContent, "type")
                && Object.hasOwn(jsonContent, "status")
                && Object.hasOwn(jsonContent, "title")
                && Object.hasOwn(jsonContent, "errorCode")
                && Object.hasOwn(jsonContent, "detail");
            if (isErrorResponse) {
                return new ResponseError(
                    jsonContent.type,
                    jsonContent.status,
                    jsonContent.title,
                    jsonContent.errorCode,
                    jsonContent.detail,
                    jsonContent.context,
                );
            } else {
                return ResponseError.fallback(str, status);
            }
        } catch (e) {
            return ResponseError.fallback(str, status);
        }
    }

    private static fallback(str: string, status: number): ResponseError {
        return new ResponseError(
            "about:blank",
            status,
            "Error",
            "ERROR",
            str,
            null,
        );
    }

}