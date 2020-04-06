/// <reference path="typings/typings.d.ts" />
var gl;
var GL;
(function (GL) {
    var Util;
    (function (Util) {
        Util.ctx = null;
        function createGLCTXByID(id) {
            Util.canvas = document.getElementById(id);
            createGLContext(Util.canvas);
        }
        Util.createGLCTXByID = createGLCTXByID;
        function createGLContext(canvas) {
            // get the gl drawing context
            Util.canvas = canvas;
            var context = Util.canvas.getContext("webgl");
            if (!context) {
                alert("Failed to create GL context");
            }
            // wrap the context to a debug context to get error messages
            Util.ctx = WebGLDebugUtils.makeDebugContext(context);
            gl = Util.ctx;
            return gl;
        }
        Util.createGLContext = createGLContext;
        function CreateShaderFromFile(shaderFileName, shaderType, opt_errorCallback) {
            var shaderSource = loadResource(shaderFileName);
            if (shaderSource === null) {
                console.log("Could not load shader file");
                return false;
            }
            if (shaderType != gl.VERTEX_SHADER && shaderType != gl.FRAGMENT_SHADER) {
                throw ("*** Error: unknown shader type");
                return null;
            }
            return loadShader(shaderSource, shaderType, opt_errorCallback);
        }
        Util.CreateShaderFromFile = CreateShaderFromFile;
        function loadResource(name) {
            "use strict";
            var request = new XMLHttpRequest();
            request.open("GET", name, false); // false gives a synchronous request
            request.send(null);
            if (request.status === 200 || request.status === 0) {
                return request.responseText;
            }
            else {
                console.log("Error: loadFile status:" + request.statusText);
                console.log(request.status);
                console.log(request.statusText);
                console.log(request.toString());
                console.log(request.responseText);
                return null;
            }
        }
        //function loadAndCompileShaders(vertexShaderFileName, fragmentShaderFileName) {
        //    var vertexShaderSource = loadResource(vertexShaderFileName);
        //    var fragmentShaderSource = loadResource(fragmentShaderFileName);
        //    if (vertexShaderSource === null || fragmentShaderSource === null) {
        //        console.log("Could not load shader files");
        //        return false;
        //    }
        //    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        //    gl.shaderSource(vertexShader, vertexShaderSource);
        //    gl.compileShader(vertexShader);
        //    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        //        alert("Vertex Shader Error: " + gl.getShaderInfoLog(vertexShader));
        //        return false;
        //    }
        //    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        //    gl.shaderSource(fragmentShader, fragmentShaderSource);
        //    gl.compileShader(fragmentShader);
        //    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        //        alert("Fragment Shader Error: " + gl.getShaderInfoLog(fragmentShader));
        //        return false;
        //    }
        //    return setupProgram(gl, vertexShader, fragmentShader);
        //}
        function createShaderFromScript(gl, scriptId, opt_shaderType, opt_errorCallback) {
            var shaderSource = "";
            var shaderType;
            var shaderScript = document.getElementById(scriptId);
            if (!shaderScript) {
                throw ("*** Error: unknown script element" + scriptId);
            }
            shaderSource = shaderScript.text;
            if (!opt_shaderType) {
                if (shaderScript.type == "x-shader/x-vertex") {
                    shaderType = gl.VERTEX_SHADER;
                }
                else if (shaderScript.type == "x-shader/x-fragment") {
                    shaderType = gl.FRAGMENT_SHADER;
                }
                else if (shaderType != gl.VERTEX_SHADER && shaderType != gl.FRAGMENT_SHADER) {
                    throw ("*** Error: unknown shader type");
                    return null;
                }
            }
            return loadShader(shaderSource, opt_shaderType ? opt_shaderType : shaderType, opt_errorCallback);
        }
        Util.createShaderFromScript = createShaderFromScript;
        ;
        function CreateShaderProgram(aGL) {
            var shaders = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                shaders[_i - 1] = arguments[_i];
            }
            gl = aGL;
            var shaderProgram = gl.createProgram();
            for (var i = 0; i < shaders.length; i++) {
                var arg = shaders[i];
                gl.attachShader(shaderProgram, arg);
            }
            gl.linkProgram(shaderProgram);
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert(" Failed to setup shader ");
                return;
            }
            gl.useProgram(shaderProgram);
            return shaderProgram;
        }
        Util.CreateShaderProgram = CreateShaderProgram;
        var lastError = '';
        function loadShader(shaderSource, shaderType, opt_errorCallback) {
            var errFn = opt_errorCallback || error;
            // Create the shader object
            var shader = gl.createShader(shaderType);
            // Load the shader source
            gl.shaderSource(shader, shaderSource);
            // Compile the shader
            gl.compileShader(shader);
            // Check the compile status
            var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (!compiled) {
                // Something went wrong during compilation; get the error
                lastError = gl.getShaderInfoLog(shader);
                errFn("*** Error compiling shader '" + shader + "':" + lastError);
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }
        Util.loadShader = loadShader;
        function getNewBuffer() {
            var b_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, b_buffer);
            return b_buffer;
        }
        Util.getNewBuffer = getNewBuffer;
        function error(msg) {
            if (window.console) {
                if (window.console.error) {
                    window.console.error(msg);
                }
                else if (window.console.log) {
                    window.console.log(msg);
                }
            }
        }
        Util.error = error;
        ;
    })(Util = GL.Util || (GL.Util = {}));
})(GL || (GL = {}));
