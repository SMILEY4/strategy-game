import {RenderData} from "./renderData";
import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {GLProgram} from "../../shared/webgl/glProgram";
import SHADER_GROUND_VERT from "../ground/shader.vsh?raw";
import SHADER_GROUND_FRAG from "../ground/shader.fsh?raw";
import SHADER_WATER_VERT from "../water/shader.vsh?raw";
import SHADER_WATER_FRAG from "../water/shader.fsh?raw";
import SHADER_DETAIL_VERT from "../detail/shader.vsh?raw";
import SHADER_DETAIL_FRAG from "../detail/shader.fsh?raw";
import SHADER_OVERLAY_VERT from "../overlay/shader.vsh?raw";
import SHADER_OVERLAY_FRAG from "../overlay/shader.fsh?raw";
import {MapMode} from "../../models/mapMode";
import {RenderDataUpdater} from "./renderDataUpdater";
import {Camera} from "../../shared/webgl/camera";
import {GroundBaseMeshBuilder} from "./builders/ground/groundBaseMeshBuilder";
import {GLTexture, GLTextureMinFilter} from "../../shared/webgl/glTexture";
import {GLVertexBuffer} from "../../shared/webgl/glVertexBuffer";
import {GLVertexArray} from "../../shared/webgl/glVertexArray";
import {GLAttributeType} from "../../shared/webgl/glTypes";
import {WaterBaseMeshBuilder} from "./builders/water/waterBaseMeshBuilder";
import {OverlayBaseMeshBuilder} from "./builders/overlay/overlayBaseMeshBuilder";
import {GLFramebuffer} from "../../shared/webgl/glFramebuffer";


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

        const groundProgram = GLProgram.create(gl, SHADER_GROUND_VERT, SHADER_GROUND_FRAG);
        const groundMesh = GroundBaseMeshBuilder.build();
        const groundMeshBuffer = GLVertexBuffer.create(gl, groundMesh[1]);
        const groundInstancesBuffer = GLVertexBuffer.createEmpty(gl);

        const waterProgram = GLProgram.create(gl, SHADER_WATER_VERT, SHADER_WATER_FRAG);
        const waterMesh = WaterBaseMeshBuilder.build();
        const waterMeshBuffer = GLVertexBuffer.create(gl, waterMesh[1]);
        const waterInstancesBuffer = GLVertexBuffer.createEmpty(gl);

        const detailProgram = GLProgram.create(gl, SHADER_DETAIL_VERT, SHADER_DETAIL_FRAG);
        const detailVertexBuffer = GLVertexBuffer.createEmpty(gl);

        const overlayProgram = GLProgram.create(gl, SHADER_OVERLAY_VERT, SHADER_OVERLAY_FRAG);
        const overlayMesh = OverlayBaseMeshBuilder.build();
        const overlayMeshBuffer = GLVertexBuffer.create(gl, overlayMesh[1]);
        const overlayInstancesBuffer = GLVertexBuffer.createEmpty(gl);

        this.renderData = {
            meta: {
                grayscale: false,
                time: 0,
                tileSelected: null,
                tileMouseOver: null,
                mapMode: MapMode.DEFAULT,
            },
            world: {
                framebuffer: GLFramebuffer.create(gl, 1, 1, false),
            },
            ground: {
                program: groundProgram,
                textures: {
                    tileset: GLTexture.createFromPath(gl, "/groundSplotches.png", {filterMin: GLTextureMinFilter.NEAREST}),
                },
                mesh: {
                    vertexCount: groundMesh[0],
                    vertexBuffer: groundMeshBuffer,
                },
                instances: {
                    instanceCount: 0,
                    instanceBuffer: groundInstancesBuffer,
                },
                vertexArray: GLVertexArray.create(
                    gl,
                    [
                        //==== tile mesh ====//
                        {
                            buffer: groundMeshBuffer,
                            location: groundProgram.getInformation().attributes.find(a => a.name === "in_vertexPosition")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            buffer: groundMeshBuffer,
                            location: groundProgram.getInformation().attributes.find(a => a.name === "in_textureCoordinates")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        //==== instance data ====//
                        {
                            buffer: groundInstancesBuffer,
                            location: groundProgram.getInformation().attributes.find(a => a.name === "in_worldPosition")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                            divisor: 1,
                        },
                        {
                            buffer: groundInstancesBuffer,
                            location: groundProgram.getInformation().attributes.find(a => a.name === "in_color")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 4,
                            divisor: 1,
                        },
                        {
                            buffer: groundInstancesBuffer,
                            location: groundProgram.getInformation().attributes.find(a => a.name === "in_visibility")!.location,
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                            divisor: 1,
                        },
                    ],
                    undefined,
                ),
            },
            water: {
                program: waterProgram,
                textures: {
                    noise: GLTexture.createFromPath(gl, "/textures/noise_contrast.png"),
                },
                mesh: {
                    vertexCount: waterMesh[0],
                    vertexBuffer: waterMeshBuffer,
                },
                instances: {
                    instanceCount: 0,
                    instanceBuffer: waterInstancesBuffer,
                },
                vertexArray: GLVertexArray.create(
                    gl,
                    [
                        //==== tile mesh ====//
                        {
                            buffer: waterMeshBuffer,
                            location: waterProgram.getInformation().attributes.find(a => a.name === "in_vertexPosition")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            buffer: waterMeshBuffer,
                            location: waterProgram.getInformation().attributes.find(a => a.name === "in_cornerData")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 3,
                        },
                        {
                            buffer: waterMeshBuffer,
                            location: waterProgram.getInformation().attributes.find(a => a.name === "in_edgeDirection")!.location,
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                        },
                        //==== instance data ====//
                        {
                            buffer: waterInstancesBuffer,
                            location: waterProgram.getInformation().attributes.find(a => a.name === "in_worldPosition")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                            divisor: 1,
                        },
                        {
                            buffer: waterInstancesBuffer,
                            location: waterProgram.getInformation().attributes.find(a => a.name === "in_borderMask")!.location,
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                            divisor: 1,
                        },
                        {
                            buffer: waterInstancesBuffer,
                            location: waterProgram.getInformation().attributes.find(a => a.name === "in_visibility")!.location,
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                            divisor: 1,
                        },
                    ],
                    undefined,
                ),
            },
            details: {
                program: detailProgram,
                textures: {
                    tileset: GLTexture.createFromPath(gl, "/tilesetNew.png"),
                },
                vertexCount: 0,
                vertexBuffer: detailVertexBuffer,
                vertexArray: GLVertexArray.create(
                    gl,
                    [
                        {
                            buffer: detailVertexBuffer,
                            location: detailProgram.getInformation().attributes.find(a => a.name === "in_worldPosition")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            buffer: detailVertexBuffer,
                            location: detailProgram.getInformation().attributes.find(a => a.name === "in_textureCoordinates")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            buffer: detailVertexBuffer,
                            location: detailProgram.getInformation().attributes.find(a => a.name === "in_visibility")!.location,
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                        },
                    ],
                ),
            },
            overlay: {
                program: overlayProgram,
                textures: {
                    paper: GLTexture.createFromPath(gl, "/textures/plain_white_paper_prepared_contrast.jpg"),
                    noise: GLTexture.createFromPath(gl, "/textures/noise_contrast.png"),
                    noisePainted: GLTexture.createFromPath(gl, "/textures/noise_watercolor.png"),
                },
                mesh: {
                    vertexCount: overlayMesh[0],
                    vertexBuffer: overlayMeshBuffer,
                },
                instances: {
                    instanceCount: 0,
                    instanceBuffer: overlayInstancesBuffer,
                },
                vertexArray: GLVertexArray.create(
                    gl,
                    [
                        //==== tile mesh ====//
                        {
                            buffer: overlayMeshBuffer,
                            location: overlayProgram.getInformation().attributes.find(a => a.name === "in_vertexPosition")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            buffer: overlayMeshBuffer,
                            location: overlayProgram.getInformation().attributes.find(a => a.name === "in_cornerData")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 3,
                        },
                        {
                            buffer: overlayMeshBuffer,
                            location: overlayProgram.getInformation().attributes.find(a => a.name === "in_directionData")!.location,
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                        },
                        //==== instance data ====//
                        {
                            buffer: overlayInstancesBuffer,
                            location: overlayProgram.getInformation().attributes.find(a => a.name === "in_worldPosition")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                            divisor: 1,
                        },
                        {
                            buffer: overlayInstancesBuffer,
                            location: overlayProgram.getInformation().attributes.find(a => a.name === "in_tilePosition")!.location,
                            type: GLAttributeType.INT,
                            amountComponents: 2,
                            divisor: 1,
                        },
                    ],
                    undefined,
                ),
            },
        };
    }

    public disposeData() {
        if (this.renderData) {

            this.renderData.ground.program.dispose();
            this.renderData.ground.textures.tileset.dispose();
            this.renderData.ground.mesh.vertexBuffer.dispose();
            this.renderData.ground.instances.instanceBuffer.dispose();
            this.renderData.ground.vertexArray.dispose();

            this.renderData.water.program.dispose();
            this.renderData.water.mesh.vertexBuffer.dispose();
            this.renderData.water.instances.instanceBuffer.dispose();
            this.renderData.water.vertexArray.dispose();

            this.renderData.details.program.dispose();
            this.renderData.details.vertexBuffer.dispose();
            this.renderData.details.vertexArray.dispose();

            this.renderData.overlay.program.dispose();
            this.renderData.overlay.mesh.vertexBuffer.dispose();
            this.renderData.overlay.instances.instanceBuffer.dispose();
            this.renderData.overlay.vertexArray.dispose();

            this.renderData = null;
        }
    }

    public updateData(camera: Camera) {
        if (this.renderData) {
            this.updater.update(this.renderData, camera);
        }
    }

}