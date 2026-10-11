import {clamp,frameIndex} from './core.js';

export const JOINT_COLORS = {15:'#ffae57',16:'#ec7eb0',27:'#6fc9ed',28:'#aaa2ff'};
const regions={upper:[11,12,23,24],leftHand:[15],rightHand:[16],leftFoot:[27],rightFoot:[28]};
export function screenReliable(p){return Boolean(p&&p.every(Number.isFinite)&&p[2]>=.55&&p[0]>=0&&p[0]<=1&&p[1]>=0&&p[1]<=1);}
export function regionCenter(screen,region){
  const joints=regions[region];
  if(!joints||!joints.every(j=>screenReliable(screen?.[j])))return null;
  return [0,1].map(k=>joints.reduce((sum,j)=>sum+screen[j][k],0)/joints.length);
}
export function viewportTransform(width,height,videoWidth,videoHeight,zoom,center,mirror=false){
  if(!width||!height||!videoWidth||!videoHeight)return {x:0,y:0,zoom:1};
  const scale=Math.min(width/videoWidth,height/videoHeight),w=videoWidth*scale,h=videoHeight*scale;
  const z=clamp(zoom,1,4);
  const cx=clamp((width-w)/2+(mirror?1-center[0]:center[0])*w,width/(2*z),width-width/(2*z));
  const cy=clamp((height-h)/2+center[1]*h,height/(2*z),height-height/(2*z));
  return {x:width/2-z*cx,y:height/2-z*cy,zoom:z};
}
// These are 30 Hz observation steps, not the source video's encoded frame rate.
export function stepTime(time,direction,duration,fps=30){
  // Media currentTime may truncate a repeating 1/30 timestamp to microseconds.
  const frame=direction>0?Math.floor(time*fps+1e-4)+1:Math.ceil(time*fps-1e-4)-1;
  return clamp(frame/fps,0,duration);
}
export function screenTrace(t,frames,joint,seconds){
  const out=[];
  for(let i=frameIndex(t,frames);i>=0&&frames[i].t>=t-seconds;i--){
    const p=frames[i].screen?.[joint];
    if(!screenReliable(p))break;
    if(out.length&&Math.hypot(p[0]-out[0][0],p[1]-out[0][1])>.25)break;
    out.unshift(p);
  }
  return out;
}
