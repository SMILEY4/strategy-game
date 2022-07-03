import {CommandPlaceMarker} from "../../models/commandPlaceMarker";

export interface TurnAddOrderAction {
    perform: (order: CommandPlaceMarker) => void;
}