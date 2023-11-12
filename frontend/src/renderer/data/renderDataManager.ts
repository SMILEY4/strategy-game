import {RenderData} from "./renderData";
import {CanvasHandle} from "../../logic/game/canvasHandle";
import {GLProgram} from "../../shared/webgl/glProgram";
import {GLTexture, GLTextureMinFilter} from "../../shared/webgl/glTexture";
import {GLVertexBuffer} from "../../shared/webgl/glVertexBuffer";
import {GLVertexArray} from "../../shared/webgl/glVertexArray";
import SHADER_TILEMAP_VERT from "./../tilemap/shader.vsh?raw";
import SHADER_TILEMAP_FRAG from "./../tilemap/shader.fsh?raw";
import SHADER_ENTITIES_VERT from "./../entity/shader.vsh?raw";
import SHADER_ENTITIES_FRAG from "./../entity/shader.fsh?raw";
import {GLAttributeType} from "../../shared/webgl/glTypes";
import {BaseMeshBuilder} from "../tilemap/meshbuilders/baseMeshBuilder";
import {InstanceBaseDataBuilder} from "../tilemap/meshbuilders/instanceBaseDataBuilder";
import {InstanceOverlayDataBuilder} from "../tilemap/meshbuilders/instanceOverlayDataBuilder";
import {TileRepository} from "../../state/access/TileRepository";
import {RenderEntityCollector} from "../entity/meshbuilder/renderEntityCollector";
import {EntityMeshBuilder} from "../entity/meshbuilder/entityMeshBuilder";


export class RenderDataManager {

    private readonly canvasHandle: CanvasHandle;
    private readonly tileRepository: TileRepository;
    private readonly entityCollector: RenderEntityCollector;

    private renderData: RenderData | null = null;

    constructor(canvasHandle: CanvasHandle, tileRepository: TileRepository, entityCollector: RenderEntityCollector) {
        this.canvasHandle = canvasHandle;
        this.tileRepository = tileRepository;
        this.entityCollector = entityCollector;
    }

    public getData(): RenderData {
        if (this.renderData) {
            return this.renderData;
        } else {
            throw new Error("Render data is null");
        }
    }

    public initialize() {
        const gl = this.canvasHandle.getGL();

        const programTilemap = GLProgram.create(gl, SHADER_TILEMAP_VERT, SHADER_TILEMAP_FRAG);
        const programEntities = GLProgram.create(gl, SHADER_ENTITIES_VERT, SHADER_ENTITIES_FRAG);

        const tileMesh = BaseMeshBuilder.build();
        const tileMeshBuffer = GLVertexBuffer.create(gl, tileMesh[1]);
        const tileInstanceBaseBuffer = GLVertexBuffer.createEmpty(gl);
        const tileInstanceOverlayBuffer = GLVertexBuffer.createEmpty(gl);
        const entityVertexBuffer = GLVertexBuffer.createEmpty(gl);

        this.renderData = {
            tilemap: {
                program: programTilemap,
                textures: {
                    tileset: GLTexture.createFromPath(gl, "/tiles.png", {filterMin: GLTextureMinFilter.NEAREST}),
                    texturePaper: GLTexture.createFromPath(gl, "/textures/plain_white_paper_blendable.jpg"),
                    textureClouds: GLTexture.createFromPath(gl, "/textures/noise.png"),
                },
                mesh: {
                    vertexCount: tileMesh[0],
                    vertexBuffer: tileMeshBuffer,
                },
                instances: {
                    instanceCount: 0,
                    instanceBaseBuffer: tileInstanceBaseBuffer,
                    instanceOverlayBuffer: tileInstanceOverlayBuffer,
                },
                vertexArray: GLVertexArray.create(
                    gl,
                    [
                        //==== tile mesh ====//
                        {
                            buffer: tileMeshBuffer,
                            location: programTilemap.getInformation().attributes.find(a => a.name === "in_vertexPosition")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            buffer: tileMeshBuffer,
                            location: programTilemap.getInformation().attributes.find(a => a.name === "in_textureCoordinates")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            buffer: tileMeshBuffer,
                            location: programTilemap.getInformation().attributes.find(a => a.name === "in_cornerData")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 3,
                        },
                        {
                            buffer: tileMeshBuffer,
                            location: programTilemap.getInformation().attributes.find(a => a.name === "in_edgeDirection")!.location,
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                        },
                        //==== instance base data ====//
                        {
                            buffer: tileInstanceBaseBuffer,
                            location: programTilemap.getInformation().attributes.find(a => a.name === "in_worldPosition")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                            divisor: 1,
                        },
                        {
                            buffer: tileInstanceBaseBuffer,
                            location: programTilemap.getInformation().attributes.find(a => a.name === "in_tilesetIndex")!.location,
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                            divisor: 1,
                        },
                        {
                            buffer: tileInstanceBaseBuffer,
                            location: programTilemap.getInformation().attributes.find(a => a.name === "in_visibility")!.location,
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                            divisor: 1,
                        },
                        //==== instance overlay data ====//
                        {
                            buffer: tileInstanceOverlayBuffer,
                            location: programTilemap.getInformation().attributes.find(a => a.name === "in_borderMask")!.location,
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                            divisor: 1,
                        },
                        {
                            buffer: tileInstanceOverlayBuffer,
                            location: programTilemap.getInformation().attributes.find(a => a.name === "in_borderColor")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 3,
                            divisor: 1,
                        },
                        {
                            buffer: tileInstanceOverlayBuffer,
                            location: programTilemap.getInformation().attributes.find(a => a.name === "in_fillColor")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 3,
                            divisor: 1,
                        },
                    ],
                    undefined,
                ),
            },
            entities: {
                program: programEntities,
                textures: {
                    tileset: GLTexture.createFromPath(gl, "/entities.png", {filterMin: GLTextureMinFilter.NEAREST}), // todo
                    mask: GLTexture.createFromPath(gl, "/entities.png", {filterMin: GLTextureMinFilter.NEAREST}), // todo
                },
                vertexCount: 0,
                vertexBuffer: entityVertexBuffer,
                vertexArray: GLVertexArray.create(
                    gl,
                    [
                        {
                            buffer: entityVertexBuffer,
                            location: programEntities.getInformation().attributes.find(a => a.name === "in_vertexPosition")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            buffer: entityVertexBuffer,
                            location: programEntities.getInformation().attributes.find(a => a.name === "in_textureCoordinates")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                    ],
                    undefined,
                ),
            },
        };
    }

    public disposeData() {
        if (this.renderData) {
            this.renderData.tilemap.program.dispose();
            this.renderData.tilemap.textures.tileset.dispose();
            this.renderData.tilemap.textures.texturePaper.dispose();
            this.renderData.tilemap.textures.textureClouds.dispose();
            this.renderData.tilemap.mesh.vertexBuffer.dispose();
            this.renderData.tilemap.instances.instanceBaseBuffer.dispose();
            this.renderData.tilemap.instances.instanceOverlayBuffer.dispose();
            this.renderData.tilemap.vertexArray.dispose();
            this.renderData.entities.program.dispose();
            this.renderData.entities.textures.tileset.dispose();
            this.renderData.entities.textures.mask.dispose();
            this.renderData.entities.vertexBuffer.dispose();
            this.renderData.entities.vertexArray.dispose();
            this.renderData = null;
        }
    }

    public updateData() {
        this.updateEntities();
        this.updateTilemapInstances();
    }

    private updateTilemapInstances() {
        if (this.renderData) {
            const [count, baseDataArray] = InstanceBaseDataBuilder.build(this.tileRepository.getTileContainer());
            const [_, overlayDataArray] = InstanceOverlayDataBuilder.build(this.tileRepository.getTileContainer());
            this.renderData.tilemap.instances.instanceCount = count;
            this.renderData.tilemap.instances.instanceBaseBuffer.setData(baseDataArray, true);
            this.renderData.tilemap.instances.instanceOverlayBuffer.setData(overlayDataArray, true);
        }
    }

    private updateEntities() {
        if (this.renderData) {
            const entities = this.entityCollector.collect();
            const [count, vertices] = EntityMeshBuilder.build(entities);
            this.renderData.entities.vertexCount = count;
            this.renderData.entities.vertexBuffer.setData(vertices, true);
        }
    }

}