export interface AppErrorData {
    /**
     * A machine-readable (enum-like) code for the general error type.
     */
    errorCode: string,
    /**
     * An associated http status code (if available).
     */
    status?: number;
    /**
     * A short, human-readable title for the general error type.
     */
    title: string,
    /**
     * A human-readable description of the specific error.
     */
    detail: string,
    /**
     * Additional machine-readable key-value pairs relevant for the specific error.
     */
    context?: Record<string, string>
}


export class AppError extends Error implements AppErrorData {
    public readonly status: number | undefined;
    public readonly errorCode: string;
    public readonly title: string;
    public readonly detail: string;
    public readonly context?: Record<string, string>;

    constructor(error: AppErrorData) {
        super(error.title || `Error ${error.status}` + (error.detail ? (": " + error.detail) : ""));
        this.status = error.status;
        this.errorCode = error.errorCode;
        this.title = error.title;
        this.detail = error.detail;
        this.context = error.context;
    }

}