/**
 * Balatro-style WebGL animated background for Augment hero.
 * Adapted from the original Framer component shader.
 * Colors tuned to match the Augment palette:
 *   Color 1 → Deep Navy tint  (#0B1F3A variants)
 *   Color 2 → Royal Blue / Indigo (#3B55E6 / #4F46E5)
 *   Color 3 → Soft white highlight
 */

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;
#define PI 3.14159265359

uniform float iTime;
uniform vec3 iResolution;
uniform float uSpinRotation;
uniform float uSpinSpeed;
uniform vec2  uOffset;
uniform vec4  uColor1;
uniform vec4  uColor2;
uniform vec4  uColor3;
uniform float uContrast;
uniform float uLighting;
uniform float uSpinAmount;
uniform float uPixelFilter;
uniform float uSpinEase;
uniform bool  uIsRotate;
uniform vec2  uMouse;

varying vec2 vUv;

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / uPixelFilter;
    vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size
               - 0.5 * screenSize.xy) / length(screenSize.xy) - uOffset;
    float uv_len = length(uv);

    float speed = (uSpinRotation * uSpinEase * 0.2);
    if (uIsRotate) { speed = iTime * speed; }
    speed += 302.2;

    float mouseInfluence = (uMouse.x * 2.0 - 1.0);
    speed += mouseInfluence * 0.1;

    float new_pixel_angle = atan(uv.y, uv.x) + speed
        - uSpinEase * 20.0 * (uSpinAmount * uv_len + (1.0 - uSpinAmount));
    vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
    uv = (vec2(uv_len * cos(new_pixel_angle) + mid.x,
               uv_len * sin(new_pixel_angle) + mid.y) - mid);

    uv *= 30.0;
    float baseSpeed = iTime * uSpinSpeed;
    speed = baseSpeed + mouseInfluence * 2.0;

    vec2 uv2 = vec2(uv.x + uv.y);
    for (int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv  += 0.5 * vec2(
            cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
            sin(uv2.x - 0.113 * speed)
        );
        uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
    }

    float contrast_mod = (0.25 * uContrast + 0.5 * uSpinAmount + 1.2);
    float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);
    float light = (uLighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0)
                + uLighting * max(c2p * 5.0 - 4.0, 0.0);

    return (0.3 / uContrast) * uColor1
        + (1.0 - 0.3 / uContrast) * (
            uColor1 * c1p
          + uColor2 * c2p
          + vec4(c3p * uColor3.rgb, c3p * uColor1.a)
        ) + light;
}

void main() {
    vec2 uv = vUv * iResolution.xy;
    gl_FragColor = effect(iResolution.xy, uv);
}
`;

function hexToVec4(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    return [r, g, b, 1.0];
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vert, frag) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vert);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, frag);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

export function initBalatroBg(container) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) { console.warn('WebGL not supported'); return; }

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    // Full-screen triangle
    const verts = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const uvs   = new Float32Array([0, 0, 2, 0, 0, 2]);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    const uvLoc  = gl.getAttribLocation(program, 'uv');

    // Uniforms
    const U = {};
    [
        'iTime','iResolution','uSpinRotation','uSpinSpeed','uOffset',
        'uColor1','uColor2','uColor3','uContrast','uLighting',
        'uSpinAmount','uPixelFilter','uSpinEase','uIsRotate','uMouse'
    ].forEach(n => { U[n] = gl.getUniformLocation(program, n); });

    // --- Augment palette tuning ---
    // Color 1: deep indigo-navy tint (the dominant "pool")
    const c1 = hexToVec4('1a2a5e');   // midnight indigo
    // Color 2: royal blue / violet highlight
    const c2 = hexToVec4('3b55e6');   // royal blue
    // Color 3: pale lavender shimmer
    const c3 = hexToVec4('e8eaff');   // near-white indigo tint

    let mouse = [0.5, 0.5];
    let raf;
    let startTime = performance.now();

    function resize() {
        const w = container.offsetWidth;
        const h = container.offsetHeight;
        canvas.width  = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
    }

    function render(ts) {
        const t = (ts - startTime) * 0.001;

        gl.useProgram(program);

        // bind position
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        // bind uv
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.enableVertexAttribArray(uvLoc);
        gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

        const w = canvas.width, h = canvas.height;

        gl.uniform1f(U.iTime, t);
        gl.uniform3f(U.iResolution, w, h, w / h);
        gl.uniform1f(U.uSpinRotation, -2.0);
        gl.uniform1f(U.uSpinSpeed, 4.5);
        gl.uniform2f(U.uOffset, 0.0, 0.0);
        gl.uniform4fv(U.uColor1, c1);
        gl.uniform4fv(U.uColor2, c2);
        gl.uniform4fv(U.uColor3, c3);
        gl.uniform1f(U.uContrast, 2.2);
        gl.uniform1f(U.uLighting, 0.35);
        gl.uniform1f(U.uSpinAmount, 0.4);
        gl.uniform1f(U.uPixelFilter, 900.0);
        gl.uniform1f(U.uSpinEase, 1.0);
        gl.uniform1i(U.uIsRotate, 1);
        gl.uniform2f(U.uMouse, mouse[0], mouse[1]);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(render);
    }

    canvas.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    });

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    raf = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        canvas.remove();
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
    };
}
