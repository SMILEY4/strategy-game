import {AppError, type AppErrorData} from "@app/app-error.ts";

interface RequestConfig {
    url: string
    authenticated?: boolean;
    headers?: Record<string, string>;
}

interface RequestConfigWithContent<TContent> extends RequestConfig{
    content: TContent
}

export interface HttpClient {
    get: <TResponse = never>(config: RequestConfig) => Promise<TResponse>;
    post: <TRequest = never, TResponse = never>(config: RequestConfigWithContent<TRequest>) => Promise<TResponse>;
    put: <TRequest = never, TResponse = never>(config: RequestConfigWithContent<TRequest>) => Promise<TResponse>;
    delete: <TRequest = never, TResponse = never>(config: RequestConfigWithContent<TRequest>) => Promise<TResponse>;
}

interface HttpClientAuthHandler {
    getToken: () => string | Promise<string>;
    handleUnauthorized: () => void | Promise<void>;
}

interface Dependencies {
    baseUrl: string;
    authHandler: HttpClientAuthHandler;
}


/*
 USAGE:

    const users = await client.get<User[]>({
        url: "/api/users",
        authenticated: true,
        headers: {
            "X-Client-Id": "12345"
        }
    })

    const user = await client.post<CreateUser, User>({
        url: "/api/user",
        authenticated: true,
        content: {
            name: "Example User",
            email: "user@example.com"
        },
        headers: {
            "X-Client-Id": "12345"
        }
    })

 */
export const httpClient = ({baseUrl, authHandler}: Dependencies): HttpClient => {

    async function buildHeaders(config: RequestConfig | undefined, withBody: boolean): Promise<Headers> {
        const headers = new Headers({
            "Accept": "application/json",
            ...(config?.headers ?? {})
        });

        if (config?.authenticated) {
            const token = await authHandler.getToken();
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
        }

        if (withBody) {
            headers.set("Content-Type", "application/json");
        }

        return headers;
    }

    function parseNetworkError(error: unknown): AppErrorData {
        return {
            errorCode: "NETWORK_ERROR",
            title: "Network Error",
            detail: error instanceof Error ? error.message : "Network request failed",
            context: undefined,
        };
    }

    async function parseErrorResponse(response: Response): Promise<AppErrorData> {
        let errorData: Partial<AppErrorData> = {};
        if (response.headers.get("content-type")?.includes("application/json")) {
            errorData = await response.json();
        }
        return {
            status: response.status,
            errorCode: errorData.errorCode || "UNEXPECTED_ERROR",
            title: errorData.title || "Unexpected Error",
            detail: errorData.detail || await response.text(),
            context: errorData.context || undefined,
        };
    }

    async function makeRequest<TRequest, TResponse>(props: {
        method: string,
        url: string,
        withBody: boolean,
        requestBody?: TRequest,
        config?: RequestConfig
    }): Promise<TResponse> {

        let serializedRequestBody: string | undefined = undefined;
        if (props.withBody && props.requestBody !== undefined && props.requestBody !== null) {
            serializedRequestBody = JSON.stringify(props.requestBody);
        }

        let response: Response;
        try {
            response = await fetch(
                new URL(props.url, baseUrl),
                {
                    method: props.method,
                    headers: await buildHeaders(props.config, serializedRequestBody !== undefined),
                },
            );
        } catch (networkError) {
            throw new AppError(parseNetworkError(networkError));
        }

        if (response.status === 401) {
            authHandler.handleUnauthorized();
        }

        if (response.ok) {
            if (response.status === 204) {
                return undefined as TResponse;
            }
            return response.json();
        } else {
            throw new AppError(await parseErrorResponse(response));
        }
    }

    return {

        get: async <TResponse = never>(config: RequestConfig): Promise<TResponse> => {
            return makeRequest<never, TResponse>({
                method: "GET",
                url: config.url,
                withBody: false,
                requestBody: undefined as never,
                config: config,
            });
        },

        post: async <TRequest = never, TResponse = never>(config: RequestConfigWithContent<TRequest>): Promise<TResponse> => {
            return makeRequest<TRequest, TResponse>({
                method: "POST",
                url: config.url,
                withBody: true,
                requestBody: config.content,
                config: config,
            });
        },

        put: async <TRequest = never, TResponse = never>(config: RequestConfigWithContent<TRequest>): Promise<TResponse> => {
            return makeRequest<TRequest, TResponse>({
                method: "PUT",
                url: config.url,
                withBody: true,
                requestBody: config.content,
                config: config,
            });
        },

        delete: async <TRequest = never, TResponse = never>(config: RequestConfigWithContent<TRequest>): Promise<TResponse> => {
            return makeRequest<TRequest, TResponse>({
                method: "DELETE",
                url: config.url,
                withBody: true,
                requestBody: config.content,
                config: config,
            });
        },


    };

};