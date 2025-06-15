import {MapPrimaryStorage} from "./storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "./database/abstractDatabase";
import {DatabaseStorage, DatabaseStorageConfig} from "./storage/databaseStorage";
import {ArraySupportingStorage} from "./storage/supporting/arraySupportingStorage";
import {Query} from "./query/query";
import {MapSupportingStorage} from "./storage/supporting/mapSupportingStorage";
import {shuffleArray} from "../utils";
import {Random} from "../random";
import chooseRandom = Random.chooseRandom;
import {SetState} from "../zustandUtils";
import create from "zustand";

interface TestEntity {
	id: string,
	size: number,
	nested: {
		value: string
	}
}


describe("database performance", () => {

	describe("scenario 1", () => {

		const amountEntities = 10_000;
		const amountQueryAll = 10_000;
		const amountQueryById = 10_000;
		const amountQueryBySIze = 10_000;

		const entitiesToInsert = buildEntities(amountEntities);

		const idsToQuery = chooseNRandom(amountQueryById, entitiesToInsert).map(it => it.id);
		const sizesToQuery = chooseNRandom(amountQueryBySIze, entitiesToInsert).map(it => it.size);

		test("custom db", () => {
			let checksum = 0;
			const ctx = new TestContext();

			// CREATE DB
			const db = new TestDatabase();

			// INSERT
			ctx.insertStart();
			db.insertMany(entitiesToInsert);
			ctx.insertEnd();

			// QUERY ALL
			ctx.queryAllStart();
			for (let i = 0; i < amountQueryAll; i++) {
				const result = db.queryMany(QUERY_ALL, null);
				checksum += result.length;
			}
			ctx.queryAllEnd();

			// QUERY BY ID
			ctx.queryByIdStart();
			for (let i = 0; i < amountQueryById; i++) {
				const result = db.querySingleOrThrow(QUERY_BY_ID, idsToQuery[i]);
				checksum += result.size;
			}
			ctx.queryByIdEnd();

			// QUERY BY SIZE
			ctx.queryBySizeStart();
			for (let i = 0; i < amountQueryById; i++) {
				const result = db.queryMany(QUERY_BY_SIZE, sizesToQuery[i]);
				checksum += result.length;
			}
			ctx.queryBySizeEnd();

			console.log("CHECKSUM", checksum)
			console.log(JSON.stringify(ctx.report(), null, "   "))
		});


		test("zustand", () => {
			let checksum = 0;
			const ctx = new TestContext();

			// CREATE STATE
			// INSERT
			ctx.insertStart();
			useTestState.getState().setState(entitiesToInsert)
			ctx.insertEnd()

			// QUERY ALL
			ctx.queryAllStart();
			for (let i = 0; i < amountQueryAll; i++) {
				const result = useTestState.getState().entities;
				checksum += result.length;
			}
			ctx.queryAllEnd();

			// QUERY BY ID
			ctx.queryByIdStart();
			for (let i = 0; i < amountQueryById; i++) {
				const id = idsToQuery[i];
				const result = useTestState.getState().entities.find(it => it.id === id)!!;
				checksum += result.size;
			}
			ctx.queryByIdEnd();

			// QUERY BY SIZE
			ctx.queryBySizeStart();
			for (let i = 0; i < amountQueryById; i++) {
				const size = sizesToQuery[i];
				const result = useTestState.getState().entities.filter(it => it.size == size)
				checksum += result.length;
			}
			ctx.queryBySizeEnd();

			console.log("CHECKSUM", checksum)
			console.log(JSON.stringify(ctx.report(), null, "   "))
		});

	});


});

// ======  DATABASE ========================

function provideId(e: TestEntity): string {
	return e.id;
}

function provideSize(e: TestEntity): number {
	return e.size;
}

interface TestStorageConfig extends DatabaseStorageConfig<TestEntity, string> {
	primary: MapPrimaryStorage<TestEntity, string>,
	supporting: {
		array: ArraySupportingStorage<TestEntity>,
		bySize: MapSupportingStorage<TestEntity, number>,
	}
}

class TestStorage extends DatabaseStorage<TestStorageConfig, TestEntity, string> {
	constructor() {
		super({
			primary: new MapPrimaryStorage<TestEntity, string>(provideId),
			supporting: {
				array: new ArraySupportingStorage<TestEntity>(),
				bySize: new MapSupportingStorage<TestEntity, number>(provideSize),
			},
		});
	}
}

class TestDatabase extends AbstractDatabase<TestStorage, TestEntity, string> {
	constructor() {
		super(new TestStorage(), provideId);
	}
}

interface TestQuery<ARGS> extends Query<TestStorage, TestEntity, string, ARGS> {
}

const QUERY_BY_ID: TestQuery<string> = {
	run(storage: TestStorage, args: string): TestEntity | null {
		return storage.config.primary.get(args);
	},
};

const QUERY_ALL: TestQuery<void> = {
	run(storage: TestStorage, args: void): TestEntity[] {
		return storage.config.supporting.array.getAll();
	},
};

const QUERY_BY_SIZE: TestQuery<number> = {
	run(storage: TestStorage, args: number): TestEntity[] {
		return storage.config.supporting.bySize.getByKey(args);
	},
};

// ======  ZUSTAND ========================

interface TestStateValues {
	entities: TestEntity[],
}

const initialTestStateValues: TestStateValues = {
	entities: []
}

interface TestStateActions {
	setState: (entities: TestEntity[]) => void
}

function testStateActions(set: SetState<TestState>): TestStateActions {
	return {
		setState: (newEntities: TestEntity[]) => set(() => ({
			entities: newEntities,
		}))
	}
}

export interface TestState extends TestStateValues, TestStateActions {
}

export const useTestState = create<TestState>((set: SetState<TestState>) => ({
	...initialTestStateValues,
	...testStateActions(set)
}));


// ======  UTILS ========================

function buildEntities(n: number): TestEntity[] {
	const entities: TestEntity[] = [];
	for (let i = 0; i < n; i++) {
		entities.push({
			id: "entity-" + i,
			size: i % 20,
			nested: {
				value: "value-" + i,
			},
		});
	}
	shuffleArray(entities);
	return entities;
}

function chooseNRandom(n: number, entities: TestEntity[]): TestEntity[] {
	const taken: TestEntity[] = [];
	for (let i = 0; i < n; i++) {
		taken.push(chooseRandom(entities)!!);
	}
	return taken;
}


class TestContext {

	private timestampInsertStart = 0;
	private timestampInsertEnd = 0;

	private timestampQueryAllStart = 0;
	private timestampQueryAllEnd = 0;

	private timestampQueryByIdStart = 0;
	private timestampQueryByIdEnd = 0;

	private timestampQueryBySizeStart = 0;
	private timestampQueryBySizeEnd = 0;

	public insertStart() {
		this.timestampInsertStart = Date.now();
	}

	public insertEnd() {
		this.timestampInsertEnd = Date.now();
	}

	public queryAllStart() {
		this.timestampQueryAllStart = Date.now();
	}

	public queryAllEnd() {
		this.timestampQueryAllEnd = Date.now();
	}

	public queryByIdStart() {
		this.timestampQueryByIdStart = Date.now();
	}

	public queryByIdEnd() {
		this.timestampQueryByIdEnd = Date.now();
	}

	public queryBySizeStart() {
		this.timestampQueryBySizeStart = Date.now();
	}

	public queryBySizeEnd() {
		this.timestampQueryBySizeEnd = Date.now();
	}

	public report(): any {
		return {
			insert: "" + (this.timestampInsertEnd - this.timestampInsertStart) + "ms",
			queryAll: "" + (this.timestampQueryAllEnd - this.timestampQueryAllStart) + "ms",
			queryById: "" + (this.timestampQueryByIdEnd - this.timestampQueryByIdStart) + "ms",
			queryBySize: "" + (this.timestampQueryBySizeEnd - this.timestampQueryBySizeStart) + "ms",
		};
	}

}