/// <reference path="../../scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../webgl.util.ts" />
interface IWebGLDebugUtils {
    makeDebugContext: (context: any)=>any
}
declare var WebGLDebugUtils: IWebGLDebugUtils;

declare var gl: any;
declare var mat4: any;
declare var mat3: any;
declare var vec4: any;
declare var vec3: any;
declare var vec2: any;

declare var defineSphere: any;
declare var drawSphere: any;