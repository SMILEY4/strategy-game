declare global {
    interface Array<T> {
        distinct(): T[];
        filterDefined(): NonNullable<T>[],
        associateValue<V>(valueSelector: (key: T) => V): Map<T, V>,
        associateKey<K>(keySelector: (value: T) => K): Map<K, T>
        count(condition: (value: T) => boolean): number
        sum<V>(initial: V, valueSelector: (value: T) => V): V
    }
}

export namespace ArrayExtensions {

    export function setup() {

        Array.prototype.distinct = function () {
            return Array.from(new Set(this).values());
        };

        Array.prototype.filterDefined = function () {
            return this.filter(e => e !== null && e !== undefined);
        };

        Array.prototype.associateValue = function (valueSelector: (key: any) => any) {
            const map = new Map();
            for (let key of this) {
                map.set(key, valueSelector(key));
            }
            return map;
        };

        Array.prototype.associateKey = function (keySelector: (key: any) => any) {
            const map = new Map();
            for (let value of this) {
                map.set(keySelector(value), value);
            }
            return map;
        };

        Array.prototype.count = function (condition: (value: any) => boolean) {
            let count = 0;
            for (let value of this) {
                if(condition(value)) {
                    count++;
                }
            }
            return count;
        };

        Array.prototype.sum = function (initial: any, valueSelector: (value: any) => any) {
            let totalSum = initial
            for(let value of this) {
                totalSum += valueSelector(value)
            }
            return totalSum
        }

    }


}

