export const patientCrop=[.255,.08,.25,.82];
export function sceneView(set,target,mode){
 const close=set.id==='body'&&mode==='find'&&set.items.slice(0,10).some(i=>i.latin===target?.latin);
 const crop=set.crop||(close?patientCrop:null);
 if(!close)return {crop,items:set.items};
 const [x,y,w,h]=crop;
 const polygons=polys=>polys?.map(poly=>poly.map(([px,py])=>[(px/100-x)/w*100,(py/100-y)/h*100]));
 return {crop,items:set.items.map(i=>({...i,x:(i.x/100-x)/w*100,y:(i.y/100-y)/h*100,w:i.w/w,h:i.h/h,outline:polygons(i.outline),occlusion:polygons(i.occlusion),frontDetails:polygons(i.frontDetails)}))};
}
