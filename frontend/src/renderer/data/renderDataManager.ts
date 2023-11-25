import {RenderData} from "./renderData";
import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {GLProgram} from "../../shared/webgl/glProgram";
import {GLTexture, GLTextureMinFilter} from "../../shared/webgl/glTexture";
import {GLVertexBuffer} from "../../shared/webgl/glVertexBuffer";
import {GLVertexArray} from "../../shared/webgl/glVertexArray";
import SHADER_TILEMAP_VERT from "./../tilemap/shader.vsh?raw";
import SHADER_TILEMAP_FRAG from "./../tilemap/shader.fsh?raw";
import SHADER_ENTITIES_VERT from "./../entity/shader.vsh?raw";
import SHADER_ENTITIES_FRAG from "./../entity/shader.fsh?raw";
import SHADER_ENTITY_MASK_VERT from "./../entitymask/shader.vsh?raw";
import SHADER_ENTITY_MASK_FRAG from "./../entitymask/shader.fsh?raw";
import SHADER_ROUTES_VERT from "./../routes/shader.vsh?raw";
import SHADER_ROUTES_FRAG from "./../routes/shader.fsh?raw";
import {GLAttributeType} from "../../shared/webgl/glTypes";
import {BaseMeshBuilder} from "./builders/tilemap/baseMeshBuilder";
import {GLFramebuffer} from "../../shared/webgl/glFramebuffer";
import {MapMode} from "../../models/mapMode";
import {RenderDataUpdater} from "./renderDataUpdater";
import {Camera} from "../../shared/webgl/camera";


export class RenderDataManager {

    private readonly canvasHandle: CanvasHandle;
    private readonly updater: RenderDataUpdater;

    private renderData: RenderData | null = null;

    constructor(canvasHandle: CanvasHandle, updater: RenderDataUpdater) {
        this.canvasHandle = canvasHandle;
        this.updater = updater;
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
        const programEntityMask = GLProgram.create(gl, SHADER_ENTITY_MASK_VERT, SHADER_ENTITY_MASK_FRAG);
        const programRoutes = GLProgram.create(gl, SHADER_ROUTES_VERT, SHADER_ROUTES_FRAG);

        const tileMesh = BaseMeshBuilder.build();
        const tileMeshBuffer = GLVertexBuffer.create(gl, tileMesh[1]);
        const tileInstanceBaseBuffer = GLVertexBuffer.createEmpty(gl);
        const tileInstanceOverlayBuffer = GLVertexBuffer.createEmpty(gl);
        const entityVertexBuffer = GLVertexBuffer.createEmpty(gl);
        const routesVertexBuffer = GLVertexBuffer.createEmpty(gl);

        this.renderData = {
            meta: {
                grayscale: false,
                time: 0,
                tileSelected: null,
                tileMouseOver: null,
                mapMode: MapMode.DEFAULT,
            },
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
                            location: programTilemap.getInformation().attributes.find(a => a.name === "in_tilePosition")!.location,
                            type: GLAttributeType.INT,
                            amountComponents: 2,
                            divisor: 1,
                        },
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
                        {
                            buffer: tileInstanceBaseBuffer,
                            location: programTilemap.getInformation().attributes.find(a => a.name === "in_coastMask")!.location,
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
                items: [],
                program: programEntities,
                textures: {
                    tileset: GLTexture.createFromPath(gl, "/entities2.png", {filterMin: GLTextureMinFilter.NEAREST}),
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
            entityMask: {
                framebuffer: GLFramebuffer.create(gl, 1, 1),
                program: programEntityMask,
                textures: {
                    mask: GLTexture.createFromPath(gl, "/entities_mask.png", {filterMin: GLTextureMinFilter.NEAREST}),
                },
                vertexArray: GLVertexArray.create(
                    gl,
                    [
                        {
                            buffer: entityVertexBuffer,
                            location: programEntityMask.getInformation().attributes.find(a => a.name === "in_vertexPosition")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            buffer: entityVertexBuffer,
                            location: programEntityMask.getInformation().attributes.find(a => a.name === "in_textureCoordinates")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                    ],
                    undefined,
                ),
            },
            routes: {
                framebuffer: GLFramebuffer.create(gl, 1, 1),
                texture: GLTexture.createFromPath(gl, "/route3.png", {filterMin: GLTextureMinFilter.NEAREST}),
                program: programRoutes,
                vertexCount: 0,
                vertexBuffer: routesVertexBuffer,
                vertexArray: GLVertexArray.create(
                    gl,
                    [
                        {
                            buffer: routesVertexBuffer,
                            location: programRoutes.getInformation().attributes.find(a => a.name === "in_vertexPosition")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            buffer: routesVertexBuffer,
                            location: programRoutes.getInformation().attributes.find(a => a.name === "in_textureCoordinates")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                    ],
                    undefined,
                ),
            },
            stamps: {
                dirty: false,
                items: [],
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
            this.renderData.entities.vertexBuffer.dispose();
            this.renderData.entities.vertexArray.dispose();
            this.renderData.entityMask.program.dispose();
            this.renderData.entityMask.textures.mask.dispose();
            this.renderData.entityMask.framebuffer.dispose();
            this.renderData = null;
        }
    }

    public updateData(camera: Camera) {
        if (this.renderData) {
            this.updater.update(this.renderData, camera);
        }
    }

}