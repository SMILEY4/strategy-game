import React, {ReactElement} from "react";
import ReactDOM from "react-dom/client";
import {MapDatabaseStorage} from "./shared/db/storage/mapDatabaseStorage";
import {AbstractDatabase} from "./shared/db/database/abstractDatabase";
import {Query} from "./shared/db/query/query";
import {useEntity, useQueryMultiple} from "./shared/db/adapters/databaseHooks";
import {UID} from "./shared/uid";

// ReactDOM.createRoot(document.getElementById("root")!).render(<App/>);
ReactDOM.createRoot(document.getElementById("root")!).render(<TodoApp/>);
// !! Strict-Mode tells react to re-render components twice (calls useEffect 2x) in dev-mode !!
// ==> Problems with canvas/rendering
// ==> https://reactjs.org/docs/strict-mode.html


interface TodoEntity {
    id: string,
    name: string,
    deleted: boolean
}

class TodoStorage extends MapDatabaseStorage<TodoEntity, string> {
    constructor() {
        super(e => e.id);
    }
}

class TodoDatabase extends AbstractDatabase<TodoStorage, TodoEntity, string> {
    constructor() {
        super("todo", new TodoStorage(), e => e.id);
    }
}

interface TodoQuery<ARGS> extends Query<TodoStorage, TodoEntity, string, ARGS> {
}

const QUERY_NOT_DELETED: TodoQuery<void> = {
    run(storage: TodoStorage, args: void): TodoEntity[] {
        return storage.getAll().filter(e => !e.deleted);
    },
};

const db = new TodoDatabase();


function TodoApp(): ReactElement {

    const entities = useQueryMultiple(db, QUERY_NOT_DELETED, undefined).map(e => e.id);

    return (
        <div style={{}}>
            <button onClick={add}>Add</button>
            {entities.map(e => <TodoEntry key={e} id={e} onRemove={remove}/>)}
        </div>
    );

    function remove(id: string) {
        db.update(id, e => ({deleted: true}));
    }

    function add() {
        const id = UID.generate();
        db.insert({
            id: id,
            name: "Todo entry #" + id,
            deleted: false,
        });
    }
}

function TodoEntry(props: { id: string, onRemove: (id: string) => void }): ReactElement {

    const entity = useEntity(db, props.id);

    if (entity) {
        return (
            <div style={{display: "flex", flexDirection: "row"}}>
                <div>{entity.name}</div>
                <button onClick={remove}>X</button>
            </div>
        );
    } else {
        return <div>Entity does not exist</div>;
    }

    function remove() {
        props.onRemove(props.id);
    }

}