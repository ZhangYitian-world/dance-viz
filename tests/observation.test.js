import {test} from 'node:test';
import assert from 'node:assert/strict';
import {regionCenter,viewportTransform,stepTime,screenTrace} from '../src/observation.js';
test('frame stepping advances from exact and intermediate times and respects clip ends',()=>{
  assert.equal(stepTime(1,1,10),31/30);assert.equal(stepTime(1,-1,10),29/30);
  assert.equal(stepTime(1.01,-1,10),1);assert.equal(stepTime(1.01,1,10),31/30);
  assert.equal(stepTime(0,-1,10),0);assert.equal(stepTime(10,1,10),10);
  assert.equal(stepTime(.033333,1,10),2/30);assert.equal(stepTime(.066667,-1,10),1/30);
});
test('crop follows only reliable observed joints, including upper body',()=>{
  const screen=Array.from({length:33},()=>[.4,.6,.9]);
  assert.deepEqual(regionCenter(screen,'leftHand'),[.4,.6]);
  screen[15][2]=.1;assert.equal(regionCenter(screen,'leftHand'),null);
  screen[11]=[.2,.2,.9];screen[12]=[.6,.2,.9];screen[23]=[.2,.6,.9];screen[24]=[.6,.6,.9];
  assert.deepEqual(regionCenter(screen,'upper'),[.4,.4]);screen[24][0]=1.2;assert.equal(regionCenter(screen,'upper'),null);
});
test('video and overlay share one crop transform with letterboxing, mirror and bounded edges',()=>{
  assert.deepEqual(viewportTransform(800,400,400,400,1,[.1,.9]),{x:0,y:0,zoom:1});
  const a=viewportTransform(800,400,400,400,2,[.25,.5]);
  assert.equal(a.x+300*a.zoom,400);assert.equal(a.y+200*a.zoom,200);
  const b=viewportTransform(800,400,400,400,2,[.25,.5],true);assert.equal(b.x+500*b.zoom,400);
  const edge=viewportTransform(800,400,800,400,4,[0,0]);assert.equal(edge.x,0);assert.equal(edge.y,0);
});
test('2D trails break at their own missing points and image jumps, not unrelated depth faults',()=>{
  const frame=(t,x,c=.9)=>({t,unstable:true,screen:Array.from({length:33},()=>[x,.4,c])});
  const frames=[frame(0,.2),frame(.1,.21),frame(.2,.22)];assert.equal(screenTrace(.2,frames,15,1).length,3);
  frames[1].screen[27][2]=.1;assert.equal(screenTrace(.2,frames,15,1).length,3);assert.equal(screenTrace(.2,frames,27,1).length,1);
  frames[1].screen[15][0]=.9;assert.equal(screenTrace(.2,frames,15,1).length,1);
});
