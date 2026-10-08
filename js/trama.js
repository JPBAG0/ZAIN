/* ============================================================================
   ZAIN — trama de semitono para la foto de serigrafía (no necesitas editarlo)
   Adaptado de «Halftone» de Scrolltide: una rejilla de puntos girada 15° cuyo
   radio sigue el tono de la foto (el tono se toma al centro de cada celda y el
   radio va con raíz cuadrada para que el ÁREA del punto siga al tono, como en
   una prensa real). Al hacer scroll los puntos se achican y la trama se
   resuelve en la foto: la imagen «se imprime» mientras bajas.
   Si el navegador no tiene WebGL, se ve la foto normal.
   ============================================================================ */
(() => {
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const FS = `precision highp float;
uniform sampler2D u_img;
uniform vec2 u_res;
uniform vec2 u_cover;
uniform float u_mix;
uniform float u_dot;
uniform vec3 u_papel;
uniform vec3 u_tinta;
const float ANGLE = 0.26;
const float DOT_SIZE = 1.35;
mat2 rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 uvDe(vec2 px){
  vec2 uv = px / u_res;
  uv.y = 1.0 - uv.y;
  return 0.5 + (uv - 0.5) * u_cover;
}
float luz(vec3 c){return dot(c, vec3(0.2126,0.7152,0.0722));}
void main(){
  vec2 px = gl_FragCoord.xy;
  mat2 R = rot(ANGLE);
  vec2 g = (R * px) / u_dot;
  vec2 celda = fract(g) - 0.5;
  /* centro de la celda en píxeles: toda la celda usa el mismo tono y el punto sale redondo */
  vec2 centro = (floor(g) + 0.5) * u_dot * R;
  float tono = 1.0 - luz(texture2D(u_img, uvDe(centro)).rgb);
  float r = sqrt(clamp(tono, 0.0, 1.0)) * 0.5 * DOT_SIZE;
  float aa = max(1.5 / u_dot, 0.001);
  float tinta = smoothstep(r, r - aa, length(celda));
  vec3 trama = mix(u_papel, u_tinta, tinta);
  vec3 foto = texture2D(u_img, uvDe(px)).rgb;
  gl_FragColor = vec4(mix(trama, foto, u_mix), 1.0);
}`;

  const hex = (h) => {
    const n = parseInt(h.replace("#", ""), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };
  const css = getComputedStyle(document.documentElement);
  const PAPEL = hex(css.getPropertyValue("--algodon").trim() || "#f3f3f1");
  const TINTA = hex(css.getPropertyValue("--tinta").trim() || "#111113");

  function montar(fig) {
    const img = fig.querySelector("img");
    const cv = document.createElement("canvas");
    cv.className = "trama";
    cv.setAttribute("aria-hidden", "true");
    const gl = cv.getContext("webgl", { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) return;
    const sh = (t, src) => {
      const s = gl.createShader(t);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(pr, n);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const subir = () => {
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      } catch (e) {
        return false;
      }
      fig.appendChild(cv);
      fig.classList.add("con-trama");
      return true;
    };

    let W = 0;
    let H = 0;
    const medir = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = Math.round(fig.clientWidth * dpr);
      H = Math.round(fig.clientHeight * dpr);
      cv.width = W;
      cv.height = H;
      gl.viewport(0, 0, W, H);
      // como object-fit: cover
      const ai = img.naturalWidth / img.naturalHeight;
      const ac = W / H;
      gl.uniform2f(U("u_cover"), ai > ac ? ac / ai : 1, ai > ac ? 1 : ai / ac);
      gl.uniform2f(U("u_res"), W, H);
      gl.uniform3fv(U("u_papel"), PAPEL);
      gl.uniform3fv(U("u_tinta"), TINTA);
      ultimo = -1;
    };

    let ultimo = -1;
    let visible = false;
    let raf = 0;
    const dibujar = () => {
      raf = 0;
      const r = fig.getBoundingClientRect();
      const vh = innerHeight;
      // 0 cuando la foto asoma por abajo, 1 cuando su centro pasa el 45 % de la pantalla
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.55 + r.height * 0.5)));
      const q = Math.round(p * 400) / 400;
      if (q === ultimo) return;
      ultimo = q;
      const dpr = W / Math.max(1, fig.clientWidth);
      const suave = q * q * (3 - 2 * q);
      gl.uniform1f(U("u_dot"), (16 - 11 * suave) * dpr);
      gl.uniform1f(U("u_mix"), Math.min(1, Math.max(0, (suave - 0.55) / 0.4)));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      cv.style.opacity = suave > 0.97 ? "0" : "1";
    };
    const pedir = () => {
      if (visible && !raf) raf = requestAnimationFrame(dibujar);
    };

    const iniciar = () => {
      if (!subir()) return;
      medir();
      dibujar();
      addEventListener("scroll", pedir, { passive: true });
      addEventListener("resize", () => (medir(), pedir()));
      new IntersectionObserver(([en]) => {
        visible = en.isIntersecting;
        pedir();
      }).observe(fig);
    };
    if (img.complete && img.naturalWidth) iniciar();
    else img.addEventListener("load", iniciar, { once: true });
  }

  window.ZainTrama = { montar };
})();
