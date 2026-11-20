/* Named form fields can follow the author between devices. */
var DEVICE_DRAFT_FIELDS={
  timer:["qname"], rrm:["rrQ","rrGuest"], ttm:["topicInput","callName"],
  ah:["spkInput","wordInput"], gram:["spkInput","goodInput","slipInput"],
  seval:["evAddIn"], tteval:["evAddIn"], member:["guestIn","noteTo","noteText"],
  president:["gName","gFrom"], saa:["gName","gFrom"], coord:["memIn","memKind","coName"]
};
var DEVICE_SETTINGS=["theme","big","rrHere","rep"];
function deviceDraftKey(id){
  var context="";
  if(id==="callName") context=S.cur.id||"";
  if(id==="qname") context=L.tab;
  if(id==="goodInput"||id==="slipInput") context=L.gramSel||"";
  return "form|"+JSON.stringify([L.role,context,id]);
}
function deviceDraftValues(){
  var id=JSON.stringify([S.mid,nkey(draftOwner())]);
  L.deviceDraftValues=L.deviceDraftValues||{};
  return L.deviceDraftValues[id]||(L.deviceDraftValues[id]={});
}
function setDeviceDraft(key,value){
  deviceDraftValues()[key]=clone(value);
  saveL();
  queuePrivateDraft(draftOwner(),key,value);
}
function clearDeviceDraft(){
  Array.from(arguments).forEach(function(id){
    var key=deviceDraftKey(id);
    if(Object.hasOwn(deviceDraftValues(),key)) setDeviceDraft(key,null);
  });
}
function restoreDeviceForms(){
  var values=deviceDraftValues();
  (DEVICE_DRAFT_FIELDS[L.role]||[]).forEach(function(id){
    var key=deviceDraftKey(id), input=document.querySelector("#view #"+id);
    if(input&&document.activeElement!==input&&Object.hasOwn(values,key)){
      if(values[key]===null){
        input.value=input.tagName==="SELECT"?(input.options[0]||{}).value||"":input.defaultValue;
      } else input.value=values[key];
    }
  });
  var start=document.querySelector("#view #qstart");
  if(start) start.innerHTML=startLabel(L.tab);
}
function captureDeviceForm(event){
  var input=event.target, id=input.id;
  if((DEVICE_DRAFT_FIELDS[L.role]||[]).includes(id)) setDeviceDraft(deviceDraftKey(id),input.value);
}
function syncDeviceSettings(){
  Object.keys(deviceDraftValues()).filter(function(key){return key.startsWith("form|")||key.startsWith("setting|");}).forEach(function(key){
    var owner=draftOwner();
    if(!S.roleFields.some(function(r){return r.enc&&r.person===nkey(owner)&&r.key===key;})){
      queuePrivateDraft(owner,key,deviceDraftValues()[key]);
    }
  });
}
document.getElementById("view").addEventListener("input",captureDeviceForm,true);
document.addEventListener("change",function(e){
  if(e.target.id==="bigText") setDeviceDraft("setting|big",!!L.big);
  if(e.target.id==="rrHere") setDeviceDraft("setting|rrHere",!!L.rrHere);
  if(e.target.dataset.rep) setDeviceDraft("setting|rep|"+e.target.dataset.rep,!!e.target.checked);
});
document.addEventListener("click",function(e){
  if(e.target.closest("[data-theme-set]")) setDeviceDraft("setting|theme",L.theme);
});
