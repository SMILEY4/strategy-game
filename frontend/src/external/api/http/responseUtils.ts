import {ResponseError} from "../models/responseError";

export namespace ResponseUtils {

    export async function handleErrorResponses(response: Response, errorCallback: (error: ResponseError) => Error): Promise<Response> {
        if (isSuccessful(response)) {
            return response;
        } else {
            throw await getError(response).then(errorCallback);
        }
    }

    export function isSuccessful(response: Response): boolean {
        return 200 <= response.status && response.status < 300;
    }

    export function getError(response: Response): Promise<ResponseError> {
        return parseErrorResponse(response)
            .then(error => {
                if (response.status == 401 && error.successful === undefined && error.status === undefined) {
                    return ({
                        successful: false,
                        status: "Unauthorized",
                        content: undefined,
                    });
                }
                if (response.status == 404 && error.successful === undefined && error.status === undefined) {
                    return ({
                        successful: false,
                        status: "UnexpectedNotFound",
                        content: undefined,
                    });
                }
                return error;
            });
    }

    export function parseErrorResponse(response: Response): Promise<any> {
        return response.text()
            .then(c => JSON.parse(c))
            .catch(() => ({
                successful: false,
                status: "Error",
                content: undefined,
            }));
    }


}