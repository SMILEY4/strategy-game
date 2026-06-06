/**
 * WebGL error handling
 */
export class GlError {

    private static enabled: boolean = false;

    /**
     * Enable or disable webgl error checking. Error checking comes at a performance cost.
     * @param enabled whether to enable error checking
     */
    static setEnabled(enabled: boolean): void {
        GlError.enabled = enabled;
        if (enabled) {
            console.warn("WebGL error checking is enabled. This may cost performance!");
        }
    }

    /**
     * Check for webgl errors.
     * @param gl the webgl context
     * @param operation a name of the attempted operation (for logging)
     * @param message a short additional message for logging a possible error
     */
    static check(gl: WebGL2RenderingContext, operation: string, message?: string): boolean {
        if (!GlError.enabled) {
            return false;
        }
        const error = gl.getError();
        if (error !== WebGL2RenderingContext.NO_ERROR) {
            console.error("webgl-error:", GlError.glErrorToString(error), "when calling", operation, " - ", message || "");
            return true;
        } else {
            return false;
        }
    }

    /**
     * Convert a given webgl error code into a readable string.
     * @param code the error code
     * @private
     */
    private static glErrorToString(code: GLenum): string {
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