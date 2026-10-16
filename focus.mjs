export function hitClip(){return '';}
function inPolygon(poly,x,y){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
const inPaths=(paths,x,y)=>(paths||[]).some(poly=>inPolygon(poly,x,y));
const contains=(item,x,y)=>Math.abs(x-item.x)<=item.w/2&&Math.abs(y-item.y)<=item.h/2;
export function pickVisible(items,x,y){
 const hits=items.map(item=>{const front=inPaths(item.frontDetails,x,y);if(!front&&!contains(item,x,y))return null;if(!front&&(inPaths(item.occlusion,x,y)||(item.occludedBy||[]).some(id=>{const other=items.find(i=>i.id===id);return other&&contains(other,x,y)})))return null;return {item,order:front?10000:item.layer||Math.max(1,Math.floor(10000/(item.w*item.h)))};}).filter(Boolean).sort((a,b)=>b.order-a.order);
 return hits[0]?.item||null;
}
export function focusOverlay(items,selected){
 if(!selected)return '';
 const item=items.find(i=>i.latin===selected.latin);if(!item)return '';
 // Reveal a simple rectangle in the original opaque illustration.
 // No contour tracing, cloned figures or changes to scene depth.
 return `<svg class="scene-focus" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><mask id="scene-wash" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="white"/><rect class="focus-window" x="${item.x-item.w/2}" y="${item.y-item.h/2}" width="${item.w}" height="${item.h}" fill="black"/></mask></defs><rect width="100" height="100" fill="white" fill-opacity=".68" mask="url(#scene-wash)"/><rect class="focus-frame" x="${item.x-item.w/2}" y="${item.y-item.h/2}" width="${item.w}" height="${item.h}" fill="none" stroke="#b49169" stroke-width="1.5" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"/></svg>`;
}
