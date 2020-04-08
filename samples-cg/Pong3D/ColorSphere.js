/**
 * Created by zakoller on 12.11.14.
 *
 * Define and draw a colored sphere.
 */

/**
 *
 * @param gl the gl object for which to define the sphere
 * @param latitudebands the number of bands along the latitude direction
 * @param longitudebands the number of bands along the longitude direction
 *
 */
function defineSphere(gl, latitudeBands, longitudeBands) {
    "use strict";
    // define the vertices of the sphere
    var vertices = [];
    var normals = [];

    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;

            // texture coordinates (not used)
            // var u = 1 - (longNumber / longitudeBands);
            // var v = 1 - (latNumber / latitudeBands);

            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            normals.push(x);
            normals.push(y);
            normals.push(z);
        }
    }

    var indices = [];
    for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;

            indices.push(first);
            indices.push(first + 1);
            indices.push(second);

            indices.push(second);
            indices.push(first + 1);
            indices.push(second + 1);
        }
    }

    var sphere = {};
    sphere.bufferVertices  = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.bufferVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    sphere.bufferNormals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.bufferNormals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    sphere.bufferIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.bufferIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    sphere.numberOfTriangles = latitudeBands*longitudeBands*2;
    return sphere;
}

/**
 *
 * @param gl The gl context for this operation
 * @param aVertexPositionId the index of the vertex position attribute in the shader program
 * @param aVertexColorId the index of the vertex color attribute in the shader program
 * @param aVertexNormalId the index of the vertex normal attribute in the shader program
 * @param color the color of the sphere as vector with length 3 [r,g,b] in the range 0..1
 *
 * Draw the sphere with the indicated color. The modelview and normal matrices must be set before.
 */
function drawSphere(gl, sphere, aVertexPositionId, aVertexColorId, aVertexNormalId, color) {
    "use strict";
    // bind the buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.bufferVertices);
    gl.vertexAttribPointer(aVertexPositionId, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexPositionId);

    // color is directly specified as an attribute here, as it is valid for the whole object
    //gl.vertexAttrib3fv(aVertexColorId, color);
    gl.disableVertexAttribArray(aVertexColorId);
    gl.vertexAttrib3f(aVertexColorId, color[0], color[1], color[2]);

    // bind the buffer for normal
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.bufferNormals);
    gl.vertexAttribPointer(aVertexNormalId, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexNormalId);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.bufferIndices);

    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.drawElements(gl.TRIANGLES, sphere.numberOfTriangles*3 ,gl.UNSIGNED_SHORT, 0);
}