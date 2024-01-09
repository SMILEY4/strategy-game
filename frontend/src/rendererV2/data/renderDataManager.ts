import {RenderData} from "./renderData";
import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {GLProgram} from "../../shared/webgl/glProgram";
import SHADER_GROUND_VERT from "../ground/shader.vsh?raw";
import SHADER_GROUND_FRAG from "../ground/shader.fsh?raw";
import {MapMode} from "../../models/mapMode";
import {RenderDataUpdater} from "./renderDataUpdater";
import {Camera} from "../../shared/webgl/camera";
import {GroundBaseMeshBuilder} from "./builders/ground/groundBaseMeshBuilder";
import {GLTexture, GLTextureMinFilter} from "../../shared/webgl/glTexture";
import {GLVertexBuffer} from "../../shared/webgl/glVertexBuffer";
import {GLVertexArray} from "../../shared/webgl/glVertexArray";
import {GLAttributeType} from "../../shared/webgl/glTypes";


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

        this.renderData = {
            meta: {
                grayscale: false,
                time: 0,
                tileSelected: null,
                tileMouseOver: null,
                mapMode: MapMode.DEFAULT,
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
                            location: groundProgram.getInformation().attributes.find(a => a.name === "in_position")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                            divisor: 1,
                        },
                        {
                            buffer: groundInstancesBuffer,
                            location: groundProgram.getInformation().attributes.find(a => a.name === "in_color")!.location,
                            type: GLAttributeType.FLOAT,
                            amountComponents: 3,
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
            this.renderData = null;
        }
    }

    public updateData(camera: Camera) {
        if (this.renderData) {
            this.updater.update(this.renderData, camera);
        }
    }

}