/* ---------- connection check: is this device ready for the meeting? ---------- */
var CC={rtt:{},sent:0,storage:null};
function relayStatus(){ try{ var m=Trystero.getRelaySockets(), k=Object.keys(m); return {open:k.filter(function(x){return m[x]&&m[x].readyState===1;}).length,total:k.length}; }catch(e){ return {open:0,total:0}; } }
function ccRows(){
  var rows=[], ok=function(b){return b?"ok":"no";};
  var online=navigator.onLine!==false; rows.push([ok(online),"Internet",online?"Online":"Offline — connecting to the meeting won’t work until it’s back"]);
  if(NET.mode){
    var rs=relayStatus(); rows.push([rs.open?"ok":"no","Connection relays",rs.open+" of "+rs.total+" reachable"+(rs.open?"":" — this network may block them; try mobile data")]);
    var pp=(NET.peers||[]).filter(function(p){return !p.me;});
    rows.push([pp.length?"ok":"warn","Meeting "+fmtCode(NET.code),pp.length?pp.length+" other device"+(pp.length===1?"":"s")+" connected":"No other devices yet — check the code, or that the host’s page is open"]);
    Object.keys(NET.info).forEach(function(pid){ var p=NET.info[pid], rt=CC.rtt[pid]; if(now()-p.last>20000) return;
      rows.push([rt==null?"warn":rt<1500?"ok":"warn","↔ "+(p.name||roleName(p.role)),rt==null?"Measuring…":rt+" ms round trip"+(rt>=1500?" (slow — updates may lag)":"")]); });
  } else rows.push(["warn","Meeting","Not connected to a meeting — join or host one, then run this check again"]);
  rows.push([ok(cryptoOK()),"Private feedback (encryption)",cryptoOK()?"Supported":"Not available here — open the app from the website link"]);
  rows.push(["wakeLock" in navigator?"ok":"warn","Keep screen awake","wakeLock" in navigator?"Supported (on while timing)":"Not supported — set the screen timeout longer on the Timer’s phone"]);
  rows.push([navigator.vibrate?"ok":"info","Vibration at signals",navigator.vibrate?"Supported":"Not on this device (iPhones don’t allow it)"]);
  var st=lsSet("speechcraftProbe"+NS,"1"); try{ localStorage.removeItem("speechcraftProbe"+NS); }catch(e){}
  rows.push([ok(st),"Saving on this device",st?(CC.storage?CC.storage:"Working"):"Blocked — private browsing? Data won’t survive closing the page"]);
  rows.push([isStandalone()?"ok":"info","Installed app",isStandalone()?"Opened as the installed app":"In the browser — ⋯ More → Install for a home-screen icon"]);
  rows.push(["info","Device",deviceInfo()+" · v"+APP_VERSION]);
  return rows;
}
function ccHTML(){
  var rows=ccRows(), bad=rows.filter(function(r){return r[0]==="no";}).length, warn=rows.filter(function(r){return r[0]==="warn";}).length;
  var ic={ok:"✅",no:"❌",warn:"⚠️",info:"ℹ️"};
  return '<div class="finhead"><h2 class="sec" style="margin:0">🔌 Connection check</h2><button class="btn ghost" id="ccClose">Close</button></div>'+
    '<div class="ccverdict '+(bad?"no":warn?"warn":"ok")+'">'+(bad?"❌ Not ready — fix the items marked ❌":warn?"⚠️ Mostly ready — see the ⚠️ items":"✅ Ready for the meeting")+'</div>'+
    '<table class="sumtable cct"><tbody>'+rows.map(function(r){ return '<tr><td>'+ic[r[0]]+'</td><td><b>'+esc(r[1])+'</b></td><td>'+esc(r[2])+'</td></tr>'; }).join("")+'</tbody></table>'+
    '<div class="row" style="margin-top:10px"><button class="btn primary" id="ccRun">↻ Check again</button><button class="btn" id="ccCopy">📋 Copy results</button></div>'+
    '<div class="saved" style="margin-top:6px">Run this on every phone during the dry run. Copy the results into 💬 Report a problem if something is ❌.</div>';
}
function ccMeasure(){
  CC.rtt={}; if(NET.room) sendAll({t:"pingrt",ts:now()});
  try{ if(navigator.storage&&navigator.storage.estimate) navigator.storage.estimate().then(function(e){ if(e&&e.quota) CC.storage="Working · "+Math.round((e.usage||0)/1024)+" KB used of "+Math.round(e.quota/1048576)+" MB"; renderCC(); }); }catch(e){}
}
function renderCC(){ var m=document.getElementById("ccModal"); if(m&&m.classList.contains("on")) document.getElementById("ccBox").innerHTML=ccHTML(); }
function openCC(){ document.getElementById("ccModal").classList.add("on"); ccMeasure(); renderCC(); setTimeout(renderCC,1500); setTimeout(renderCC,4000); }
(function(){
  var M=document.getElementById("ccModal");
  M.addEventListener("click",function(e){
    var t=e.target;
    if(t.id==="ccModal"||t.closest("#ccClose")){ M.classList.remove("on"); return; }
    if(t.closest("#ccRun")){ ccMeasure(); renderCC(); setTimeout(renderCC,1500); setTimeout(renderCC,4000); return; }
    if(t.closest("#ccCopy")){ copyText("Connection check — "+new Date().toLocaleString("en-AU")+"\n"+ccRows().map(function(r){return ({ok:"OK",no:"FAIL",warn:"WARN",info:"INFO"}[r[0]])+" · "+r[1]+": "+r[2];}).join("\n")); }
  });
  document.getElementById("ccBtn").addEventListener("click",openCC);
})();
