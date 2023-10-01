export namespace GLError {

    export let enabled: boolean = true

    export function check(gl: WebGL2RenderingContext): boolean {
        if(!GLError.enabled) {
            return false;
        }
        const error = gl.getError()
        if(error !== WebGL2RenderingContext.NO_ERROR) {
            console.error("GL_ERROR", glErrorToString(error), "(" + error + ")")
            return true;
        } else {
            return false;
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
                return "UNKNOWN_ERROR(" + code + ")";
            }
        }
    }

}