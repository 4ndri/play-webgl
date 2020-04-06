/// <reference path="../util/typings/typings.d.ts" />
/// <reference path="pong.objects.ts" />
module Pong {
    export var canvas = null;
    export var gl = null;
    export var width = 0;
    export var height = 0;
    export var game: Game;
    export var shaderProgram;

    export var aPositionId;
    export var aFragColor;
    export var aColorId;
    export var uModelId;
    export var uProjectionId;
    export var projection = mat4.create();


    export function Onload() {
        Pong.canvas = $("#gameCanvas");
        Pong.width = Pong.canvas.width();
        Pong.height = Pong.canvas.height();
        gl = GL.Util.createGLContext(Pong.canvas[0]);

        Pong.init();
        Pong.game = Game.GetGame();
        Game.draw(0);
    }

    export function init() {
        initShaders();
        setupAttributes();
    }

    function initShaders() {
        var vertexShader = GL.Util.createShaderFromScript(gl, "vertexshader");
        var fragmentShader = GL.Util.createShaderFromScript(gl, "fragmentshader");
        shaderProgram = GL.Util.CreateShaderProgram(gl, vertexShader, fragmentShader);
    }

    function setupAttributes() {
        aPositionId = gl.getAttribLocation(shaderProgram, "aPosition");
        gl.enableVertexAttribArray(aPositionId);
        aColorId = gl.getAttribLocation(shaderProgram, "aColor");
        gl.enableVertexAttribArray(aColorId);
        aFragColor = gl.getUniformLocation(shaderProgram, "aFragColor");
        uModelId = gl.getUniformLocation(shaderProgram, "uModel");
        uProjectionId = gl.getUniformLocation(shaderProgram, "uProjection");
        setupVariables();
    }

    function setupVariables() {
        mat4.ortho(projection, 0, Pong.width, Pong.height, 0, 0, 1);
        gl.uniformMatrix4fv(uProjectionId, false, projection);
    }

    export class Game {
        public static G: Game;
        drawObjs = new Array<DrawObject>();
        paddleR: DrawObject;
        paddleL: DrawObject;
        level = 1;
        acc = Pong.width / 10000;
        vel = Pong.width / 3000;
        player1: Player;
        player2: Player;

        public static GetGame() {
            if (!Game.G) {
                Game.G = new Game();
                Game.G.init();
            }
            return Game.G;
        }

        init() {
            var pbuffer = GL.Util.getNewBuffer();
            var cbuffer = GL.Util.getNewBuffer();
            var tmpform = new FPaddle(pbuffer, aPositionId, cbuffer, aColorId, [1.0, 0, 0, 1.0]);
            this.paddleL = new DrawObject(uModelId, tmpform);
            this.paddleL.setPosition([(<Rect>this.paddleL.form).width / 2, Pong.height / 2])
            this.drawObjs.push(this.paddleL);
            pbuffer = GL.Util.getNewBuffer();
            cbuffer = GL.Util.getNewBuffer();
            tmpform = new FPaddle(pbuffer, aPositionId, cbuffer, aColorId, [
                1.0, 0, 0, 1.0,
                0, 1.0, 0, 1.0,
                0, 0, 1.0, 1.0,
                0, 1.0, 1.0, 1.0]);
            this.paddleR = new DrawObject(uModelId, tmpform);
            this.paddleR.setPosition([Pong.width - (<Rect>this.paddleR.form).width / 2, Pong.height / 2])
            this.drawObjs.push(this.paddleR);
            pbuffer = GL.Util.getNewBuffer();
            cbuffer = GL.Util.getNewBuffer();
            tmpform = new FBall(pbuffer, aPositionId, cbuffer, aColorId, [1.0, 0, 1.0, 1.0]);


            this.player1 = new Player(this.paddleL, Game.KeyPadPaddleMover);
            this.player2 = new Player(this.paddleR, Game.ComputerPaddleMover);
            Game.SetKeyPadPaddleEvent();
            this.start();
        }

        public start() {
            var nbOfBalls = Math.min(this.level, 20);
            nbOfBalls = 20;
            for (var i = 0; i < nbOfBalls; i++) {
                this.addBall();
            }
        }

        public addBall() {
            var pbuffer = GL.Util.getNewBuffer();
            var cbuffer = GL.Util.getNewBuffer();
            var form = new FBall(pbuffer, aPositionId, cbuffer, aColorId, Util.getRandomColor());
            var ball = new DrawObject(uModelId, form);
            ball.setPosition([Pong.width / 2, Pong.height / 2]);
            ball.setMover(Game.ballMover);
            this.drawObjs.push(ball);
            this.balls.push(ball);
        }

        public start_() {
            var pbuffer = GL.Util.getNewBuffer();
            var cbuffer = GL.Util.getNewBuffer();
            var form = new FBall(pbuffer, aPositionId, cbuffer, aColorId, [1.0, 0, 0, 1.0]);
            var ball = new DrawObject(uModelId, form);
            ball.setPosition([200, 200]);
            var dir = vec.create();
            vec.set(dir, 1, 0);
            ball.setDir(dir);
            ball.setMover(Game.ballMover);
            this.drawObjs.push(ball);
            this.balls.push(ball);

            pbuffer = GL.Util.getNewBuffer();
            cbuffer = GL.Util.getNewBuffer();
            form = new FBall(pbuffer, aPositionId, cbuffer, aColorId, [0, 0, 1.0, 1.0]);
            ball = new DrawObject(uModelId, form);
            ball.setPosition([400, 200]);
            dir = vec.create();
            vec.set(dir, -1, 0);
            ball.setDir(dir);
            ball.setMover(Game.ballMover);
            this.drawObjs.push(ball);
            this.balls.push(ball);
        }

        private prevTime = 0;
        private currTime = 0;

        public draw(timeStamp?: number) {
            this.prevTime = this.currTime;
            this.currTime = timeStamp;
            this.animate();
            this.collide();
            this.setBallModels();
            gl.clear(gl.COLOR_BUFFER_BIT);
            for (var i = 0; i < this.drawObjs.length; i++) {
                var drawObj = this.drawObjs[i];
                drawObj.draw();
            }
            Game.G.level = Math.floor(Game.G.player1.points / 10) + 1;
            $('#lblLevel').html(Game.G.level + '');
            $('#lblPoints1').html(Game.G.player1.points + '');
            $('#lblPoints2').html(Game.G.player2.points + '');
        }

        public static draw(timeStamp?: number) {
            Game.G.draw(timeStamp);
            window.requestAnimationFrame(Game.draw);
        }
        balls = new Array<DrawObject>();
        paddles = new Array<DrawObject>();
        animate() {
            if (this.prevTime == 0) {
                this.prevTime = this.currTime;
            }
            for (var i = 0; i < this.balls.length; i++) {
                var obj = this.balls[i];
                obj.move();
            }
            this.player2.move();
        }
        setBallModels() {
            for (var i = 0; i < this.balls.length; i++) {
                var obj = this.balls[i];
                if (obj.position[0] < 0 || obj.position[0] > Pong.width) {
                    Game.G.removeAnimator(obj);
                    Game.G.removeDrawer(obj);
                }
                obj.setPosition(obj.position);
            }
            var nbOfBalls = Math.min(this.level, 20);
            for (var i = Game.G.balls.length; i < nbOfBalls; i++) {
                this.addBall();
            }
        }
        removeDrawer(drawObj: DrawObject) {
            for (var i = 0; i < this.drawObjs.length; i++) {
                var a = this.drawObjs[i];
                if (a == drawObj) {
                    this.drawObjs.splice(i, 1);
                }
            }
        }

        removeAnimator(drawObj: DrawObject) {
            for (var i = 0; i < this.balls.length; i++) {
                var a = this.balls[i];
                if (a == drawObj) {
                    this.balls.splice(i, 1);
                }
            }
        }

        public collide() {
            for (var t = 0; t < this.drawObjs.length; t++) {
                var tObj = this.drawObjs[t];
                var tRect = <Rect>tObj.form;
                var tDir = vec.clone(tObj.direction);
                if (vec.length(tDir) == 0) {
                    tDir[1] = 1;
                }
                var tOld = vec.create();
                vec.sub(tOld, tObj.position, tDir);

                var tX = [tObj.position[0] - tRect.width / 2, tObj.position[0] + tRect.width / 2];
                var tY = [tObj.position[1] - tRect.height / 2, tObj.position[1] + tRect.height / 2];

                for (var o = t + 1; o < this.drawObjs.length; o++) {
                    var oObj = this.drawObjs[o];
                    var oRect = <Rect>oObj.form;
                    var oDir = vec.clone(oObj.direction);
                    if (vec.length(oDir) == 0) {
                        oDir[1] = 1;
                    }
                    var oOld = vec.create();
                    vec.sub(oOld, oObj.position, oDir);
                    var arr = GEO.intersectVec(oOld, oObj.position, tOld, tObj.position);

                    if (!arr) {
                        if (vec.dot(tDir, oDir) < 0) {
                            //entgegengesetzt
                            if (GEO.distanceParallel(oObj.position, tObj.position, oDir) < Math.max(oRect.width, oRect.height, tRect.width, tRect.height)) {
                                var vS = null;
                                if (oDir[0]) {
                                    vS = (oObj.position[0] - tObj.position[0]) / ((oObj.velocity + tObj.velocity) * oDir[0]);
                                    //tS = Math.abs(tS);
                                    
                                } else if (oDir[1]) {
                                    vS = (oObj.position[1] - tObj.position[1]) / ((oObj.velocity + tObj.velocity) * oDir[1]);
                                }

                                if (vS != null && vS < 0 && (Math.abs(vS) <= 1 || Math.abs(vS) <= 1)) {
                                    Game.setCollisionDirection(oObj, tObj);
                                }

                            }
                        }
                        continue;
                    }
                    var s = arr[0];
                    var oS = 0;
                    if (Math.abs(oDir[0]) >= 0.000000001) {
                        oS = (s[0] - oObj.position[0]) / oDir[0];
                    } else if (Math.abs(oDir[1]) >= 0.000000001) {
                        oS = (s[1] - oObj.position[1]) / oDir[1];
                    }

                    var tS = 0;
                    if (Math.abs(tDir[0]) >= 0.000000001) {
                        tS = (s[0] - tObj.position[0]) / tDir[0];
                    } else if (Math.abs(tDir[1]) >= 0.000000001) {
                        tS = (s[1] - tObj.position[1]) / tDir[1];
                    }

                    var oX = [oObj.position[0] - oRect.width / 2, oObj.position[0] + oRect.width / 2];
                    var oY = [oObj.position[1] - oRect.height / 2, oObj.position[1] + oRect.height / 2];

                    if (oS > 0) {
                        if (tX[0] <= oX[1] && tX[1] >= oX[0] && tY[0] <= oY[1] && tY[1] >= oY[0]) {
                            Game.setCollisionDirection(oObj, tObj);
                        }
                        continue;
                    }
                    if (tS > 0) {
                        continue;
                    }
                    if (oS < -oObj.velocity - Math.max(oRect.width, oRect.height, tRect.width, tRect.height)) {
                        //not in range
                        continue;
                    }
                    if (tS < -tObj.velocity - Math.max(oRect.width, oRect.height, tRect.width, tRect.height)) {
                        //not in range
                        continue;
                    }
                    if (oObj.velocity) {
                        Game.checkPositions(oS, oObj, oDir, tS, tObj, tDir);

                    } else if (tObj.velocity) {
                        Game.checkPositions(tS, tObj, tDir, oS, oObj, oDir);
                    } else {
                        //egal
                    }
                }
            }
        }

        public static checkPositions(oS, oObj: DrawObject, oDir, tS, tObj: DrawObject, tDir) {
            var oRect = <Rect>oObj.form;
            var tRect = <Rect>tObj.form;
            var oSPos = vec.create();
            var oPart = Math.min(Math.abs(oS), oObj.velocity);
            var q = 0;
            if (oObj.velocity != 0) {
                q == oPart / oObj.velocity;
            }
            vec.scaleAndAdd(oSPos, oObj.position, oDir, -oPart);
            var tSPos = vec.create();
            var tPart = tObj.velocity / q;
            vec.scaleAndAdd(tSPos, tObj.position, tDir, -tPart);
            if (Game.doCollide(oSPos, oRect, tSPos, tRect)) {
                Game.setCollisionDirection(oObj, tObj);
            }
        }

        public static doCollide(pos1, rect1: Rect, pos2, rect2: Rect) {
            var tX = [pos1[0] - rect1.width / 2, pos1[0] + rect1.width / 2];
            var tY = [pos1[1] - rect1.height / 2, pos1[1] + rect1.height / 2];
            var oX = [pos2[0] - rect2.width / 2, pos2[0] + rect2.width / 2];
            var oY = [pos2[1] - rect2.height / 2, pos2[1] + rect2.height / 2];

            if (tX[0] <= oX[1] && tX[1] >= oX[0] && tY[0] <= oY[1] && tY[1] >= oY[0]) {
                return true;
            }
            return false;
        }

        public static setCollisionDirection(oObj: DrawObject, tObj: DrawObject) {
            if ((oObj.form.constructor == FPaddle && tObj.form.constructor == FBall) ||
                (tObj.form.constructor == FPaddle && oObj.form.constructor == FBall)) {
                if (tObj == Game.G.player1.paddle || oObj == Game.G.player1.paddle) {
                    Game.G.player1.points++;
                }
                if (tObj == Game.G.player2.paddle || oObj == Game.G.player2.paddle) {
                    Game.G.player2.points++;
                }
            }
            if (oObj.velocity == 0) {
                vec.set(tObj.direction, -tObj.direction[0], tObj.direction[1]);

            }
            else if (tObj.velocity == 0) {
                vec.set(oObj.direction, -oObj.direction[0], oObj.direction[1]);
            }
            else {
                var tmpDir = vec.clone(tObj.direction);
                tObj.direction = vec.clone(oObj.direction);
                oObj.direction = tmpDir;
            }
        }

        public static ballMover = function (drawObj: DrawObject) {
            var oldPos = drawObj.position;
            if (!drawObj.direction[0] || Math.abs(drawObj.direction[0]) < 0.2) {
                var dir = vec.create();
                var x = Math.floor(Math.random() * (20 + 1)) - 10;
                var y = Math.floor(Math.random() * (20 + 1)) - 10;
                vec.set(dir, x, y);
                //vec.random(dir);
                drawObj.setDir(dir);
            }
            drawObj.velocity = Game.G.vel * (1 + (Game.G.level * Game.G.acc)) * (Game.G.currTime - Game.G.prevTime);
            drawObj.velocity = Math.min(50, drawObj.velocity);
            vec.scaleAndAdd(drawObj.position, drawObj.position, drawObj.direction, drawObj.velocity);

            if (drawObj.position[1] + drawObj.form.height / 2 > Pong.height) {
                var y = 2 * Pong.height - drawObj.position[1] - drawObj.form.height / 2;
                vec.set(drawObj.position, drawObj.position[0], y);
                vec.set(drawObj.direction, drawObj.direction[0], -drawObj.direction[1]);
            }
            if (drawObj.position[1] - drawObj.form.height / 2 < 0) {
                var y = -drawObj.position[1] + drawObj.form.height / 2;
                vec.set(drawObj.position, drawObj.position[0], y);
                vec.set(drawObj.direction, drawObj.direction[0], -drawObj.direction[1]);
            }

        };

        public static ComputerPaddleMover(paddle: DrawObject) {
            var pos1 = vec.clone(paddle.position);
            pos1[0] = pos1[0] - paddle.form.width / 2;
            var pos2 = vec.clone(pos1);
            pos2[1] = pos2[1] + 1;
            var nS = null;
            for (var i = 0; i < Game.G.balls.length; i++) {
                var ball = Game.G.balls[i];
                var bp = vec.create();
                vec.add(bp, ball.position, ball.direction);
                var arr = GEO.intersectVec(pos1, pos2, ball.position, bp);
                if (!arr) {
                    continue;
                }
                if (!nS) {
                    if (arr[2] > 0) {
                        nS = arr;
                    }
                } else {
                    if (arr[2] > 0 && nS[2] > arr[2]) {
                        nS = arr;
                    }
                }
            }
            if (nS) {
                Game.setPaddlePos(paddle, nS[0]);
            }
        }

        public static setPaddlePos(paddle: DrawObject, pos) {
            var y = Math.abs(pos[1]);
            var foldings = Math.floor(y / Pong.height);
            var diff = y - foldings * Pong.height;
            if (foldings % 2 == 1) {
                pos[1] = Pong.height - diff;
            } else {
                pos[1] = 0 + diff;
            }
            pos[0] = paddle.position[0];
            var dir = vec.create();
            vec.sub(dir, pos, paddle.position);

            var l = Player.velocity * (Game.G.currTime - Game.G.prevTime);
            l = Math.min(50, l);
            l = Math.min(l, vec.length(dir));

            vec.normalize(dir, dir);
            vec2.scaleAndAdd(pos, paddle.position, dir, l);
            pos[1] = Math.min(Math.max(pos[1], paddle.form.height / 2), Pong.height - paddle.form.height / 2);

            paddle.setPosition(pos);
        }
        public static KeyPadPaddleMover(paddle: DrawObject) {

        }
        public static SetKeyPadPaddleEvent() {
            $("body").keydown(function (event) {
                if (event.which == 13) {
                    event.preventDefault();
                }
                var paddle = Pong.Game.G.player1.paddle;
                var pos = paddle.position;
                if (event.keyCode == 38) {
                    pos[1] -= 10;
                    pos[1] = Math.min(Math.max(pos[1], paddle.form.height / 2), Pong.height - paddle.form.height / 2);
                    paddle.setPosition(pos);
                }
                if (event.keyCode == 40) {
                    pos[1] += 10;
                    pos[1] = Math.min(Math.max(pos[1], paddle.form.height / 2), Pong.height - paddle.form.height / 2);
                    paddle.setPosition(pos);
                }

            });
        }
    }
    export class Player {
        public paddle: DrawObject;
        public points = 0;
        public static velocity = 1;
        public mover: (drawObj: DrawObject) => void;
        constructor(paddle: DrawObject, mover: (drawObj: DrawObject) => void) {
            this.paddle = paddle;
            this.mover = mover;
        }
        public setMover(amover: (drawObj: DrawObject) => void) {
            this.mover = amover;
        }
        public move() {
            if (this.mover) {
                this.mover(this.paddle);
            }
        }
    }

    export module Util {
        export function getRandomColor() {
            var c = [];
            for (var i = 0; i < 3; i++) {
                c.push(Math.random());
            }
            c.push(1.0);
            return c;
        }

    }
}

module GEO {
    export function distanceParallel(a, b, dir): number {
        var c = vec.create();
        vec.sub(c, b, a);
        var d = vec.create();
        vec.normalize(d, dir);
        var r = vec.create();
        vec.scale(r, d, vec.dot(d, c));
        return vec.distance(r, c);
    }

    export function intersectVec(a, b, c, d) {

        var e1 = getCoordForm(a, b);
        var e2 = getCoordForm(c, d);
        var crossE = vecH.create();
        vecH.cross(crossE, e1, e2);
        var h = crossE[crossE.length - 1];
        if (Math.abs(h) <= 0.0000000001) {
            //vectors are parallels
            return null;
        }
        var s = vec.create();
        for (var i = 0; i < s.length; i++) {
            s[i] = crossE[i] / h;
        }

        var abDir = vec.create();
        vec.sub(abDir, b, a);
        var cdDir = vec.create();
        vec.sub(cdDir, d, c);
        var abS = 0;
        if (Math.abs(abDir[0]) >= 0.000000001) {
            abS = (s[0] - a[0]) / abDir[0];
        } else if (Math.abs(abDir[1]) >= 0.000000001) {
            abS = (s[1] - a[1]) / abDir[1];
        }

        var cdS = 0;
        if (Math.abs(cdDir[0]) >= 0.000000001) {
            cdS = (s[0] - c[0]) / cdDir[0];
        } else if (Math.abs(cdDir[1]) >= 0.000000001) {
            cdS = (s[1] - c[1]) / cdDir[1];
        }

        return [s, abS, cdS];
    }

    export function getCoordForm(p1, p2) {
        var pH1 = getHCoord(p1);
        var pH2 = getHCoord(p2);
        var crossp = vecH.create();
        vecH.cross(crossp, pH1, pH2);
        vecH.normalize(crossp, crossp);
        return crossp;
    }

    export function getHCoord(p1) {
        var retH = vecH.create();
        for (var i = 0; i < p1.length; i++) {
            retH[i] = p1[i];
        }
        retH[retH.length - 1] = 1;
        return retH;
    }
}