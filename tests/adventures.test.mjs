import test from 'node:test';
import assert from 'node:assert/strict';
import {phraseMatch,reviewSchedule,suitable,missions,roomItems} from '../lib/adventures.ts';
test('recognition matches ordered words, including repeated words only once',()=>{
 assert.equal(phraseMatch('Could I have a coffee, please?','Could I have a coffee please').percent,100);
 assert.deepEqual(phraseMatch('very very good','very good').matched,[true,false,true]);
 assert.equal(phraseMatch('a good day','day good a').percent,33);
 assert.equal(phraseMatch('hello','').percent,0);
});
test('reviews grow, cap at thirty days and return in ten minutes after a miss',()=>{
 assert.deepEqual(reviewSchedule(0,true,0),{interval:1,last:0,due:86400000});
 assert.equal(reviewSchedule(2,true,0).interval,4);
 assert.equal(reviewSchedule(30,true,0).interval,30);
 assert.deepEqual(reviewSchedule(8,false,100),{interval:0,last:100,due:600100});
});
test('mission gates and catalog identities stay consistent',()=>{
 assert.equal(suitable('A1','A2'),false);assert.equal(suitable('B2','A1'),true);
 assert.equal(new Set(missions.map(m=>m.id)).size,missions.length);
 assert.equal(new Set(roomItems.map(m=>m.id)).size,roomItems.length);
 assert.ok(missions.every(m=>m.goals.length===3&&m.reward===30));
});
