import {RouteDatabase} from "../database/routeDatabase";
import {Route} from "../../models/base/route";

export class RouteRepository {

	private readonly routeDb: RouteDatabase;

	constructor(
		routeDb: RouteDatabase,
	) {
		this.routeDb = routeDb;
	}

	public getAll(): Route[] {
		return this.routeDb.queryMany(RouteDatabase.QUERY_ALL, null);
	}

}

export namespace RouteRepository {
}