export function shuffle(xs,random=Math.random){const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function round(items,count=8,random=Math.random){return shuffle(items,random).slice(0,count);}
export function choices(target,items,random=Math.random){const labels=[...new Set(items.map(x=>x.english))].filter(x=>x!==target.english);return shuffle([target.english,...shuffle(labels,random).slice(0,3)],random);}
export function correct(target,answer,kind){return kind==='words'?answer===target.english:answer.latin===target.latin;}
