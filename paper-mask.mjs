// Remove only edge-connected paper. Enclosed white fur and clothing stay opaque.
export function removeExteriorPaper(data,width,height){
 const total=width*height,seen=new Uint8Array(total),queue=new Uint32Array(total);let head=0,tail=0;
 const paper=i=>{const p=i*4;return data[p+3]===0||(data[p]>=235&&data[p+1]>=235&&data[p+2]>=235);};
 const add=i=>{if(!seen[i]&&paper(i)){seen[i]=1;queue[tail++]=i;}};
 for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}
 for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
 while(head<tail){const i=queue[head++],x=i%width;data[i*4+3]=0;if(x>0)add(i-1);if(x<width-1)add(i+1);if(i>=width)add(i-width);if(i+width<total)add(i+width);}
 return data;
}
export function solidInteriors(data){
 // Keep anti-aliased silhouette edges, but make filled interiors fully opaque.
 for(let i=3;i<data.length;i+=4)if(data[i]>=230)data[i]=255;
 return data;
}
