export class HttpClient {

    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Make an http "GET"-request
     * @param path the path appended to the base url.
     * @param request the request data.
     * @return the response data.
     */
    get<TRequest = unknown, TResponse = HttpResponse>(path: string, request: HttpRequest<TRequest> = {body: null as TRequest}): Promise<TResponse> {
        return this.execute<TRequest, TResponse>(path, "GET", request, 1);
    }

    /**
     * Make an http "POST"-request
     * @param path the path appended to the base url.
     * @param request the request data.
     * @return the response data.
     */
    post<TRequest = unknown, TResponse = HttpResponse>(path: string, request: HttpRequest<TRequest> = {body: null as TRequest}): Promise<TResponse> {
        return this.execute<TRequest, TResponse>(path, "POST", request, 1);
    }

    /**
     * Make an http "PUT"-request
     * @param path the path appended to the base url.
     * @param request the request data.
     * @return the response data.
     */
    put<TRequest = unknown, TResponse = HttpResponse>(path: string, request: HttpRequest<TRequest> = {body: null as TRequest}): Promise<TResponse> {
        return this.execute<TRequest, TResponse>(path, "PUT", request, 1);
    }

    /**
     * Make an http "DELETE"-request
     * @param path the path appended to the base url.
     * @param request the request data.
     * @return the response data.
     */
    delete<TRequest = unknown, TResponse = HttpResponse>(path: string, request: HttpRequest<TRequest> = {body: null as TRequest}): Promise<TResponse> {
        return this.execute<TRequest, TResponse>(path, "DELETE", request, 1);
    }

    /**
     * Make an http request
     * @param path the path appended to the base url.
     * @param method the http method to use
     * @param request the request data.
     * @param attempt the count of attempts for this request
     * @return the response data.
     */
    async execute<TRequest, TResponse>(path: string, method: "GET" | "POST" | "PUT" | "DELETE", request: HttpRequest<TRequest>, attempt: number): Promise<TResponse> {

        // build full url
        const fullUrl = (this.baseUrl.endsWith("/") || path.startsWith("/"))
            ? this.baseUrl + path
            : this.baseUrl + "/" + path;

        console.debug("Making http request", method, fullUrl, request, "attempt=" + attempt);

        // build headers
        const headers: Record<string, string> = {
            ...(request.body !== undefined ? {"Content-Type": "application/json"} : {}),
        };

        // append authentication
        if (request.auth) {
            await request.auth.appendAuth(headers);
        }

        // build credentials flag
        const credentials = request.auth?.appendCredentials === true
            ? "include"
            : undefined;

        // build request body
        const requestBody = request.body
            ? JSON.stringify(request.body)
            : undefined;


        // build complete request data
        const data: RequestInit = {
            method: method,
            headers: headers,
            credentials: credentials,
            body: requestBody,
        };

        console.debug("Making http request", method, fullUrl, JSON.stringify(data), "attempt=" + attempt);

        // make http call
        let response: Response = null!
        try {
            response = await fetch(fullUrl, data);
        } catch (error) {
            console.warn("Failed http call:", method, fullUrl, error);
        }

        // try to handle unauthorized response (and retry if necessary)
        if (response.status == 401 && request.auth) {
            if (attempt === 1) {
                const retry = await request.auth.onUnauthorized();
                if (retry) {
                    return this.execute(path, method, request, attempt + 1);
                } else {
                    request.auth.onUnhandledUnauthorized();
                }
            } else {
                request.auth.onUnhandledUnauthorized();
            }
        }

        console.debug("response", method, fullUrl, response.status)

        // handle response
        const text = await response.text();
        const parsedBody: unknown | null = text ? JSON.parse(text) : null;
        return {
            status: response.status,
            body: parsedBody,
        } as TResponse;
    }

}

/**
 * Data for an http request
 */
export interface HttpRequest<TBody = unknown> {
    auth?: HttpRequestAuthHandler,
    body: TBody;
}

/**
 * Authentication handler
 */
export interface HttpRequestAuthHandler {
    appendCredentials: boolean;
    appendAuth: (headers: Record<string, string>) => void | PromiseLike<void>,
    onUnauthorized: () => boolean | PromiseLike<boolean>,
    onUnhandledUnauthorized: () => void | PromiseLike<void>,
}

/**
 * Data of an http response
 */
export interface HttpResponse<TBody = unknown> {
    status: number,
    body: TBody;
}