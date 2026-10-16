import {removeExteriorPaper,solidInteriors} from './paper-mask.mjs';
// Small self-contained 2D texture renderer. DOM buttons supply accessible hit targets.
export async function renderGarden(canvas,items,onReady){
 const assets=await Promise.all(['assets/garden-background.webp',...items.map(i=>i.asset)].map(src=>new Promise((res,rej)=>{let im=new Image;im.onload=()=>res(im);im.onerror=()=>rej(new Error('Missing artwork: '+src));im.src=src;})));
 for(let i=1;i<assets.length;i++){const im=assets[i],paper=document.createElement('canvas');paper.width=im.width;paper.height=im.height;const ctx=paper.getContext('2d');ctx.drawImage(im,0,0);const pixels=ctx.getImageData(0,0,im.width,im.height);if(items[i-1].asset.includes('-book'))removeExteriorPaper(pixels.data,im.width,im.height);solidInteriors(pixels.data);ctx.putImageData(pixels,0,0);assets[i]=paper;}
 const gl=canvas.getContext('webgl',{alpha:false,preserveDrawingBuffer:false});
 const positions=[[.05,.67,.38,.30],[.57,.65,.38,.32],[.08,.33,.28,.31],[.61,.32,.28,.32]];
 const slots=Object.fromEntries(items.map((it,k)=>[it.latin,positions[k]]));
 let draw;
 if(gl){
  const shader=(type,s)=>{let sh=gl.createShader(type);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));return sh;};
  let program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 p; attribute vec2 uv; varying vec2 v; void main(){gl_Position=vec4(p,0.,1.);v=uv;}'));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float; varying vec2 v; uniform sampler2D tex; void main(){gl_FragColor=texture2D(tex,v);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  const pb=gl.createBuffer(),ub=gl.createBuffer(),pa=gl.getAttribLocation(program,'p'),ua=gl.getAttribLocation(program,'uv');
  gl.bindBuffer(gl.ARRAY_BUFFER,ub);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(ua);gl.vertexAttribPointer(ua,2,gl.FLOAT,false,0,0);
  const textures=assets.map(im=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);return t;});
  function quad(t,x,y,w,h,blend=false){gl.bindTexture(gl.TEXTURE_2D,t);gl.bindBuffer(gl.ARRAY_BUFFER,pb);let a=x*2-1,b=1-y*2,c=(x+w)*2-1,d=1-(y+h)*2;gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([a,b,c,b,a,d,a,d,c,b,c,d]),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(pa);gl.vertexAttribPointer(pa,2,gl.FLOAT,false,0,0);if(blend){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);}else gl.disable(gl.BLEND);gl.drawArrays(gl.TRIANGLES,0,6);}
  draw=()=>{gl.viewport(0,0,canvas.width,canvas.height);quad(textures[0],0,0,1,1);items.forEach((it,k)=>{const q=fit(assets[k+1],slots[it.latin]);quad(textures[k+1],...q,true);});};
 }else{
  const cx=canvas.getContext('2d');draw=()=>{cx.globalCompositeOperation='source-over';cx.drawImage(assets[0],0,0,canvas.width,canvas.height);items.forEach((it,k)=>{const q=fit(assets[k+1],slots[it.latin]);cx.globalCompositeOperation='source-over';cx.drawImage(assets[k+1],q[0]*canvas.width,q[1]*canvas.height,q[2]*canvas.width,q[3]*canvas.height);});cx.globalCompositeOperation='source-over';};
 }
 function fit(im,s){let [x,y,w,h]=s;let ratio=(im.width/im.height)/1.5;if(w/h>ratio){let nw=h*ratio;x+=(w-nw)/2;w=nw;}else{let nh=w/ratio;y+=(h-nh)/2;h=nh;}return [x,y,w,h];}
 const resize=()=>{const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.floor(canvas.clientWidth*dpr));canvas.height=Math.max(1,Math.floor(canvas.clientWidth*2/3*dpr));draw();};
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();onReady(slots);return ()=>{observer.disconnect();if(gl){gl.getExtension('WEBGL_lose_context')?.loseContext();}};
}
