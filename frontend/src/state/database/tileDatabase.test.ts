// import {TileDatabase} from "./tileDatabase";
// import {Tile} from "../models/tile";
// import {Visibility} from "../models/visibility";
// import {shuffleArray} from "../shared/utils";
// import {TileContainer} from "../models/tileContainer";
//
// const tiles = buildTiles(300, 300);
// const identifiers = tiles.map(t => t.identifier);
// shuffleArray(identifiers);
//
//
// describe("tile database", () => {
//
//     test("benchmark tile container", () => {
//
//         console.log("TILE CONTAINER")
//
//         console.time("insert");
//         const db = TileContainer.create(tiles, 20);
//         console.timeEnd("insert");
//
//
//         console.time("query by position");
//         for (let i = 0; i < 3; i++) {
//             for (let j = 0, n = identifiers.length; j < n; j++) {
//                 const identifier = identifiers[i];
//                 const x = db.getTileAt(identifier.q, identifier.r)
//             }
//         }
//         console.timeEnd("query by position");
//
//
//         console.time("query by id");
//         for (let i = 0; i < 3; i++) {
//             for (let j = 0, n = identifiers.length; j < n; j++) {
//                 const identifier = identifiers[i];
//                 const x = db.getTile(identifier.id)
//             }
//         }
//         console.timeEnd("query by id");
//
//
//         console.time("query all");
//         for (let i = 0; i < 10_000; i++) {
//             const x = db.getTiles()
//         }
//         console.timeEnd("query all");
//
//     });
//
//
//
//     test("benchmark db", () => {
//
//         console.log("TILE DATABASE")
//
//         const db = new TileDatabase();
//
//         const tiles = buildTiles(300, 300);
//
//         const identifiers = tiles.map(t => t.identifier);
//         shuffleArray(identifiers);
//
//
//         console.time("insert");
//         db.insertMany(tiles);
//         console.timeEnd("insert");
//
//
//         console.time("query by position");
//         for (let i = 0; i < 3; i++) {
//             for (let j = 0, n = identifiers.length; j < n; j++) {
//                 const identifier = identifiers[i];
//                 const x = db.querySingle(TileDatabase.QUERY_BY_POSITION, [identifier.q, identifier.r]);
//             }
//         }
//         console.timeEnd("query by position");
//
//
//         console.time("query by id");
//         for (let i = 0; i < 3; i++) {
//             for (let j = 0, n = identifiers.length; j < n; j++) {
//                 const identifier = identifiers[i];
//                 const x = db.querySingle(TileDatabase.QUERY_BY_ID, identifier.id);
//             }
//         }
//         console.timeEnd("query by id");
//
//
//         console.time("query all");
//         for (let i = 0; i < 10_000; i++) {
//             const x = db.queryMany(TileDatabase.QUERY_ALL, null)
//         }
//         console.timeEnd("query all");
//
//
//         console.time("delete all");
//         db.deleteAll()
//         console.timeEnd("delete all");
//
//
//     });
//
//
// });
//
//
// function buildTiles(width: number, height: number): Tile[] {
//     const tiles: Tile[] = [];
//
//     for (let q = -width / 2; q < width / 2; q++) {
//         for (let r = -height / 2; r < height / 2; r++) {
//             tiles.push({
//                 identifier: {
//                     id: "tile_" + q + "_" + r,
//                     q: q,
//                     r: r,
//                 },
//                 terrainType: null,
//                 resourceType: null,
//                 visibility: Visibility.UNKNOWN,
//                 owner: null,
//                 influences: [],
//                 content: [],
//             });
//         }
//     }
//
//     return tiles;
// }