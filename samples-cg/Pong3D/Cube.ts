/// <reference path="../util/typings/typings.d.ts" />
var debug = false;
var canvas;
var width;
var height;
var gl;

var projection = mat4.create();
var shaderProgram;
function OnLoad() {
    canvas = $("#gameCanvas");
    width = canvas.width();
    height = canvas.height();
    gl = GL.Util.createGLContext(canvas[0]);
    if (/debug/ig.test(location.search)) {
        debug = true;
    }

    Init();
    draw();
}

function Init() {
    gl.enable(gl.DEPTH_TEST)
    initShaders();
    setupAttributes();
    setupObjects();
}

function initShaders() {
    var vertexShader = GL.Util.CreateShaderFromFile("vShader.txt", gl.VERTEX_SHADER);
    var dummy = 1;
    var i = 1;
    var fragmentShader = GL.Util.CreateShaderFromFile("fShader.txt", gl.FRAGMENT_SHADER);
    shaderProgram = GL.Util.CreateShaderProgram(gl, vertexShader, fragmentShader);
}

var aPositionId;
var aColorId;
var aFragColor;
var uModelId;
var aNormsId;
var uNormsId;
var uProjectionId;
var uLightVecId;
var uLightColorId;
function setupAttributes() {
    aPositionId = gl.getAttribLocation(shaderProgram, "aPosition");
    
    aColorId = gl.getAttribLocation(shaderProgram, "aColor");
    
    aNormsId = gl.getAttribLocation(shaderProgram, "aNorms");
    uNormsId = gl.getUniformLocation(shaderProgram, "uNorms");

    aFragColor = gl.getUniformLocation(shaderProgram, "aFragColor");
    uModelId = gl.getUniformLocation(shaderProgram, "uModel");
    uProjectionId = gl.getUniformLocation(shaderProgram, "uProjection");
    uLightVecId = gl.getUniformLocation(shaderProgram, "uLightVec");
    uLightColorId = gl.getUniformLocation(shaderProgram, "uLightColor");

    setupVariables();
}

function setProjection() {
    mat4.frustum(projection, -2, 2, -2, 2, 2, 100);
}

function setupVariables() {
    setProjection();
    //mat4.ortho(projection, 0, width, height, 0, 0, 1);
    gl.uniformMatrix4fv(uProjectionId, false, projection);

    gl.uniform3f(uLightVecId, 1.0, 1.0, 1.0);
    gl.uniform3f(uLightColorId, 1.0, 1.0, 1.0);
}

var cube: Cube;
var sphere;
var sphere2;
function setupObjects() {
    cube = new Cube();
    sphere = defineSphere(gl, 20, 20);
    sphere2 = defineSphere(gl, 20, 20);
}


var vAngle = Math.PI / 180 * 40;
var vAngleCam = Math.PI / 180 * 40;
var angleCam = 0;
var angle = 0;
var time = 0;
function draw(timeStamp?: number) {
    gl.clearColor(0.0,0.0,0.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var elapsed = 0;
    if (time) {
        elapsed = timeStamp - time;
    }
    time = timeStamp;

    var lookAt = mat4.create();

    mat4.lookAt(lookAt, [0, 0, -8.0], [0, 0, 0], [0, 1.0, 0]);
    angleCam += elapsed / 1000 * vAngleCam;

    //mat4.translate(model, model, [-0.5, -0.5, -0.5]);

    angle += elapsed / 1000 * vAngle;
    //mat4.rotate(model, lookAt, angle, [1, 1, 1]);
    var sphereModel = mat4.create();
    mat4.rotateY(sphereModel, lookAt, angleCam);
    //mat4.translate(sphereModel, sphereModel, [0.0, 0, -3.0]);
    mat4.rotateY(sphereModel, sphereModel, angleCam);

    gl.uniformMatrix4fv(uModelId, false, sphereModel);
    var normMatrix = mat3.create();
    mat3.normalFromMat4(normMatrix, sphereModel);
    gl.uniformMatrix3fv(uNormsId, false, normMatrix);
    drawSphere(gl, sphere, aPositionId, aColorId, aNormsId, [1.0, 0, 0]);

    cube.model = mat4.create();
    mat4.rotateY(cube.model, lookAt, angleCam);
    mat4.translate(cube.model, cube.model, [0.0, 0, -3.0]);
    mat4.rotateY(cube.model, cube.model, angleCam);
    mat4.rotate(cube.model, cube.model, angle, [1, 1, 1]);
    cube.draw();

    sphereModel = mat4.create();

    
    mat4.rotateY(sphereModel, lookAt, -angleCam);
    
    mat4.scale(sphereModel, sphereModel, [1.2, 1.2, 1.2]);
    mat4.translate(sphereModel, sphereModel, [0.0, 0, -3.0]);
    mat4.rotateY(sphereModel, sphereModel, angleCam);
    

    gl.uniformMatrix4fv(uModelId, false, sphereModel);
    normMatrix = mat3.create();
    mat3.normalFromMat4(normMatrix, sphereModel);
    gl.uniformMatrix3fv(uNormsId, false, normMatrix);

    drawSphere(gl, sphere2, aPositionId, aColorId, aNormsId, [0.0, 0, 1.0]);
    if (!debug) {
        window.requestAnimationFrame(draw);  
    }  
}



class Cube {    
   

    public static vIndices = [
        0, 1, 2, 0, 2, 3,    // vorne
        4, 5, 6, 4, 6, 7,    // hinten
        8, 9, 10, 8, 10, 11,   // oben
        12, 13, 14, 12, 14, 15,   // unten
        16, 17, 18, 16, 18, 19,   // rechts
        20, 21, 22, 20, 22, 23    // links
    ];

    public static vertices = [
        // vordere Fläche
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
    
        // hintere Fläche
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
    
        // obere Fläche
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,
    
        // untere Fläche
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
    
        // rechte Fläche
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
    
        // linke Fläche
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0
    ];

    color = new Array<number>();
    public static default_color = [
        [0.0, 0.0, 1.0],    // vordere Fläche
        [0.3, 0.5, 0.7],    // hintere Fläche
        [0.0, 1.0, 0.0],    // obere Fläche: grün
        [0.0, 0.0, 1.0],    // untere Fläche: blau
        [1.0, 1.0, 0.0],    // rechte Fläche: gelb
        [1.0, 0.0, 1.0]
    ];

    public static vnorms = [
        [0, 0, 1.0],
        [0, 0, -1.0],
        [0, 1.0, 0],
        [0, -1.0, -1.0],
        [1.0, 0, 0],
        [-1.0, 0, 0]
    ];
    public vbuffer;
    public ebuffer;
    public cbuffer;
    public nbuffer;
    public model: Array<number> = mat4.create();
    public norms: Array<number> = [];
    setColor(c: Array<Array<number>>) {
        this.color = [];
        
        for (var i = 0; i < c.length; i++) {
            var col = c[i];
            //every vertex of area
            for (var j = 0; j < 4; j++) {
                this.color=this.color.concat(c[i]);
            }
        }
    }

    setNorms() {
        this.norms = [];

        for (var i = 0; i < Cube.vnorms.length; i++) {
            var col = Cube.vnorms[i];
            //every vertex of area
            for (var j = 0; j < 4; j++) {
                this.norms = this.norms.concat(Cube.vnorms[i]);
            }
        }
    }

    constructor() {
        this.vbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Cube.vertices), gl.STATIC_DRAW);

        this.nbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuffer);
        this.setNorms();
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.norms), gl.STATIC_DRAW);

        this.ebuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Cube.vIndices), gl.STATIC_DRAW);

        this.cbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cbuffer);
        this.setColor(Cube.default_color);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.color), gl.STATIC_DRAW);

    }

    draw() {
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
        gl.enable(gl.CULL_FACE);

        gl.uniformMatrix4fv(uModelId, false, this.model);
        var normMatrix = mat3.create();
        mat3.normalFromMat4(normMatrix, this.model);
        gl.uniformMatrix3fv(uNormsId, false, normMatrix);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
        gl.enableVertexAttribArray(aPositionId);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebuffer);
        gl.enableVertexAttribArray(aPositionId);
        gl.vertexAttribPointer(aPositionId, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuffer);
        gl.enableVertexAttribArray(aNormsId);
        gl.vertexAttribPointer(aNormsId, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cbuffer);
        gl.enableVertexAttribArray(aColorId);
        gl.vertexAttribPointer(aColorId, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawElements(gl.TRIANGLES, Cube.vIndices.length /* Anzahl Indices */, gl.UNSIGNED_SHORT, 0);
        //gl.disable(gl.CULL_FACE);
    }
}

