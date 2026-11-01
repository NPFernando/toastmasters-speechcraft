/* ---------- new meeting, backup, restore ---------- */
function addDaysISO(iso,d){ var m=String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/); if(!m) return ""; var x=new Date(+m[1],+m[2]-1,+m[3]+d); return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0"); }
function nextWeek(w){ var m=String(w).match(/^Week (\d+) of (\d+)$/); if(!m) return ""; return +m[1]<+m[2]?"Week "+(+m[1]+1)+" of "+m[2]:"Graduation"; }
function bumpNum(t){ var m=String(t).match(/^(.*?)(\d+)(\D*)$/); if(!m) return t; var n=String(+m[2]+1); while(n.length<m[2].length) n="0"+n; return m[1]+n+m[3]; }
function newMeetingCore(carry){
  autoSaveRecord("Before new meeting");
  var keep={people:S.people,peopleU:S.peopleU,limits:S.limits,fill:S.fill,members:S.members,pin:S.pin,agenda:S.agenda};
  var n=blank(); n.people=keep.people; n.peopleU=keep.peopleU; n.limits=keep.limits; n.fill=keep.fill; n.members=keep.members; n.pin=keep.pin; n.attend=S.attend; n.keys=S.keys; n.coorg=S.coorg; n.ideas=S.ideas; n.tpls=S.tpls;
  n.agenda=clone(keep.agenda); n.agenda.ktopic=""; n.agenda.korg=""; n.agenda.u=now();
  if(carry){
    n.assigns=clone(S.assigns||[]);
    var nd=S.agenda.next||(S.meta.date?addDaysISO(S.meta.date,7):""); if(nd) n.meta.date=nd;
    n.meta.week=nextWeek(S.meta.week||""); n.agenda.no=bumpNum(S.agenda.no||""); n.agenda.next=nd?addDaysISO(nd,7):""; n.meta.u=now();
  } else { n.agenda.assign={}; n.agenda.no=""; n.agenda.next=""; }
  S=n; L.ahSel=null; L.gramSel=null; saveL(); lastSig={}; commit(); wake();
}
document.getElementById("newMeeting").addEventListener("click",function(){
  if(!confirm("Start a new meeting?\n\nThis clears speakers, times, topics, counts and this week's role players"+(NET.mode?" on all connected devices":"")+". The member list, agenda layout, time limits and word lists are kept.")) return;
  var carry=confirm("Carry this week over as next week's draft?\n\nOK = keep the role players and speaker/evaluator pairs to edit, and move the date, week and meeting number on\nCancel = start with empty role players");
  newMeetingCore(carry);
});
document.getElementById("backupBtn").addEventListener("click",function(){
  var data={app:"speechcraft-meeting",version:2,savedAt:new Date().toISOString(),state:S};
  var blob=new Blob([JSON.stringify(data,null,1)],{type:"application/json"});
  var wk=(S.meta.week||"").replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"");
  var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="Speechcraft-meeting-record-"+(S.meta.date||todayISO())+(wk?"-"+wk:"")+".json";
  document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1000);
  setSaved("Meeting record downloaded");
});
document.getElementById("restoreBtn").addEventListener("click",function(){ var f=document.getElementById("restoreFile"); f.value=""; f.click(); });
document.getElementById("restoreFile").addEventListener("change",function(){
  var f=this.files&&this.files[0]; if(!f) return; var rd=new FileReader();
  rd.onload=function(){
    var data; try{ data=JSON.parse(rd.result); }catch(e){ alert("That file isn't a Speechcraft backup."); return; }
    restoreData(data);
  };
  rd.readAsText(f);
});
function restoreData(data){ (function(){
    var st=null;
    if(data&&data.app==="speechcraft-meeting"&&data.state) st=data.state;
    else if(data&&data.app==="speechcraft-timer"&&data.state){ var o=data.state; st=blank(); st.meta.week=(o.meta&&o.meta.session)||""; st.meta.date=(o.meta&&o.meta.date)||todayISO(); st.people.timer=(o.meta&&o.meta.timer)||""; if(o.limits) st.limits=Object.assign(st.limits,o.limits); ["tt","ps","rr"].forEach(function(k){ st.rows[k]=((o.rows&&o.rows[k])||[]).map(function(r,i){return Object.assign({},r,{id:String(r.id),ord:i+1,u:1});}); }); st.names=data.names||[]; }
    if(!st){ alert("That file isn't a Speechcraft backup."); return; }
    st=normalize(st);
    var cnt=0; SESSIONS.forEach(function(s){ cnt+=st.rows[s.id].length; });
    var when=data.savedAt?new Date(data.savedAt).toLocaleString("en-AU",{dateStyle:"medium",timeStyle:"short"}):"unknown date";
    if(!confirm("Restore backup saved "+when+" ("+(st.meta.week||"no week set")+", "+cnt+" timed speakers, "+st.topics.length+" topics)?\n\nThis replaces the current meeting"+(NET.mode?" on all connected devices":"")+". Saved names are merged.")) return;
    var names=S.names; st.mid=uid(); st.midU=now(); S=st; names.forEach(function(n){ addName(S,n); });
    lastSig={}; commit(); wake(); setSaved("Meeting record restored");
  })(); }

