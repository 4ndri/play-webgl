//
// Set of utilities for WebGL
//
// Thomas Koller
//
// V 1.0: 20-Oct-2014
// V 2.0: 02-Nov-2014
//


/**
 * Create and return the WebGL context
 *
 * @param canvas The canvas from which to get the context
 * @return the WebGL context (wrapped into a debug context)
 */
function createGLContext(canvas) {
    "use strict";
	// get the gl drawing context
	var context = canvas.getContext("webgl");
	if (!context) {
		alert("Failed to create GL context");
	}
	// wrap the context to a debug context to get error messages
	return WebGLDebugUtils.makeDebugContext(context);
}

//
/**
 * Load a external resource synchronously from an URL.
 *
 * If the URL ends up specifying a file (when the original HTML is read from the file system) then
 * some security settings of the browser might have been changed. If there is a local web server,
 * there should not be any problem.
 *
 * @param name The name of the resource to get
 * @returns {string} the content of the resource
 */
function loadResource(name) {
	"use strict";
	var request = new XMLHttpRequest();
	request.open("GET", name, false); // false gives a synchronous request
	request.send(null);
	if (request.status === 200 || request.status === 0) {
		return request.responseText;
	} else {
		console.log("Error: loadFile status:" + request.statusText);
		console.log(request.status);
		console.log(request.statusText);
		console.log(request.toString());
		console.log(request.responseText);
		return null;
	}
}

/**
 * Load and compile the shaders and return the shader Program
 * @param gl the gl context to use
 * @param vertexShaderFileName the name of the vertex shader
 * @param fragmentShaderFileName the name of the fragment shader
 * @returns {*} the compiled shader program if successful, false otherwise
 */
function loadAndCompileShaders(gl, vertexShaderFileName, fragmentShaderFileName) {
	"use strict";
	var vertexShaderSource = loadResource(vertexShaderFileName);
	var fragmentShaderSource = loadResource(fragmentShaderFileName);
	if (vertexShaderSource === null || fragmentShaderSource === null) {
		console.log("Could not load shader files");
		return false;
	}
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		alert("Vertex Shader Error: " + gl.getShaderInfoLog(vertexShader));
		return false;
	}

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaderSource);
	gl.compileShader(fragmentShader);

	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		alert("Fragment Shader Error: " + gl.getShaderInfoLog(fragmentShader));
		return false;
	}
	return setupProgram(gl, vertexShader, fragmentShader);
}

/**
 * Setup the program from the vertex and fragment shader
 * @param gl the gl context to use
 * @param vertexShader the vertex shader source text
 * @param fragmentShader the fragment shader source text
 * @returns {*} the compiled shader program if successful, false otherwise
 */
function setupProgram(gl, vertexShader, fragmentShader) {
	"use strict";
	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Failed to setup shader");
        return false;
	}
	gl.useProgram(shaderProgram);
	return shaderProgram;
}

// Implementation of matrix stack

function MatrixStack() {
    "use strict";
    this.stack = [];
}

MatrixStack.prototype.push = function(matrix) {
    "use strict";
    this.stack.push(matrix);
};

MatrixStack.prototype.pop = function() {
    "use strict";
    return this.stack.pop();
};

MatrixStack.prototype.top = function() {
    "use strict";
    var index = this.stack.length - 1;
    if (index < 0) {
        console.log("Error in MatrixStack.top");
    }
    return mat4.clone(this.stack[index]);
};


