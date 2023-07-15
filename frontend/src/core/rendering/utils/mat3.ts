// SOURCE:
// https://webglfundamentals.org/webgl/resources/m3.js

export namespace mat3 {

	export function multiply(a: Float32Array, b: Float32Array, dst?: Float32Array): Float32Array {
		dst = dst || new Float32Array(9);
		const a00 = a[0 * 3 + 0];
		const a01 = a[0 * 3 + 1];
		const a02 = a[0 * 3 + 2];
		const a10 = a[1 * 3 + 0];
		const a11 = a[1 * 3 + 1];
		const a12 = a[1 * 3 + 2];
		const a20 = a[2 * 3 + 0];
		const a21 = a[2 * 3 + 1];
		const a22 = a[2 * 3 + 2];
		const b00 = b[0 * 3 + 0];
		const b01 = b[0 * 3 + 1];
		const b02 = b[0 * 3 + 2];
		const b10 = b[1 * 3 + 0];
		const b11 = b[1 * 3 + 1];
		const b12 = b[1 * 3 + 2];
		const b20 = b[2 * 3 + 0];
		const b21 = b[2 * 3 + 1];
		const b22 = b[2 * 3 + 2];

		dst[0] = b00 * a00 + b01 * a10 + b02 * a20;
		dst[1] = b00 * a01 + b01 * a11 + b02 * a21;
		dst[2] = b00 * a02 + b01 * a12 + b02 * a22;
		dst[3] = b10 * a00 + b11 * a10 + b12 * a20;
		dst[4] = b10 * a01 + b11 * a11 + b12 * a21;
		dst[5] = b10 * a02 + b11 * a12 + b12 * a22;
		dst[6] = b20 * a00 + b21 * a10 + b22 * a20;
		dst[7] = b20 * a01 + b21 * a11 + b22 * a21;
		dst[8] = b20 * a02 + b21 * a12 + b22 * a22;

		return dst;
	}

	export function identity(dst?: Float32Array): Float32Array {
		dst = dst || new Float32Array(9);
		dst[0] = 1;
		dst[1] = 0;
		dst[2] = 0;
		dst[3] = 0;
		dst[4] = 1;
		dst[5] = 0;
		dst[6] = 0;
		dst[7] = 0;
		dst[8] = 1;
		return dst;
	}

	export function projection(width: number, height: number, dst?: Float32Array): Float32Array {
		dst = dst || new Float32Array(9);
		dst[0] = 2 / width;
		dst[1] = 0;
		dst[2] = 0;
		dst[3] = 0;
		dst[4] = -2 / height;
		dst[5] = 0;
		dst[6] = -1;
		dst[7] = 1;
		dst[8] = 1;
		return dst;
	}

	export function project(m: Float32Array, width: number, height: number, dst?: Float32Array): Float32Array {
		return multiply(m, projection(width, height), dst);
	}

	export function translation(tx: number, ty: number, dst?: Float32Array): Float32Array {
		dst = dst || new Float32Array(9);
		dst[0] = 1;
		dst[1] = 0;
		dst[2] = 0;
		dst[3] = 0;
		dst[4] = 1;
		dst[5] = 0;
		dst[6] = tx;
		dst[7] = ty;
		dst[8] = 1;
		return dst;
	}

	export function translate(m: Float32Array, tx: number, ty: number, dst?: Float32Array): Float32Array {
		return multiply(m, translation(tx, ty), dst);
	}


	export function rotation(angleInRadians: number, dst?: Float32Array): Float32Array {
		dst = dst || new Float32Array(9);
		const c = Math.cos(angleInRadians);
		const s = Math.sin(angleInRadians);
		dst[0] = c;
		dst[1] = -s;
		dst[2] = 0;
		dst[3] = s;
		dst[4] = c;
		dst[5] = 0;
		dst[6] = 0;
		dst[7] = 0;
		dst[8] = 1;
		return dst;
	}

	export function rotate(m: Float32Array, angleInRadians: number, dst?: Float32Array): Float32Array {
		return multiply(m, rotation(angleInRadians), dst);
	}


	export function scaling(sx: number, sy: number, dst?: Float32Array): Float32Array {
		dst = dst || new Float32Array(9);
		dst[0] = sx;
		dst[1] = 0;
		dst[2] = 0;
		dst[3] = 0;
		dst[4] = sy;
		dst[5] = 0;
		dst[6] = 0;
		dst[7] = 0;
		dst[8] = 1;
		return dst;
	}

	export function scale(m: Float32Array, sx: number, sy: number, dst?: Float32Array): Float32Array {
		return multiply(m, scaling(sx, sy), dst);
	}

	export function dot(x1: number, y1: number, x2: number, y2: number): number {
		return x1 * x2 + y1 * y2;
	}

	export function distance(x1: number, y1: number, x2: number, y2: number): number {
		const dx = x1 - x2;
		const dy = y1 - y2;
		return Math.sqrt(dx * dx + dy * dy);
	}

	export function normalize(x: number, y: number): [number, number] {
		const l = distance(0, 0, x, y);
		if (l > 0.00001) {
			return [x / l, y / l];
		} else {
			return [0, 0];
		}
	}

	export function reflect(ix: number, iy: number, nx: number, ny: number): [number, number] {
		// I - 2.0 * dot(N, I) * N.
		const d = dot(nx, ny, ix, iy);
		return [
			ix - 2 * d * nx,
			iy - 2 * d * ny,
		];
	}

	export function radToDeg(r: number): number {
		return r * 180 / Math.PI;
	}

	export function degToRad(d: number): number {
		return d * Math.PI / 180;
	}

	export function transformPoint(m: Float32Array, v: [number, number]): [number, number] {
		const v0 = v[0];
		const v1 = v[1];
		const d = v0 * m[0 * 3 + 2] + v1 * m[1 * 3 + 2] + m[2 * 3 + 2];
		return [
			(v0 * m[0 * 3 + 0] + v1 * m[1 * 3 + 0] + m[2 * 3 + 0]) / d,
			(v0 * m[0 * 3 + 1] + v1 * m[1 * 3 + 1] + m[2 * 3 + 1]) / d,
		];
	}

	export function inverse(m: Float32Array, dst?: Float32Array): Float32Array {
		dst = dst || new Float32Array(9);

		const m00 = m[0 * 3 + 0];
		const m01 = m[0 * 3 + 1];
		const m02 = m[0 * 3 + 2];
		const m10 = m[1 * 3 + 0];
		const m11 = m[1 * 3 + 1];
		const m12 = m[1 * 3 + 2];
		const m20 = m[2 * 3 + 0];
		const m21 = m[2 * 3 + 1];
		const m22 = m[2 * 3 + 2];

		const b01 =  m22 * m11 - m12 * m21;
		const b11 = -m22 * m10 + m12 * m20;
		const b21 =  m21 * m10 - m11 * m20;

		const det = m00 * b01 + m01 * b11 + m02 * b21;
		const invDet = 1.0 / det;

		dst[0] = b01 * invDet;
		dst[1] = (-m22 * m01 + m02 * m21) * invDet;
		dst[2] = ( m12 * m01 - m02 * m11) * invDet;
		dst[3] = b11 * invDet;
		dst[4] = ( m22 * m00 - m02 * m20) * invDet;
		dst[5] = (-m12 * m00 + m02 * m10) * invDet;
		dst[6] = b21 * invDet;
		dst[7] = (-m21 * m00 + m01 * m20) * invDet;
		dst[8] = ( m11 * m00 - m01 * m10) * invDet;

		return dst;
	}

	export function to3x3Array(m: Float32Array): number[][] {
		return [
			[m[0], m[1], m[2]],
			[m[3], m[4], m[5]],
			[m[6], m[7], m[8]],
		]
	}

}