export class ChangeDetector {

    private lastValue: any = undefined;

    public check(value: any): boolean {
        if (this.lastValue === value) {
            return false;
        } else {
            this.lastValue = value;
            return true;
        }
    }

}