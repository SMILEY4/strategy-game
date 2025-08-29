export interface TransactionObject {
    /**
     * Start a new "transaction", during which no subscribers will be notified. All changes are collected and passed on to subscribers at the end.
     */
    startTransaction(): void;

    /**
     * End a "transaction" and notify subscribers of all collected changes
     */
    endTransaction(): void;
}

export namespace Transaction {

    export function run(participants: TransactionObject[], action: () => void) {
        try {
            Transaction.start(participants);
            action();
        } finally {
            Transaction.end(participants);
        }
    }

    export function start(participants: TransactionObject[]) {
        for (let participant of participants) {
            participant.startTransaction();
        }
    }

    export function end(participants: TransactionObject[]) {
        for (let participant of participants) {
            participant.endTransaction();
        }
    }

}
