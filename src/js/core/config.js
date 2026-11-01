(function(){
"use strict";
var GROUP="Dijital Team Colombo";
var NS=(function(){ try{ var a=new URLSearchParams(location.search).get("as"); return a?"."+a.replace(/[^a-z0-9]/gi,""):""; }catch(e){ return ""; } })();
var KEY="speechcraftMeeting.v2"+NS, LKEY="speechcraftMeeting.local"+NS, OLDKEY="speechcraftTimerLog.v1", OLDNAMES="speechcraftTimerLog.names";
var SESSIONS=[{id:"tt",name:"Table Topics",type:"std"},{id:"ps",name:"Prepared Speech",type:"std"},{id:"rr",name:"Round Robin",type:"rr"},{id:"ev",name:"Evaluations",type:"std"},{id:"rep",name:"Role reports",type:"rep"}];
var ROLES=[{id:"coord",name:"Speechcraft Coordinator",icon:"🗂"},{id:"president",name:"President",icon:"🔔"},{id:"tmod",name:"Toastmaster of the Day",icon:"🎩"},{id:"ge",name:"General Evaluator",icon:"🧭"},{id:"timer",name:"Timer",icon:"⏱"},{id:"ttm",name:"Table Topics Master",icon:"🎤"},{id:"rrm",name:"Round Robin Master",icon:"🔁"},{id:"ah",name:"Ah-Counter",icon:"🔢"},{id:"gram",name:"Grammarian",icon:"📝"},{id:"saa",name:"Sergeant at Arms",icon:"🛎"},{id:"speaker",name:"Speaker",icon:"🎙"},{id:"seval",name:"Speech Evaluator",icon:"🗣"},{id:"tteval",name:"Table Topics Evaluator",icon:"💬"},{id:"member",name:"Participant",icon:"🙋"}];
var FILLERS=["Um","Ah","Er","So","Like","And","You know","Repeat"];
var COLLS=[["rows","tt"],["rows","ps"],["rows","rr"],["rows","ev"],["rows","rep"],["topics"],["ahRows"],["gramRows"],["evals"],["notes"],["votes"],["rrq"],["speeches"],["assigns"],["rsvp"],["fin"],["guests"],["ttassign"]];
var MEETING_LWW=["meta","cur","gram","agenda","run","vote","genotes","rrcur","wrap","pres","saa"], KEEP_LWW=["limits","fill","members","pin"];

