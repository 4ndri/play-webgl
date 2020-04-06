var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../util/typings/typings.d.ts" />
var vec = vec2;
var vecH = vec3;
var DrawObject = (function () {
    function DrawObject(modelId, form) {
        this.model = mat4.create();
        this.position = vec.create();
        this.old_pos = vec.create();
        this.direction = vec.create();
        this.velocity = 0;
        this.mover = function (drawObj) {
            vec.scaleAndAdd(drawObj.position, drawObj.position, drawObj.direction, drawObj.velocity);
            //var size = Math.min(drawObj.direction.length, drawObj.position.length);
            //for (var i = 0; i < size; i++) {
            //    drawObj.position[i] = drawObj.position[i] + drawObj.direction[i] * 1;
            //}
        };
        this.form = form;
        this.modelId = modelId;
    }
    DrawObject.prototype.setModel = function (model) {
        this.model = model;
    };
    DrawObject.prototype.setPosition = function (pos) {
        this.old_pos = this.position;
        this.position = pos;
        var v = vec3.create();
        vec3.set(v, pos[0], pos[1], 0);
        var m = mat4.create();
        mat4.translate(m, mat4.create(), v);
        this.setModel(m);
    };
    DrawObject.prototype.setDir = function (dir) {
        vec.normalize(this.direction, dir);
        //var qsum = 0;
        //for (var i = 0; i < dir.length; i++) {
        //    qsum += dir[i] ^ 2;
        //}
        //var l = Math.sqrt(qsum);
        //l = l ? l : 1;
        //var size = Math.min(this.direction.length, dir.length);
        //for (var i = 0; i < size; i++) {
        //    this.direction[i] = dir[i] / l;
        //}
    };
    DrawObject.prototype.setMover = function (mover) {
        this.mover = mover;
    };
    DrawObject.prototype.move = function () {
        if (this.mover) {
            this.mover(this);
        }
    };
    DrawObject.prototype.draw = function (model) {
        //clear buffer
        //gl.clear(this.form.cbuffer);
        //set model
        if (model) {
            this.model = model;
        }
        gl.uniformMatrix4fv(this.modelId, false, this.model);
        //set positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.form.pbuffer);
        gl.vertexAttribPointer(this.form.positionId, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.form.Points), gl.STATIC_DRAW);
        //set color
        //gl.uniform4f(this.form.colorId, 0.0, 1.0, 0, 1.0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.form.cbuffer);
        gl.vertexAttribPointer(this.form.colorId, 4, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.form.Colors), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.form.Length);
    };
    return DrawObject;
})();
var Form = (function () {
    function Form() {
        this.height = 0;
        this.width = 0;
    }
    Form.prototype.setPoints = function (points) {
        this.Points = points;
        this.Length = this.Points.length / 2;
    };
    return Form;
})();
var Rect = (function (_super) {
    __extends(Rect, _super);
    function Rect(pbuffer, positionId, cbuffer, colorId, rect, color) {
        _super.call(this);
        var pts = this.createPoints(rect[0], rect[1]);
        this.pbuffer = pbuffer;
        this.positionId = positionId;
        this.setPoints(pts);
        if (color.length < 4) {
            color = [1.0, 0, 0, 1.0];
        }
        if (color.length == this.Length * 4) {
            this.Colors = color;
        }
        else {
            this.Colors = [
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3]
            ];
        }
        this.cbuffer = cbuffer;
        this.colorId = colorId;
    }
    Rect.prototype.createPoints = function (w, h) {
        this.width = w;
        this.height = h;
        var x = -w / 2;
        var y = -h / 2;
        var arr = [
            x, y,
            x + w, y,
            x, y + h,
            x + w, y + h
        ];
        return arr;
    };
    Rect.prototype.setWidth = function (w) {
        var pts = this.createPoints(w, this.height);
        this.setPoints(pts);
    };
    Rect.prototype.setHeight = function (h) {
        var pts = this.createPoints(this.width, h);
        this.setPoints(pts);
    };
    return Rect;
})(Form);
var FPaddle = (function (_super) {
    __extends(FPaddle, _super);
    function FPaddle(pbuffer, positionId, cbuffer, colorId, color) {
        _super.call(this, pbuffer, positionId, cbuffer, colorId, [FPaddle.WIDTH, FPaddle.HEIGHT], color);
    }
    FPaddle.WIDTH = 20;
    FPaddle.HEIGHT = 80;
    return FPaddle;
})(Rect);
var FBall = (function (_super) {
    __extends(FBall, _super);
    function FBall(pbuffer, positionId, cbuffer, colorId, color) {
        _super.call(this, pbuffer, positionId, cbuffer, colorId, [FBall.WIDTH, FBall.HEIGHT], color);
    }
    FBall.WIDTH = 10;
    FBall.HEIGHT = 10;
    return FBall;
})(Rect);
