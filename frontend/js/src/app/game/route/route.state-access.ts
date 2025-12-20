import {Db} from "../../database";
import {Route} from "../../../models/route/route";
import {RouteDatabase} from "../../database/routesDatabase";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {WorldObjectSummary} from "../../../models/worldobject/worldObjectSummary";
import {useQueryMultiple} from "../../../common/db/adapters/databaseHooks";

export const RouteStateAccess = {

    getAll(): Route[] {
        return Db.route.queryMany(RouteDatabase.QUERY_ALL, null);
    },

    getRoutesRevId(): string {
        return Db.route.getRevId();
    },

    useConnectedWorldObjects(worldObjectId: WorldObject.Id | null): WorldObjectSummary[] {
        const allRoutes = useQueryMultiple(Db.route, RouteDatabase.QUERY_ALL, null);

        if (worldObjectId === null) {
            return [];
        }

        const relevantRoutes = allRoutes.filter(route => {
            return (route.worldObjectA.visible && route.worldObjectA.value.id === worldObjectId && route.worldObjectB.visible)
                || (route.worldObjectB.visible && route.worldObjectB.value.id === worldObjectId && route.worldObjectA.visible);
        });

        return relevantRoutes.map(route => {
            if (route.worldObjectA.visible && route.worldObjectA.value.id === worldObjectId) {
                return route.worldObjectB.value;
            }
            if (route.worldObjectB.visible && route.worldObjectB.value.id === worldObjectId) {
                return route.worldObjectA.value;
            }
            throw new Error();
        });
    },

};