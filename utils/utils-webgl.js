function createProgram(gl, vertCode, fragCode) {
    // Vertex shader source code
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);


    //Fragment shader source code
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);


    // Create a shader program object to store combined shader program
    const _prom = gl.createProgram();
    gl.attachShader(_prom, vertShader);
    gl.attachShader(_prom, fragShader);
    gl.linkProgram(_prom);
    if (!gl.getProgramParameter(_prom, gl.LINK_STATUS)) {

        if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
            const message = gl.getShaderInfoLog(vertShader);
            if (message.length > 0) throw message;
        }

        if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
            const message = gl.getShaderInfoLog(fragShader);
            if (message.length > 0) throw message;
        }

        const info = gl.getProgramInfoLog(_prom);
        if (info.length > 0) throw info;
    }
    return _prom;
}

function createTexture(gl, src, textureUnit = 0) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = function() {
            const texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0 + textureUnit);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

            const levels = Math.floor(Math.log2(Math.max(image.width, image.height))) + 1;
            gl.texStorage2D(gl.TEXTURE_2D, levels, gl.RGBA8, image.width, image.height);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, image.width, image.height, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);

            resolve(texture);
        }

        image.onerror = function() {
            reject('onerror from image');
            throw 'onerror from image';
        }

        image.src = src;
    });
}

/**
 * data: ArrayBuffer|TypedArray
 */
function createBuffer(gl, target, data, mode = undefined) {
    let _data;
    if (data instanceof Array) {
        _data = new Float32Array(data);
    }
    const _buf = gl.createBuffer();
    gl.bindBuffer(target, _buf);
    gl.bufferData(target, _data, mode ?? gl.STATIC_DRAW);
    gl.bindBuffer(target, null);
    return _buf;
}

/**
 * color: [r,g,b,a] or {r:g:b:a:}
 */
function setupBasicState(
    gl,
    width, height,
    clearColor = [0.5, 0.5, 0.5, 1],
    clearStencil = 0
) {
    gl.viewport(0, 0, width, height);
    if (clearColor instanceof Array) {
        gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    } else {
        gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
    }
    gl.clearStencil(clearStencil);
}

function resizeCanvas(canvas, w, h) {
    canvas.width = w;
    canvas.height = h ?? w;
}

globalThis.WebGLUtil = {
    setupBasicState,
    createBuffer,
    createProgram,
    createTexture,
    resizeCanvas,
}

