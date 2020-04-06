/// <reference path="../util/typings/typings.d.ts" />
var vec = vec2;
var vecH = vec3;
class DrawObject {
    public model: any = mat4.create();
    modelId: any;
    form: Form;
    position = vec.create();
    old_pos = vec.create();
    direction = vec.create();
    velocity = 0;
    constructor(modelId, form) {
        this.form = form;
        this.modelId = modelId;
    }

    public setModel(model) {
        this.model = model;
    }

    public setPosition(pos: any) {
        this.old_pos = this.position;
        this.position = pos;
        var v = vec3.create();
        vec3.set(v, pos[0], pos[1], 0);
        var m = mat4.create();
        mat4.translate(m, mat4.create(), v);
        this.setModel(m);
    }

    public setDir(dir: any) {
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
    }
    public setMover(mover: (drawObj: DrawObject) => void) {
        this.mover = mover;
    }
    mover = function (drawObj: DrawObject) {
        vec.scaleAndAdd(drawObj.position, drawObj.position, drawObj.direction, drawObj.velocity);
        //var size = Math.min(drawObj.direction.length, drawObj.position.length);
        //for (var i = 0; i < size; i++) {
        //    drawObj.position[i] = drawObj.position[i] + drawObj.direction[i] * 1;
        //}
    };

    public move() {
        if (this.mover) {
            this.mover(this);
        }
    }

    public draw(model?: any) {
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
    }
}

class Form {
    Points: Array<number>;
    positionId: any;
    pbuffer: any;
    Length: number;
    Colors: Array<number>;
    colorId: any;
    cbuffer: any;
    height = 0;
    width = 0;
    public setPoints(points: Array<number>) {
        this.Points = points;
        this.Length = this.Points.length / 2;
    }
}

class Rect extends Form {
    constructor(pbuffer, positionId, cbuffer, colorId, rect: Array<number>, color: Array<number>) {
        super();
        var pts = this.createPoints(rect[0], rect[1]);

        this.pbuffer = pbuffer;
        this.positionId = positionId;
        this.setPoints(pts);
        if (color.length < 4) {
            color = [1.0, 0, 0, 1.0];
        }
        if (color.length == this.Length * 4) {
            this.Colors = color;
        } else {
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

    public createPoints(w, h) {
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
    }

    public setWidth(w: number) {
        var pts = this.createPoints(w, this.height);
        this.setPoints(pts);
    }
    public setHeight(h: number) {
        var pts = this.createPoints(this.width, h);
        this.setPoints(pts);
    }
}

class FPaddle extends Rect {
    public static WIDTH = 20;
    public static HEIGHT = 80;
    constructor(pbuffer, positionId, cbuffer, colorId, color: Array<number>) {
        super(pbuffer, positionId, cbuffer, colorId, [FPaddle.WIDTH, FPaddle.HEIGHT], color);
    }
}

class FBall extends Rect {
    public static WIDTH = 10;
    public static HEIGHT = 10;
    constructor(pbuffer, positionId, cbuffer, colorId, color: Array<number>) {
        super(pbuffer, positionId, cbuffer, colorId, [FBall.WIDTH, FBall.HEIGHT], color);
    }
}