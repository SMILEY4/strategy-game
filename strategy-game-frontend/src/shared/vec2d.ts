export class Vec2d {

    static fromXY(x: number, y: number): Vec2d {
        return new Vec2d(x, y);
    }

    static fromArray(position: number[]): Vec2d {
        if (position.length !== 2) {
            throw Error("Unexpected amount of values for 2d-vector");
        } else {
            return new Vec2d(position[0], position[1]);
        }
    }

    static fromVec(vec: Vec2d): Vec2d {
        return new Vec2d(vec.x, vec.y);
    }

    static fromTo(x0: number, y0: number, x1: number, y1: number) {
        return new Vec2d(
            x1 - x0,
            y1 - y0
        );
    }

    static fromToArray(p1: number[], p2: number[]) {
        return new Vec2d(
            p2[0] - p1[0],
            p2[1] - p1[1]
        );
    }

    x: number;
    y: number;

    private constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    length(): number {
        return Math.sqrt(this.length2());
    }

    length2(): number {
        return this.x * this.x + this.y * this.y;
    }

    dot(other: Vec2d): number {
        return this.x * other.x + this.y * other.y
    }

    distance2(other: Vec2d): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return dx * dx + dy * dy;
    }

    distance(other: Vec2d): number {
        return Math.sqrt(this.distance2(other))
    }

    normalize(): Vec2d {
        const length = this.length();
        this.x = this.x / length;
        this.y = this.y / length;
        return this;
    }

    setLength(targetLength: number): Vec2d {
        this.normalize();
        this.scale(targetLength);
        return this;
    }

    scale(scalar: number): Vec2d {
        this.x = this.x * scalar;
        this.y = this.y * scalar;
        return this;
    }

    mul(other: Vec2d): Vec2d {
        this.x = this.x * other.x;
        this.y = this.y * other.y;
        return this;
    }

    add(other: Vec2d): Vec2d {
        return this.addXY(other.x, other.y)
    }

    addXY(x: number, y: number): Vec2d {
        this.x = this.x + x;
        this.y = this.y + y;
        return this;
    }

    addArr(point: number[]): Vec2d {
        if(point.length !== 2) {
            throw Error("Unexpected amount of elements int array to add.")
        }
        this.x = this.x + point[0];
        this.y = this.y + point[0];
        return this;
    }

    sub(other: Vec2d): Vec2d {
        this.x = this.x - other.x;
        this.y = this.y - other.y;
        return this;
    }

    rotate90DegClockwise( ): Vec2d {
        const a = this.x
        const b = this.y;
        this.x = b;
        this.y = -a
        return this;
    }

    rotate90DegCounterClockwise( ): Vec2d {
        const a = this.x
        const b = this.y;
        this.x = -b;
        this.y = a
        return this;
    }

    toArray(): number[] {
        return [this.x, this.y]
    }

    copy(): Vec2d {
        return Vec2d.fromVec(this);
    }

}