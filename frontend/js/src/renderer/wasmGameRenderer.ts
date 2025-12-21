import {TextureAtlasEntry} from "../common/webgl/textureAtlas";
import {MapMode} from "../models/misc/mapMode";
import {TileSummary} from "../models/tile/tileSummary";
import {Rectangle} from "../common/utils";
import {WorldObject, WorldObjectWithCommand} from "../models/worldobject/worldObject";
import {Tile} from "../models/tile/tile";
import {Route} from "../models/route/route";

export interface WasmGameRenderer {
	/**
	 * Initialize the wasm renderer
	 */
	init(): void;
	/**
	 * Dispose the wasm renderer
	 */
	dispose(): void;

	/**
	 * Load the texture atlas data
	 */
	setTextureAtlasEntries(entries: Map<string, TextureAtlasEntry[]>): void;
	/**
	 * Set the active map mode
	 */
	setMapMode(mapMode: MapMode): void;
	/**
	 * Set the currently highlighted tiles
	 */
    setHighlightedTiles(tiles: Tile.Highlight[]): void;
	/**
	 * Set the bounds of the currently relevant world area
	 */
	setRelevantWorldArea(relevantArea: Rectangle): void;
	/**
	 * Set the world objects
	 */
	setWorldObjects(worldObjects: WorldObjectWithCommand[]): void;
	/**
	 * Sets the routes
	 */
	setRoutes(routes: Route[]): void;
	/**
	 * Set the tiles
	 */
	setTiles(tiles: Tile[]): void;
	/**
	 * Update/Re-Calculate terrain tile vertices
	 */
	updateTerrainTileVertices(): void;
	/**
	 * Update/Re-Calculate overlay vertices
	 */
	updateOverlayTileVertices(): void;
	/**
	 * Update/Re-Calculate map detail vertices
	 */
	updateDetailVertices(): void;
	/**
	 * Request the water tile vertices
	 * @return the buffer and vertex count
	 */
	getVerticesWater(): [Uint8Array, number];
	/**
	 * Request the land tile vertices
	 * @return the buffer and vertex count
	 */
	getVerticesLand(): [Uint8Array, number];
	/**
	 * Request the fog tile vertices
	 * @return the buffer and vertex count
	 */
	getVerticesFog(): [Uint8Array, number];
	/**
	 * Request the overlay vertices
	 * @return the buffer and vertex count
	 */
	getVerticesOverlay(): [Uint8Array, number];
	/**
	 * Request the map detail vertices
	 * @return the buffer and vertex count
	 */
	getVerticesDetails(): [Uint8Array, number];
}