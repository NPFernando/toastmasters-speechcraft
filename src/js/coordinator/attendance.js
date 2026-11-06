/* ---------- attendance grid for the Coordinator ---------- */
function attendanceHTML(){
  var mids=[], seen={};
  attendLive().slice().sort(function(a,b){ return String(a.date).localeCompare(String(b.date)); }).forEach(function(a){ if(!seen[a.mid]){ seen[a.mid]={mid:a.mid,label:a.week?a.week.replace(" of 10",""):(a.date||"?")}; mids.push(seen[a.mid]); } });
  if(!seen[S.mid]) mids.push({mid:S.mid,label:(S.meta.week||"Today").replace(" of 10","")});
  var ms=uniq(meetingNames().concat(attendLive().map(function(a){return a.name;})));
  var h='<section class="card" style="margin-top:12px"><h2 class="sec" style="margin-top:0">✅ Attendance <span class="cnt">tap a name in the last column to mark today</span></h2><div style="overflow-x:auto"><table class="sumtable"><thead><tr><th>Member</th>'+mids.map(function(m){return '<th>'+esc(m.label)+'</th>';}).join("")+'<th>Total</th></tr></thead><tbody>';
  ms.forEach(function(n){
    var tot=0;
    h+='<tr><td>'+esc(n)+'</td>'+mids.map(function(m){ var p=present(n,m.mid); if(p) tot++; return m.mid===S.mid?'<td><button class="chip'+(p?' active':'')+'" data-checkin="'+esc(n)+'">'+(p?'✓':'–')+'</button></td>':'<td>'+(p?'✓':'')+'</td>'; }).join("")+'<td><b>'+tot+'</b></td></tr>';
  });
  return h+'</tbody></table></div></section>';
}

