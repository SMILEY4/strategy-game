import {Db} from "../../database";
import {Route} from "../../../models/route/route";
import {RouteDatabase} from "../../database/routesDatabase";

export const RouteStateAccess = {

    getAll(): Route[] {
        return Db.route.queryMany(RouteDatabase.QUERY_ALL, null);
    },

    getRoutesRevId(): string {
        return Db.route.getRevId();
    },

};