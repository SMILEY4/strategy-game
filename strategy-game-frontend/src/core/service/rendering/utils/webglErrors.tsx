export function glErrorToString(code: GLenum): string {
	switch (code) {
		case WebGL2RenderingContext.NO_ERROR: {
			return "NO_ERROR"
		}
		case WebGL2RenderingContext.INVALID_ENUM: {
			return "INVALID_ENUM"
		}
		case WebGL2RenderingContext.INVALID_VALUE: {
			return "INVALID_VALUE"
		}
		case WebGL2RenderingContext.INVALID_OPERATION: {
			return "INVALID_OPERATION"
		}
		case WebGL2RenderingContext.INVALID_FRAMEBUFFER_OPERATION: {
			return "INVALID_FRAMEBUFFER_OPERATION"
		}
		case WebGL2RenderingContext.OUT_OF_MEMORY: {
			return "OUT_OF_MEMORY"
		}
		case WebGL2RenderingContext.CONTEXT_LOST_WEBGL: {
			return "CONTEXT_LOST_WEBGL"
		}
		default: {
			return "UNKNOWN_ERROR"
		}
	}
}