export type HttpErrorResponseBody<TErrorCode extends string = string> = {
    status: number;
    errorCode: TErrorCode;
    title: string,
    detail: string,
    context?: Record<string, any>
}

export class DetailedError<TErrorCode extends string = string> extends Error {

    public readonly status: number;
    public readonly errorCode: TErrorCode;
    public readonly title: string;
    public readonly detail: string;
    public readonly context?: Record<string, any>;

    constructor(data: {
        status: number;
        errorCode: TErrorCode;
        title: string;
        detail: string;
        context?: Record<string, string>;
    }) {
        super(`${data.title}: ${data.detail}`);
        this.status = data.status;
        this.errorCode = data.errorCode;
        this.title = data.title;
        this.detail = data.detail;
        this.context = data.context;
    }
}

export function isDetailedError(err: unknown): err is DetailedError {
    return err instanceof DetailedError;
}