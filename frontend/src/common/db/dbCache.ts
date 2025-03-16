import {Database} from "./database/database";

export class DbCache<T> {

	private readonly dataProvider: () => T;
	private readonly dependencies: Database<any, any, any>[];

	private revIds: string[];
	private cacheValid: boolean = false;
	private cache: T = undefined as T;


	constructor(props: {
		dataProvider: () => T,
		dependencies: Database<any, any, any>[]
	}) {
		this.dataProvider = props.dataProvider;
		this.dependencies = props.dependencies;
		this.revIds = this.createRevIds();
	}


	public get(): T {
		const currentRevIds = this.createRevIds();
		if (!this.cacheValid || !this.revIdsEquals(this.revIds, currentRevIds)) {
			this.revIds = currentRevIds;
			this.cache = this.dataProvider();
		}
		return this.cache;
	}

	private createRevIds(): string[] {
		return this.dependencies.map(db => db.getRevId());
	}

	private revIdsEquals(a: string[], b: string[]): boolean {
		if (a.length !== b.length) {
			return false; // this should never happen !!!
		}
		for (let i = 0; i < a.length; i++) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}

}