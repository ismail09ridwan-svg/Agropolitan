window.addLerehAdminLayers=async function(map,units){
'use strict';const status=document.getElementById('adminStatus'),select=document.getElementById('pilihAdmin'),districtCheck=document.getElementById('showDistrik'),villageCheck=document.getElementById('showKampung'),names=document.getElementById('showLabels');
try{
 const results=await Promise.all(['distrik','kampung'].map(async k=>{const r=await fetch('assets/'+k+'-yapsi-kaureh.geojson');if(!r.ok)throw Error(k);return r.json();}));
 map.createPane('kampungPane');map.getPane('kampungPane').style.zIndex=420;map.createPane('distrikPane');map.getPane('distrikPane').style.zIndex=430;
 const lookup=new Map(),labels=[];
 function popup(f,kind){const box=document.createElement('div'),h=document.createElement('strong');h.textContent=(kind==='distrik'?'Distrik ':'Kampung ')+f.properties.nama;box.append(h);for(const [title,key]of [['Distrik','distrik'],['Kabupaten','kabupaten'],['Provinsi','provinsi'],['Kode wilayah','kode'],['Catatan','catatan'],['Keterangan batas','keterangan_batas']]){if(f.properties[key]){const p=document.createElement('p');p.style.margin='5px 0';p.textContent=title+': '+f.properties[key];box.append(p);}}return box;}
 function create(data,kind,style){return L.geoJSON(data,{pane:kind==='distrik'?'distrikPane':'kampungPane',style,onEachFeature:(f,l)=>{l.bindPopup(popup(f,kind));l.bindTooltip((kind==='distrik'?'Distrik ':'')+f.properties.nama,{permanent:false,direction:'center',className:'region-label'});labels.push(l);lookup.set(kind+':'+f.properties.kode,{layer:l,kind});l.on('mouseover',()=>l.setStyle({weight:kind==='distrik'?4:3,fillOpacity:kind==='distrik'?0:.22}));l.on('mouseout',()=>l.setStyle(style(f)));}});}
 const districtStyle=()=>({color:'#7837a1',weight:3,fill:false,opacity:1});
 const villageStyle=f=>({color:f.properties.distrik==='Yapsi'?'#168477':'#b97420',weight:1.8,fillColor:f.properties.distrik==='Yapsi'?'#40aa94':'#e4ae50',fillOpacity:.12,opacity:.95});
 const district=create(results[0],'distrik',districtStyle),village=create(results[1],'kampung',villageStyle);
 district.addTo(map);village.addTo(map);if(!document.getElementById('showUnits').checked)map.removeLayer(units);
 function syncNames(){for(const l of labels){const text=l.getTooltip().getContent();l.unbindTooltip();l.bindTooltip(text,{permanent:names.checked,direction:'center',className:'region-label'});}}syncNames();names.addEventListener('change',syncNames);
 const groups=[['Distrik',results[0],'distrik'],['Kampung di Yapsi',results[1].features.filter(f=>f.properties.distrik==='Yapsi'),'kampung'],['Kampung di Kaureh',results[1].features.filter(f=>f.properties.distrik==='Kaureh'),'kampung']];
 for(const [title,data,kind]of groups){const group=document.createElement('optgroup');group.label=title;const features=Array.isArray(data)?data:data.features;for(const f of [...features].sort((a,b)=>a.properties.nama.localeCompare(b.properties.nama,'id'))){const option=document.createElement('option');option.value=kind+':'+f.properties.kode;option.textContent=f.properties.nama;group.append(option);}select.append(group);}
 districtCheck.disabled=false;villageCheck.disabled=false;select.disabled=false;
 districtCheck.addEventListener('change',()=>districtCheck.checked?district.addTo(map):map.removeLayer(district));villageCheck.addEventListener('change',()=>villageCheck.checked?village.addTo(map):map.removeLayer(village));
 function fit(){const b=L.latLngBounds([]);for(const group of [district,village,units])if(map.hasLayer(group))b.extend(group.getBounds());if(b.isValid())map.fitBounds(b.pad(.06));else map.fitBounds(district.getBounds().pad(.06));}
 select.addEventListener('change',()=>{const item=lookup.get(select.value);if(!item){fit();return;}const group=item.kind==='distrik'?district:village;const check=item.kind==='distrik'?districtCheck:villageCheck;if(!map.hasLayer(group)){group.addTo(map);check.checked=true;}map.fitBounds(item.layer.getBounds().pad(.12));item.layer.openPopup();});
 document.getElementById('fitGeo').addEventListener('click',()=>{select.value='';fit();});map.fitBounds(district.getBounds().pad(.06));
 status.textContent='Batas administrasi siap: 2 distrik dan 14 kampung. Klik wilayah atau pilih nama untuk melihat rinciannya.';
}catch(e){status.textContent='Batas distrik dan kampung belum berhasil dimuat. Muat ulang halaman untuk mencoba lagi; layer SPKT dan jalan masih tersedia.';}
};
