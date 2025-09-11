export namespace GLError {

    export let enabled: boolean = true;

    export function check(gl: WebGL2RenderingContext, operation: string, message?: string): boolean {
        if (!GLError.enabled) {
            return false;
        }
        const error = gl.getError();
        if (error !== WebGL2RenderingContext.NO_ERROR) {
            console.error("webgl-error:", glErrorToString(error), "when calling", operation, " - ", message || "");
            return true;
        } else {
            return false;
        }
    }

    export function checkRemaining(gl: WebGL2RenderingContext) {
        if (!GLError.enabled) {
            return false;
        }
        let error = gl.getError();
        while (error !== gl.NO_ERROR) {
            let strError = "" + error;
            if (error === gl.INVALID_ENUM) strError = "INVALID_ENUM";
            if (error === gl.INVALID_VALUE) strError = "INVALID_VALUE";
            if (error === gl.INVALID_OPERATION) strError = "INVALID_OPERATION";
            if (error === gl.INVALID_FRAMEBUFFER_OPERATION) strError = "INVALID_FRAMEBUFFER_OPERATION";
            if (error === gl.OUT_OF_MEMORY) strError = "OUT_OF_MEMORY";
            if (error === gl.CONTEXT_LOST_WEBGL) strError = "CONTEXT_LOST_WEBGL";
            console.error("Unhandled WebGL error", strError);
            error = gl.getError();
        }
    }

    function glErrorToString(code: GLenum): string {
        switch (code) {
            case WebGL2RenderingContext.NO_ERROR: {
                return "NO_ERROR";
            }
            case WebGL2RenderingContext.INVALID_ENUM: {
                return "INVALID_ENUM";
            }
            case WebGL2RenderingContext.INVALID_VALUE: {
                return "INVALID_VALUE";
            }
            case WebGL2RenderingContext.INVALID_OPERATION: {
                return "INVALID_OPERATION";
            }
            case WebGL2RenderingContext.INVALID_FRAMEBUFFER_OPERATION: {
                return "INVALID_FRAMEBUFFER_OPERATION";
            }
            case WebGL2RenderingContext.OUT_OF_MEMORY: {
                return "OUT_OF_MEMORY";
            }
            case WebGL2RenderingContext.CONTEXT_LOST_WEBGL: {
                return "CONTEXT_LOST_WEBGL";
            }
            default: {
                return "UNKNOWN_ERROR_" + code;
            }
        }
    }

}

if(GLError.enabled) {
    console.warn("webgl error checking is enabled. This may cost performance!")
}