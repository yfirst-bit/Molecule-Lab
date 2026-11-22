const $ = id => document.getElementById(id);
const canvas = $('moleculeCanvas'), ctx = canvas.getContext('2d');
const state = { bonds:4, lone:0, atom:'C', bondedAtom:'F', style:'ball', labels:true, pairs:true, angles:true, rotX:-.35, rotY:.55, zoom:1, dragging:false, lastX:0, lastY:0, preset:'tetrahedral' };
const presets = {
  linear:{b:2,e:0,name:'Linear',electron:'Linear',angle:'180°',desc:'Two bonding groups point in opposite directions.',theory:'Two electron groups repel each other and settle on opposite sides of the central atom, producing a linear arrangement.',formula:'AX₂',icon:'↔'},
  'trigonal-planar':{b:3,e:0,name:'Trigonal planar',electron:'Trigonal planar',angle:'120°',desc:'Three bonding groups form a flat triangular arrangement.',theory:'Three electron groups spread out evenly in one plane, creating ideal bond angles of 120°.',formula:'AX₃',icon:'△'},
  tetrahedral:{b:4,e:0,name:'Tetrahedral',electron:'Tetrahedral',angle:'109.5°',desc:'Four bonding groups arrange symmetrically around the central atom.',theory:'The four electron groups repel each other equally, creating a tetrahedral arrangement that keeps them as far apart as possible.',formula:'AX₄',icon:'◇'},
  'trigonal-pyramidal':{b:3,e:1,name:'Trigonal pyramidal',electron:'Tetrahedral',angle:'≈107°',desc:'Three bonds and one lone pair create a pyramid-like molecular shape.',theory:'One lone pair occupies an electron-group position. Its stronger repulsion pushes the bonding pairs closer together, reducing the bond angle.',formula:'AX₃E',icon:'△'},
  bent:{b:2,e:2,name:'Bent',electron:'Tetrahedral',angle:'≈104.5°',desc:'Two bonds and two lone pairs create a V-shaped molecule.',theory:'Two lone pairs repel the bonding pairs strongly, pushing the two bonds closer together and creating a bent shape.',formula:'AX₂E₂',icon:'∠'},
  'trigonal-bipyramidal':{b:5,e:0,name:'Trigonal bipyramidal',electron:'Trigonal bipyramidal',angle:'90°, 120°',desc:'Five groups occupy three equatorial and two axial positions.',theory:'Five electron groups arrange in a trigonal bipyramidal pattern, with three equatorial groups and two axial groups.',formula:'AX₅',icon:'✧'},
  octahedral:{b:6,e:0,name:'Octahedral',electron:'Octahedral',angle:'90°',desc:'Six bonding groups point toward the vertices of an octahedron.',theory:'Six electron groups arrange in three perpendicular axes, producing 90-degree angles between adjacent groups.',formula:'AX₆',icon:'✣'}
};
const molecules=[
  {name:'Carbon dioxide',formula:'CO₂',shape:'linear',b:2,e:0,atom:'C',symbol:'O=C=O',desc:'A linear molecule with two double bonds.'},
  {name:'Boron trifluoride',formula:'BF₃',shape:'trigonal-planar',b:3,e:0,atom:'B',symbol:'BF₃',desc:'Three bonding groups in one plane.'},
  {name:'Methane',formula:'CH₄',shape:'tetrahedral',b:4,e:0,atom:'C',symbol:'CH₄',desc:'Four equivalent C–H bonds.'},
  {name:'Ammonia',formula:'NH₃',shape:'trigonal-pyramidal',b:3,e:1,atom:'N',symbol:'NH₃',desc:'One lone pair on nitrogen.'},
  {name:'Water',formula:'H₂O',shape:'bent',b:2,e:2,atom:'O',symbol:'H₂O',desc:'Two lone pairs on oxygen.'},
  {name:'Phosphorus pentachloride',formula:'PCl₅',shape:'trigonal-bipyramidal',b:5,e:0,atom:'P',symbol:'PCl₅',desc:'Five bonding groups around phosphorus.'},
  {name:'Sulfur hexafluoride',formula:'SF₆',shape:'octahedral',b:6,e:0,atom:'S',symbol:'SF₆',desc:'Six equivalent S–F bonds.'},
  {name:'Xenon tetrafluoride',formula:'XeF₄',shape:'octahedral',b:4,e:2,atom:'Xe',symbol:'XeF₄',desc:'Four bonds and two lone pairs.'},
  {name:'Hydrogen sulfide',formula:'H₂S',shape:'bent',b:2,e:2,atom:'S',symbol:'H₂S',desc:'A bent molecule with two lone pairs.'}
];
// Full periodic-table data: atomic number, symbol, name, group, period, approximate relative mass.
const elementRows = [
[1,'H','Hydrogen',1,1,'1.008'],[2,'He','Helium',18,1,'4.003'],[3,'Li','Lithium',1,2,'6.94'],[4,'Be','Beryllium',2,2,'9.012'],[5,'B','Boron',13,2,'10.81'],[6,'C','Carbon',14,2,'12.011'],[7,'N','Nitrogen',15,2,'14.007'],[8,'O','Oxygen',16,2,'15.999'],[9,'F','Fluorine',17,2,'18.998'],[10,'Ne','Neon',18,2,'20.180'],
[11,'Na','Sodium',1,3,'22.990'],[12,'Mg','Magnesium',2,3,'24.305'],[13,'Al','Aluminium',13,3,'26.982'],[14,'Si','Silicon',14,3,'28.085'],[15,'P','Phosphorus',15,3,'30.974'],[16,'S','Sulfur',16,3,'32.06'],[17,'Cl','Chlorine',17,3,'35.45'],[18,'Ar','Argon',18,3,'39.948'],
[19,'K','Potassium',1,4,'39.098'],[20,'Ca','Calcium',2,4,'40.078'],[21,'Sc','Scandium',3,4,'44.956'],[22,'Ti','Titanium',4,4,'47.867'],[23,'V','Vanadium',5,4,'50.942'],[24,'Cr','Chromium',6,4,'51.996'],[25,'Mn','Manganese',7,4,'54.938'],[26,'Fe','Iron',8,4,'55.845'],[27,'Co','Cobalt',9,4,'58.933'],[28,'Ni','Nickel',10,4,'58.693'],[29,'Cu','Copper',11,4,'63.546'],[30,'Zn','Zinc',12,4,'65.38'],[31,'Ga','Gallium',13,4,'69.723'],[32,'Ge','Germanium',14,4,'72.630'],[33,'As','Arsenic',15,4,'74.922'],[34,'Se','Selenium',16,4,'78.971'],[35,'Br','Bromine',17,4,'79.904'],[36,'Kr','Krypton',18,4,'83.798'],
[37,'Rb','Rubidium',1,5,'85.468'],[38,'Sr','Strontium',2,5,'87.62'],[39,'Y','Yttrium',3,5,'88.906'],[40,'Zr','Zirconium',4,5,'91.224'],[41,'Nb','Niobium',5,5,'92.906'],[42,'Mo','Molybdenum',6,5,'95.95'],[43,'Tc','Technetium',7,5,'98'],[44,'Ru','Ruthenium',8,5,'101.07'],[45,'Rh','Rhodium',9,5,'102.906'],[46,'Pd','Palladium',10,5,'106.42'],[47,'Ag','Silver',11,5,'107.868'],[48,'Cd','Cadmium',12,5,'112.414'],[49,'In','Indium',13,5,'114.818'],[50,'Sn','Tin',14,5,'118.710'],[51,'Sb','Antimony',15,5,'121.760'],[52,'Te','Tellurium',16,5,'127.60'],[53,'I','Iodine',17,5,'126.904'],[54,'Xe','Xenon',18,5,'131.293'],
[55,'Cs','Caesium',1,6,'132.905'],[56,'Ba','Barium',2,6,'137.327'],[57,'La','Lanthanum',3,6,'138.905'],[58,'Ce','Cerium',4,8,'140.116'],[59,'Pr','Praseodymium',5,8,'140.908'],[60,'Nd','Neodymium',6,8,'144.242'],[61,'Pm','Promethium',7,8,'145'],[62,'Sm','Samarium',8,8,'150.36'],[63,'Eu','Europium',9,8,'151.964'],[64,'Gd','Gadolinium',10,8,'157.25'],[65,'Tb','Terbium',11,8,'158.925'],[66,'Dy','Dysprosium',12,8,'162.500'],[67,'Ho','Holmium',13,8,'164.930'],[68,'Er','Erbium',14,8,'167.259'],[69,'Tm','Thulium',15,8,'168.934'],[70,'Yb','Ytterbium',16,8,'173.045'],[71,'Lu','Lutetium',17,8,'174.967'],[72,'Hf','Hafnium',4,6,'178.49'],[73,'Ta','Tantalum',5,6,'180.948'],[74,'W','Tungsten',6,6,'183.84'],[75,'Re','Rhenium',7,6,'186.207'],[76,'Os','Osmium',8,6,'190.23'],[77,'Ir','Iridium',9,6,'192.217'],[78,'Pt','Platinum',10,6,'195.084'],[79,'Au','Gold',11,6,'196.967'],[80,'Hg','Mercury',12,6,'200.592'],[81,'Tl','Thallium',13,6,'204.38'],[82,'Pb','Lead',14,6,'207.2'],[83,'Bi','Bismuth',15,6,'208.980'],[84,'Po','Polonium',16,6,'209'],[85,'At','Astatine',17,6,'210'],[86,'Rn','Radon',18,6,'222'],
[87,'Fr','Francium',1,7,'223'],[88,'Ra','Radium',2,7,'226'],[89,'Ac','Actinium',3,7,'227'],[90,'Th','Thorium',4,9,'232.038'],[91,'Pa','Protactinium',5,9,'231.036'],[92,'U','Uranium',6,9,'238.029'],[93,'Np','Neptunium',7,9,'237'],[94,'Pu','Plutonium',8,9,'244'],[95,'Am','Americium',9,9,'243'],[96,'Cm','Curium',10,9,'247'],[97,'Bk','Berkelium',11,9,'247'],[98,'Cf','Californium',12,9,'251'],[99,'Es','Einsteinium',13,9,'252'],[100,'Fm','Fermium',14,9,'257'],[101,'Md','Mendelevium',15,9,'258'],[102,'No','Nobelium',16,9,'259'],[103,'Lr','Lawrencium',17,9,'266'],[104,'Rf','Rutherfordium',4,7,'267'],[105,'Db','Dubnium',5,7,'268'],[106,'Sg','Seaborgium',6,7,'269'],[107,'Bh','Bohrium',7,7,'270'],[108,'Hs','Hassium',8,7,'277'],[109,'Mt','Meitnerium',9,7,'278'],[110,'Ds','Darmstadtium',10,7,'281'],[111,'Rg','Roentgenium',11,7,'282'],[112,'Cn','Copernicium',12,7,'285'],[113,'Nh','Nihonium',13,7,'286'],[114,'Fl','Flerovium',14,7,'289'],[115,'Mc','Moscovium',15,7,'290'],[116,'Lv','Livermorium',16,7,'293'],[117,'Ts','Tennessine',17,7,'294'],[118,'Og','Oganesson',18,7,'294']
];
const metalloids = new Set(['B','Si','Ge','As','Sb','Te','Po']);
const nonmetals = new Set(['H','C','N','O','P','S','Se']);
const halogens = new Set(['F','Cl','Br','I','At','Ts']);
const nobleGases = new Set(['He','Ne','Ar','Kr','Xe','Rn','Og']);
function elementCategory(el){if(el.n>=89&&el.n<=103)return 'Actinide';if(el.n>=58&&el.n<=71)return 'Lanthanide';if(metalloids.has(el.s))return 'Metalloid';if(halogens.has(el.s))return 'Halogen';if(nobleGases.has(el.s))return 'Noble gas';if(nonmetals.has(el.s))return 'Nonmetal';if(el.g===1)return 'Alkali metal';if(el.g===2)return 'Alkaline earth metal';if(el.g>=3&&el.g<=12)return 'Transition metal';if(el.g>=13)return 'Post-transition metal';return 'Element';}
function valenceCount(el){if(el.p>=8)return 'Variable';if(el.g===18)return el.s==='He'?2:8;if(el.g>=13)return el.g-10;if(el.g===1||el.g===2)return el.g;if(el.g>=3&&el.g<=12)return 'Variable';return '—';}
const elements=elementRows.map(([n,s,name,g,p,m])=>({n,s,name,g,p,m,cat:elementCategory({n,s,g}),v:valenceCount({n,s,g})}));
let selectedElement=elements.find(e=>e.s==='C');
function shellDistribution(n){const orbitals=[['1s',2],['2s',2],['2p',6],['3s',2],['3p',6],['4s',2],['3d',10],['4p',6],['5s',2],['4d',10],['5p',6],['6s',2],['4f',14],['5d',10],['6p',6],['7s',2],['5f',14],['6d',10],['7p',6]];const shells=[0,0,0,0,0,0,0];let left=n;for(const [orb,cap] of orbitals){if(left<=0)break;const take=Math.min(cap,left);shells[Number(orb[0])-1]+=take;left-=take;}return shells.filter((v,i)=>v>0||i<Math.ceil(n/18)).join(', ');}
function selectElement(el){selectedElement=el;document.querySelectorAll('.element-cell').forEach(b=>b.classList.toggle('selected',Number(b.dataset.atomic)===el.n));$('detailNumber').textContent=el.n;$('detailSymbol').textContent=el.s;$('detailName').textContent=el.name;$('detailTitle').textContent=`${el.name} (${el.s})`;$('detailAtomic').textContent=el.n;$('detailMass').textContent=el.m;$('detailPosition').textContent=`${el.p>=8?'f-block':el.g} / ${el.p===8?6:el.p===9?7:el.p}`;$('detailValence').textContent=el.v;$('detailCategory').textContent=el.cat;$('detailShells').textContent=shellDistribution(el.n);}
function renderPeriodicTable(filter=''){
 const grid=$('periodicGrid');const q=filter.trim().toLowerCase();const filtered=elements.filter(e=>!q||e.s.toLowerCase().includes(q)||e.name.toLowerCase().includes(q)||String(e.n)===q);
 $('elementCount').textContent=`${filtered.length} / 118 elements`;
 if(q){grid.classList.add('filtered');grid.innerHTML=filtered.map(el=>elementCell(el)).join('')||'<p class="periodic-note">No matching element found.</p>';}
 else{
  grid.classList.remove('filtered');let html='';for(let period=1;period<=7;period++){for(let group=1;group<=18;group++){let el=elements.find(e=>e.p===period&&e.g===group);if(el)html+=elementCell(el,group,period);else html+='<div class="element-cell empty" aria-hidden="true"></div>';}}
  html+='<div class="series-label" style="grid-column:1 / 3;grid-row:8">LANTHANIDES</div>';elements.filter(e=>e.p===8).forEach((el,i)=>html+=elementCell(el,i+3,8));
  html+='<div class="series-label" style="grid-column:1 / 3;grid-row:9">ACTINIDES</div>';elements.filter(e=>e.p===9).forEach((el,i)=>html+=elementCell(el,i+3,9));grid.innerHTML=html;
 }
 grid.querySelectorAll('.element-cell:not(.empty)').forEach(btn=>btn.addEventListener('click',()=>selectElement(elements.find(e=>e.n===Number(btn.dataset.atomic)))));
}
function elementCell(el,col,row){const pos=col&&row?`style="grid-column:${col};grid-row:${row}"`:'';const cls=({'Alkali metal':'alkali','Alkaline earth metal':'alkaline','Transition metal':'transition','Post-transition metal':'post','Metalloid':'metalloid','Nonmetal':'nonmetal','Halogen':'halogen','Noble gas':'noble','Lanthanide':'lanth','Actinide':'act'}[el.cat]||'');return `<button class="element-cell ${cls}" ${pos} data-atomic="${el.n}" title="${el.name} · ${el.n}"><span class="el-num">${el.n}</span><strong>${el.s}</strong><small>${el.name}</small></button>`;}
$('elementSearch').addEventListener('input',e=>renderPeriodicTable(e.target.value));
function addElementOption(selectId,el){const select=$(selectId);let opt=Array.from(select.options).find(o=>o.value===el.s);if(!opt){opt=document.createElement('option');opt.value=el.s;opt.textContent=`${el.name} (${el.s})`;select.appendChild(opt);}select.value=el.s;}
$('useElementBtn').onclick=()=>{state.atom=selectedElement.s;addElementOption('centralAtom',selectedElement);draw();showTab('model');};
$('useBondElementBtn').onclick=()=>{state.bondedAtom=selectedElement.s;addElementOption('bondedAtom',selectedElement);draw();showTab('model');};
$('bondedAtom').onchange=e=>{state.bondedAtom=e.target.value;draw();};
renderPeriodicTable();selectElement(selectedElement);


function vec(x,y,z){return{x,y,z}}
function normalize(v){let m=Math.hypot(v.x,v.y,v.z)||1;return vec(v.x/m,v.y/m,v.z/m)}
function dot(a,b){return a.x*b.x+a.y*b.y+a.z*b.z}
function makeDirections(b,e){
  const total=b+e, raw=[];
  if(total===2) raw.push(vec(1,0,0),vec(-1,0,0));
  else if(total===3) for(let i=0;i<3;i++){let a=2*Math.PI*i/3;raw.push(vec(Math.cos(a),Math.sin(a),0))}
  else if(total===4) raw.push(vec(1,1,1),vec(1,-1,-1),vec(-1,1,-1),vec(-1,-1,1));
  else if(total===5){raw.push(vec(0,0,1),vec(0,0,-1));for(let i=0;i<3;i++){let a=2*Math.PI*i/3;raw.push(vec(Math.cos(a),Math.sin(a),0))}}
  else {raw.push(vec(1,0,0),vec(-1,0,0),vec(0,1,0),vec(0,-1,0),vec(0,0,1),vec(0,0,-1))}
  return raw.slice(0,total).map(normalize);
}
function rotate(v){let cy=Math.cos(state.rotY),sy=Math.sin(state.rotY),cx=Math.cos(state.rotX),sx=Math.sin(state.rotX);let x=v.x*cy-v.z*sy,z=v.x*sy+v.z*cy,y=v.y*cx-z*sx;z=v.y*sx+z*cx;return vec(x,y,z)}
function project(v,w,h){let r=rotate(v),scale=105*state.zoom,depth=1+r.z*.16;return{x:w/2+r.x*scale*depth,y:h/2-r.y*scale*depth,z:r.z,depth}}
function resize(){let r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=r.width*dpr;canvas.height=r.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
function sphere(x,y,r,colors){let g=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.08,x,y,r);g.addColorStop(0,colors[0]);g.addColorStop(.55,colors[1]);g.addColorStop(1,colors[2]);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=1;ctx.stroke()}
function draw(){
 const w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);
 // subtle orbital grid
 ctx.save();ctx.strokeStyle='rgba(111,151,181,.09)';ctx.lineWidth=1;for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(w/2,h/2,70+i*35,25+i*13,state.rotY*.2,0,Math.PI*2);ctx.stroke()}ctx.restore();
 const dirs=makeDirections(state.bonds,state.lone),items=dirs.map((d,i)=>({d,p:project(d,w,h),i,isLone:i>=state.bonds}));
 const center={x:w/2,y:h/2,z:0,depth:1};let atoms=items.filter(o=>!o.isLone);
 // bonds behind atoms
 atoms.forEach(o=>{ctx.beginPath();ctx.moveTo(center.x,center.y);ctx.lineTo(o.p.x,o.p.y);ctx.strokeStyle='rgba(119,190,212,.72)';ctx.lineWidth=state.style==='space'?10:5;ctx.lineCap='round';ctx.stroke();if(state.style==='ball'){ctx.strokeStyle='rgba(225,250,255,.2)';ctx.lineWidth=1.3;ctx.stroke()}});
 // lone pairs as paired lobes
 if(state.pairs) items.filter(o=>o.isLone).forEach(o=>{let x=o.p.x,y=o.p.y;ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(y-center.y,x-center.x));ctx.fillStyle='rgba(169,155,255,.18)';ctx.strokeStyle='#b5a8ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,19,10,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#b5a8ff';ctx.beginPath();ctx.arc(-5,0,3,0,Math.PI*2);ctx.arc(5,0,3,0,Math.PI*2);ctx.fill();ctx.restore()});
 // angle guide
 if(state.angles&&atoms.length>=2){let p1=atoms[0].p,p2=atoms[1].p;ctx.strokeStyle='rgba(255,190,108,.8)';ctx.lineWidth=1.4;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(center.x,center.y,39,Math.atan2(center.y-p1.y,p1.x-center.x),Math.atan2(center.y-p2.y,p2.x-center.x));ctx.stroke();ctx.setLineDash([])}
 // draw atoms back to front
 items.filter(o=>!o.isLone).sort((a,b)=>a.p.z-b.p.z).forEach(o=>{let r=state.style==='space'?30:19;sphere(o.p.x,o.p.y,r,['#d6ffff','#42bfd2','#155a78']);if(state.labels){ctx.font='bold 11px DM Sans';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#06202c';ctx.fillText(state.bondedAtom,o.p.x,o.p.y)}});
 sphere(center.x,center.y,state.style==='space'?37:25,['#fff0c9','#e6a84f','#855124']);ctx.font='bold 13px DM Sans';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#38220b';ctx.fillText(state.atom,center.x,center.y);
 if(state.labels){ctx.font='10px DM Mono';ctx.fillStyle='#dbe8fa';ctx.fillText('CENTRAL ATOM',center.x,center.y+42)}
 if(state.angles&&atoms.length>=2){ctx.font='10px DM Mono';ctx.fillStyle='#ffc47c';ctx.fillText(getData().angle,w/2+43,h/2-35)}
}
function getData(){let key=state.bonds+'-'+state.lone;let map={'2-0':'linear','3-0':'trigonal-planar','4-0':'tetrahedral','3-1':'trigonal-pyramidal','2-2':'bent','5-0':'trigonal-bipyramidal','6-0':'octahedral','4-2':'octahedral'};let p=presets[map[key]];if(p)return p;let total=state.bonds+state.lone;return{name:'Custom geometry',electron:({2:'Linear',3:'Trigonal planar',4:'Tetrahedral',5:'Trigonal bipyramidal',6:'Octahedral'}[total]||'Custom'),angle:'Varies',desc:'This is a custom electron-group arrangement.',theory:'Electron groups repel each other. The arrangement depends on the total number of bonding groups and lone pairs.',formula:`AX${state.bonds}E${state.lone}`,icon:'✧'}}
function update(){
 $('bondCount').textContent=$('bondValue').textContent=state.bonds;$('loneCount').textContent=$('loneValue').textContent=state.lone;
 const d=getData(),total=state.bonds+state.lone;
 $('geometryName').textContent=d.name;$('geometryDesc').textContent=d.desc;$('electronGroups').textContent=total;$('electronGeometry').textContent=d.electron;$('bondAngle').textContent=d.angle;$('theoryText').textContent=d.theory;$('geometryIcon').textContent=d.icon;$('modelBadge').textContent=`${d.formula} · ${d.name.toUpperCase()}`;
 $('presetSelect').value=Object.keys(presets).find(k=>presets[k]===d)||'custom';draw();
}
function setModel(b,e,atom='C',preset='custom'){state.bonds=b;state.lone=e;state.atom=atom;state.preset=preset;$('centralAtom').value=atom;update()}
$('bondMinus').onclick=()=>{if(state.bonds>1){state.bonds--;update()}};
$('bondPlus').onclick=()=>{if(state.bonds+state.lone<6){state.bonds++;update()}};
$('loneMinus').onclick=()=>{if(state.lone>0){state.lone--;update()}};
$('lonePlus').onclick=()=>{if(state.bonds+state.lone<6){state.lone++;update()}};
$('centralAtom').onchange=e=>{state.atom=e.target.value;draw()};
$('presetSelect').onchange=e=>{if(e.target.value!=='custom'){let p=presets[e.target.value];setModel(p.b,p.e,state.atom,e.target.value)}};
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{let p=presets[b.dataset.preset];setModel(p.b,p.e,'C',b.dataset.preset);showTab('model')});
document.querySelectorAll('[data-style]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-style]').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.style=b.dataset.style;draw()});
[['labelsBtn','labels'],['pairsBtn','pairs'],['angleBtn','angles']].forEach(([id,key])=>$(id).onclick=()=>{state[key]=!state[key];$(id).classList.toggle('active',state[key]);draw()});
$('resetBtn').onclick=()=>{state.rotX=-.35;state.rotY=.55;state.zoom=1;draw()};
$('centerBtn').onclick=()=>{state.rotX=-.35;state.rotY=.55;state.zoom=1;draw()};
canvas.addEventListener('pointerdown',e=>{state.dragging=true;state.lastX=e.clientX;state.lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!state.dragging)return;state.rotY+=(e.clientX-state.lastX)*.009;state.rotX+=(e.clientY-state.lastY)*.009;state.lastX=e.clientX;state.lastY=e.clientY;draw()});
canvas.addEventListener('pointerup',()=>state.dragging=false);canvas.addEventListener('pointercancel',()=>state.dragging=false);
canvas.addEventListener('wheel',e=>{e.preventDefault();state.zoom=Math.max(.55,Math.min(1.7,state.zoom+(e.deltaY<0?.08:-.08)));draw()},{passive:false});
function showTab(tab){document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));['model','periodic','molecules','bonding','polarity','challenge'].forEach(t=>$(t+'Tab').classList.toggle('hidden',t!==tab));$('crumb').textContent=tab.toUpperCase();const titles={model:['Molecular geometry','Build a molecule and explore its three-dimensional shape.'],periodic:['Periodic table','Explore all 118 elements and choose atoms for your model.'],molecules:['Molecule library','Explore common molecules and their VSEPR geometries.'],bonding:['Chemical bonds','Explore ionic, covalent, and coordinate covalent bonding.'],polarity:['Polarity lab','Understand electronegativity, bond dipoles, and molecular polarity.'],challenge:['Shape challenge','Apply what you know about electron-group repulsion.']};$('pageTitle').textContent=titles[tab][0];$('pageSubtitle').textContent=titles[tab][1]}
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
$('moleculeGrid').innerHTML=molecules.map((m,i)=>`<button class="molecule-card" data-mol="${i}"><div class="molecule-symbol">${m.symbol}</div><h3>${m.name}</h3><p>${m.desc}</p><span>${m.formula} · ${presets[m.shape].name}</span></button>`).join('');
document.querySelectorAll('[data-mol]').forEach(b=>b.onclick=()=>{let m=molecules[+b.dataset.mol];setModel(m.b,m.e,m.atom,m.shape);showTab('model')});
let challenge;
function newChallenge(){let choices=['linear','trigonal-planar','tetrahedral','trigonal-pyramidal','bent','trigonal-bipyramidal','octahedral'];challenge=choices[Math.floor(Math.random()*choices.length)];$('challengeTarget').textContent=presets[challenge].name;$('challengeFormula').textContent=presets[challenge].formula;$('challengeFeedback').textContent='';}
$('newChallenge').onclick=newChallenge;
$('checkChallenge').onclick=()=>{let d=getData();$('challengeFeedback').textContent=d.name===presets[challenge].name?'Correct! Your electron-group arrangement matches the target.':'Not quite. Adjust the bonding groups and lone pairs, then try again.'};
function help(open){$('helpModal').classList.toggle('hidden',!open)}
$('helpBtn').onclick=()=>help(true);$('closeHelp').onclick=$('gotIt').onclick=()=>help(false);$('helpModal').onclick=e=>{if(e.target===$('helpModal'))help(false)};

const bondLessons = {
 ionic:{
  title:'Ikatan ion',desc:'Ikatan ion terbentuk ketika satu atau lebih elektron berpindah dari atom logam ke atom nonlogam. Atom yang melepas elektron menjadi kation, sedangkan atom yang menerima elektron menjadi anion. Gaya tarik elektrostatik antara ion bermuatan berlawanan mempertahankan kisi ion.',
  examples:{
   NaCl:{name:'Natrium klorida (NaCl)',visual:'<div class="atom-node positive">Na⁺<small>kation</small></div><span class="bond-symbol">⋯</span><div class="atom-node negative">Cl⁻<small>anion</small></div>',facts:[['Perpindahan elektron','Na melepas 1 elektron; Cl menerima 1 elektron.'],['Ion yang terbentuk','Na⁺ dan Cl⁻'],['Perbandingan ion','1 : 1']],note:'Contoh sederhana pembentukan ion. Dalam padatan, NaCl tersusun sebagai kisi kristal ion, bukan molekul NaCl tunggal.'},
   MgO:{name:'Magnesium oksida (MgO)',visual:'<div class="atom-node positive">Mg²⁺<small>kation</small></div><span class="bond-symbol">⋯</span><div class="atom-node negative">O²⁻<small>anion</small></div>',facts:[['Perpindahan elektron','Mg melepas 2 elektron; O menerima 2 elektron.'],['Ion yang terbentuk','Mg²⁺ dan O²⁻'],['Perbandingan ion','1 : 1']],note:'Muatan total senyawa harus netral: +2 dan −2 saling menyeimbangkan.'},
   MgCl2:{name:'Magnesium klorida (MgCl₂)',visual:'<div class="atom-node positive">Mg²⁺<small>kation</small></div><span class="bond-symbol">⋯</span><div class="atom-node negative">Cl⁻<small>anion</small></div><span class="bond-symbol">+</span><div class="atom-node negative">Cl⁻<small>anion</small></div>',facts:[['Perpindahan elektron','Mg melepas 2 elektron; dua atom Cl masing-masing menerima 1.'],['Ion yang terbentuk','Mg²⁺ dan 2Cl⁻'],['Perbandingan ion','1 : 2']],note:'Dua ion Cl⁻ diperlukan untuk menyeimbangkan satu ion Mg²⁺.'}
  }
 },
 covalent:{
  title:'Ikatan kovalen',desc:'Ikatan kovalen terbentuk ketika dua atom (umumnya nonlogam) menggunakan bersama satu atau lebih pasangan elektron untuk mencapai konfigurasi elektron yang lebih stabil.',
  examples:{
   H2:{name:'Hidrogen (H₂)',visual:'<div class="atom-node">H</div><span class="bond-symbol">—</span><div class="atom-node">H</div>',facts:[['Jenis ikatan','Kovalen tunggal'],['Pasangan elektron ikatan','1 pasangan elektron dipakai bersama'],['Kepolaran ikatan','Nonpolar (atom sejenis)']],note:'Satu garis pada struktur Lewis mewakili satu pasangan elektron ikatan.'},
   O2:{name:'Oksigen (O₂)',visual:'<div class="atom-node">O</div><span class="bond-symbol">=</span><div class="atom-node">O</div>',facts:[['Jenis ikatan','Kovalen rangkap dua'],['Pasangan elektron ikatan','2 pasangan elektron dipakai bersama'],['Kepolaran ikatan','Nonpolar (atom sejenis)']],note:'Dua garis pada O=O menunjukkan dua pasangan elektron ikatan.'},
   N2:{name:'Nitrogen (N₂)',visual:'<div class="atom-node">N</div><span class="bond-symbol">≡</span><div class="atom-node">N</div>',facts:[['Jenis ikatan','Kovalen rangkap tiga'],['Pasangan elektron ikatan','3 pasangan elektron dipakai bersama'],['Kepolaran ikatan','Nonpolar (atom sejenis)']],note:'Ikatan rangkap tiga terdiri atas tiga pasangan elektron ikatan.'}
  }
 },
 coordinate:{
  title:'Ikatan kovalen koordinasi',desc:'Ikatan kovalen koordinasi adalah ikatan kovalen ketika pasangan elektron yang digunakan bersama berasal dari satu atom donor. Setelah terbentuk, ikatannya merupakan ikatan kovalen.',
  examples:{
   NH4:{name:'Ion amonium (NH₄⁺)',visual:'<div class="atom-node">N</div><span class="bond-symbol">→</span><div class="atom-node positive">H⁺</div>',facts:[['Donor pasangan elektron','Atom N pada NH₃'],['Akseptor','Ion H⁺'],['Hasil','Ion amonium, NH₄⁺']],note:'Panah pada N → H⁺ menunjukkan asal pasangan elektron saat ikatan koordinasi terbentuk. Dalam NH₄⁺, keempat ikatan N–H setara.'},
   H3O:{name:'Ion hidronium (H₃O⁺)',visual:'<div class="atom-node">O</div><span class="bond-symbol">→</span><div class="atom-node positive">H⁺</div>',facts:[['Donor pasangan elektron','Atom O pada H₂O'],['Akseptor','Ion H⁺'],['Hasil','Ion hidronium, H₃O⁺']],note:'Atom O menyumbangkan satu pasangan elektron bebas kepada H⁺.'}
  }
 }
};
const bondSelect=$('bondExample');
function renderBondType(type){
 document.querySelectorAll('[data-bondtype]').forEach(b=>b.classList.toggle('active',b.dataset.bondtype===type));
 const lesson=bondLessons[type];bondSelect.innerHTML=Object.keys(lesson.examples).map(k=>`<option value="${k}">${lesson.examples[k].name}</option>`).join('');
 renderBondExample(type,bondSelect.value);
}
function renderBondExample(type,key){
 const lesson=bondLessons[type],ex=lesson.examples[key];$('bondTitle').textContent=lesson.title;$('bondDescription').textContent=lesson.desc;$('bondVisual').innerHTML=ex.visual;$('bondFacts').innerHTML=ex.facts.map(f=>`<div class="bond-fact"><span>${f[0].toUpperCase()}</span><b>${f[1]}</b></div>`).join('');$('bondNote').textContent=ex.note;
}
document.querySelectorAll('[data-bondtype]').forEach(b=>b.onclick=()=>renderBondType(b.dataset.bondtype));
bondSelect.onchange=()=>{const active=document.querySelector('[data-bondtype].active').dataset.bondtype;renderBondExample(active,bondSelect.value)};
renderBondType('ionic');

const polarityData={
 HCl:{name:'HCl',atoms:['H','Cl'],polar:true,reason:'Cl lebih elektronegatif daripada H sehingga ikatan H–Cl memiliki dipol menuju Cl. Molekul diatomik ini polar.',caption:'DIPOL IKATAN MENUJU Cl'},
 Cl2:{name:'Cl₂',atoms:['Cl','Cl'],polar:false,reason:'Kedua atom sama dan memiliki keelektronegatifan sama. Tidak ada dipol ikatan, sehingga molekul nonpolar.',caption:'TIDAK ADA DIPOL IKATAN'},
 H2O:{name:'H₂O',atoms:['H','O','H'],polar:true,reason:'Ikatan O–H bersifat polar dan bentuk molekul H₂O bengkok. Kedua dipol tidak saling meniadakan sehingga resultannya tidak nol.',caption:'BENTUK BENGKOK · RESULTAN DIPOL ≠ 0'},
 CO2:{name:'CO₂',atoms:['O','C','O'],polar:false,reason:'Setiap ikatan C=O bersifat polar, tetapi molekul CO₂ berbentuk linear dan simetris. Kedua dipol berlawanan arah dan saling meniadakan.',caption:'LINEAR · DIPOL SALING MENIADAKAN'},
 NH3:{name:'NH₃',atoms:['H','N','H','H'],polar:true,reason:'Ikatan N–H bersifat polar dan bentuk molekul trigonal piramida. Resultan momen dipol tidak nol sehingga NH₃ polar.',caption:'TRIGONAL PIRAMIDA · POLAR'},
 CH4:{name:'CH₄',atoms:['H','C','H','H','H'],polar:false,reason:'Ikatan C–H memiliki perbedaan keelektronegatifan kecil. Susunan tetrahedral yang simetris membuat resultan dipol saling meniadakan; CH₄ nonpolar.',caption:'TETRAHEDRAL SIMETRIS · NONPOLAR'}
};
function renderPolarity(){
 const d=polarityData[$('polarityExample').value];const diagram=$('polarityDiagram');
 let visual='';
 if(d.name==='HCl')visual='<div class="polarity-atom">H δ⁺</div><span class="dipole-arrow">→</span><div class="polarity-atom high">Cl δ⁻</div>';
 else if(d.name==='Cl₂')visual='<div class="polarity-atom">Cl</div><span class="bond-symbol">—</span><div class="polarity-atom">Cl</div>';
 else if(d.name==='H₂O')visual='<div class="polarity-atom">H δ⁺</div><span class="dipole-arrow">↘</span><div class="polarity-atom high">O δ⁻</div><span class="dipole-arrow">↙</span><div class="polarity-atom">H δ⁺</div>';
 else if(d.name==='CO₂')visual='<div class="polarity-atom high">O δ⁻</div><span class="dipole-arrow">←</span><div class="polarity-atom">C δ⁺</div><span class="dipole-arrow">→</span><div class="polarity-atom high">O δ⁻</div>';
 else if(d.name==='NH₃')visual='<div class="polarity-atom">H δ⁺</div><span class="dipole-arrow">↘</span><div class="polarity-atom high">N δ⁻</div><span class="dipole-arrow">↙</span><div class="polarity-atom">H δ⁺</div>';
 else visual='<div class="polarity-atom">H</div><span class="bond-symbol">↗</span><div class="polarity-atom">C</div><span class="bond-symbol">↙</span><div class="polarity-atom">H</div>';
 diagram.innerHTML=visual+`<div class="polarity-caption">${d.caption}</div>`;
 $('polarityResult').textContent=d.polar?'Molekul polar':'Molekul nonpolar';
 $('polarityResult').style.color=d.polar?'#70e0b0':'#72dce8';
 $('polarityReason').textContent=d.reason;
}
$('polarityExample').onchange=renderPolarity;renderPolarity();

window.addEventListener('resize',resize);resize();update();newChallenge();

// ===== Extended SMA chemistry learning modules (v4) =====
const extraTabNames=['model','periodic','molecules','bonding','polarity','lewis','aufbau','ions','angles','compound','quiz'];
const extraTabTitles={
 model:['Molecular geometry','Build a molecule and explore its three-dimensional shape.'],periodic:['Periodic table','Explore all 118 elements and choose atoms for your model.'],molecules:['Molecule library','Explore common molecules and their VSEPR geometries.'],bonding:['Chemical bonds','Explore ionic, covalent, and coordinate covalent bonding.'],polarity:['Polarity lab','Explore bond dipoles and molecular polarity interactively.'],lewis:['Struktur Lewis','Lihat pasangan elektron ikatan dan pasangan elektron bebas.'],aufbau:['Konfigurasi Aufbau','Pelajari pengisian orbital berdasarkan urutan energi.'],ions:['Pembentukan ion','Ikuti proses perpindahan elektron hingga terbentuk ion.'],angles:['Sudut & pasangan elektron','Bandingkan geometri elektron, bentuk molekul, dan sudut ikatan.'],compound:['Custom senyawa','Pilih senyawa dari kombinasi yang sudah diperiksa.'],quiz:['Kuis interaktif','Modul kuis belum tersedia.']
};
showTab=function(tab){
 document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 extraTabNames.forEach(t=>{const el=$(t+'Tab');if(el)el.classList.toggle('hidden',t!==tab)});
 $('crumb').textContent=tab.toUpperCase();$('pageTitle').textContent=(extraTabTitles[tab]||extraTabTitles.model)[0];$('pageSubtitle').textContent=(extraTabTitles[tab]||extraTabTitles.model)[1];
};
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

// Lewis structures: a curated set of familiar, charge-consistent examples.
const lewisExamples={
 H2O:{formula:'H₂O',name:'Air',structure:'H — O — H',atoms:[['O','2 pasangan bebas','2 ikatan tunggal'],['H','0 pasangan bebas','1 ikatan']],note:'O memiliki 6 elektron valensi. Dua pasangan digunakan untuk dua ikatan O–H dan dua pasangan menjadi pasangan bebas.'},
 NH3:{formula:'NH₃',name:'Amonia',structure:'   H\n   |\nH — N — H',atoms:[['N','1 pasangan bebas','3 ikatan tunggal'],['H','0 pasangan bebas','1 ikatan']],note:'N memiliki 5 elektron valensi. Tiga elektron dipakai membentuk tiga ikatan N–H; tersisa satu pasangan elektron bebas.'},
 CH4:{formula:'CH₄',name:'Metana',structure:'   H\n   |\nH — C — H\n   |\n   H',atoms:[['C','0 pasangan bebas','4 ikatan tunggal'],['H','0 pasangan bebas','1 ikatan']],note:'C memiliki 4 elektron valensi dan membentuk empat ikatan kovalen tunggal sehingga mencapai oktet.'},
 CO2:{formula:'CO₂',name:'Karbon dioksida',structure:'O = C = O',atoms:[['C','0 pasangan bebas','2 ikatan rangkap'],['O','2 pasangan bebas per O','1 ikatan rangkap per O']],note:'C membentuk dua ikatan rangkap. Setiap O memiliki dua pasangan elektron bebas; C dan O memenuhi aturan oktet.'},
 HCl:{formula:'HCl',name:'Hidrogen klorida',structure:'H — Cl',atoms:[['H','0 pasangan bebas','1 ikatan tunggal'],['Cl','3 pasangan bebas','1 ikatan tunggal']],note:'H mencapai duplet, sedangkan Cl mencapai oktet dengan tiga pasangan bebas.'},
 O2:{formula:'O₂',name:'Oksigen',structure:'O = O',atoms:[['O','2 pasangan bebas per O','1 ikatan rangkap per O']],note:'Kedua atom O berbagi dua pasangan elektron. Masing-masing O memiliki dua pasangan bebas.'},
 N2:{formula:'N₂',name:'Nitrogen',structure:'N ≡ N',atoms:[['N','1 pasangan bebas per N','1 ikatan rangkap tiga per N']],note:'Tiga pasangan elektron digunakan bersama membentuk ikatan rangkap tiga; setiap N memiliki satu pasangan bebas.'},
 NH4:{formula:'NH₄⁺',name:'Ion amonium',structure:'   H\n   |\n[H — N — H]⁺\n   |\n   H',atoms:[['N','0 pasangan bebas','4 ikatan N–H']],note:'NH₃ menyumbangkan pasangan elektron bebas kepada H⁺. Setelah terbentuk, keempat ikatan N–H setara; ion keseluruhan bermuatan +1.'},
 H3O:{formula:'H₃O⁺',name:'Ion hidronium',structure:'   H\n   |\n[H — O — H]⁺',atoms:[['O','1 pasangan bebas','3 ikatan O–H']],note:'H₂O menyumbangkan satu pasangan elektron bebas kepada H⁺. O memiliki satu pasangan bebas dalam H₃O⁺.'},
 BF3:{formula:'BF₃',name:'Boron trifluorida',structure:'   F\n  /\nB — F\n  \\\n   F',atoms:[['B','0 pasangan bebas','3 ikatan tunggal'],['F','3 pasangan bebas per F','1 ikatan per F']],note:'BF₃ merupakan contoh pengecualian aturan oktet: B dikelilingi 6 elektron dalam model Lewis sederhana.'}
};
const lewisSelect=$('lewisExample');
lewisSelect.innerHTML=Object.entries(lewisExamples).map(([k,v])=>`<option value="${k}">${v.formula} — ${v.name}</option>`).join('');
function renderLewis(){const d=lewisExamples[lewisSelect.value];$('lewisCanvas').innerHTML=`<div class="lewis-formula">${d.formula}</div><pre class="lewis-structure">${d.structure}</pre><div class="lewis-atom-list">${d.atoms.map(a=>`<div><b>${a[0]}</b><span>${a[1]}</span><small>${a[2]}</small></div>`).join('')}</div>`;$('lewisSummary').textContent=d.note;}
lewisSelect.onchange=renderLewis;renderLewis();

// Aufbau filling to krypton, including the well-known Cr and Cu ground-state exceptions.
const orbitalOrder=[['1s',2],['2s',2],['2p',6],['3s',2],['3p',6],['4s',2],['3d',10],['4p',6]];
const aufbauSelect=$('aufbauElement');aufbauSelect.innerHTML=elements.filter(e=>e.n<=36).map(e=>`<option value="${e.n}">${e.n}. ${e.name} (${e.s})</option>`).join('');
function electronConfiguration(z){let remaining=z,occ={};for(const [orb,cap] of orbitalOrder){const n=Math.min(cap,remaining);occ[orb]=n;remaining-=n;}if(z===24)occ={'1s':2,'2s':2,'2p':6,'3s':2,'3p':6,'4s':1,'3d':5};if(z===29)occ={'1s':2,'2s':2,'2p':6,'3s':2,'3p':6,'4s':1,'3d':10};return occ;}
function renderAufbau(){const z=Number(aufbauSelect.value),el=elements.find(e=>e.n===z),occ=electronConfiguration(z);const config=orbitalOrder.filter(([o])=>occ[o]).map(([o])=>`${o}${['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹','¹⁰'][occ[o]]}`).join(' ');let html=`<div class="config-summary"><span>${el.name} (${el.s})</span><b>${config}</b></div><div class="orbital-grid">`;for(const [orb,cap] of orbitalOrder){if(!occ[orb])continue;const boxes=cap===2?1:cap===6?3:5;let e=occ[orb],arr=Array(boxes).fill('');for(let i=0;i<boxes&&e>0;i++){arr[i]='↑';e--;}for(let i=0;i<boxes&&e>0;i++){arr[i]+='↓';e--;}html+=`<div class="orbital-row"><b>${orb}</b><div>${arr.map(x=>`<span class="orbital-box">${x}</span>`).join('')}</div></div>`;}html+='</div>';if(z===24||z===29)html+=`<div class="lesson-note">Pengecualian konfigurasi dasar: ${z===24?'Cr: [Ar] 3d⁵ 4s¹':'Cu: [Ar] 3d¹⁰ 4s¹'}. Susunan ini lebih stabil daripada perkiraan pengisian sederhana.</div>`;$('aufbauResult').innerHTML=html;}
aufbauSelect.onchange=renderAufbau;aufbauSelect.value='6';renderAufbau();

// Guided ion formation steps with neutral atoms and charge-balanced products.
const ionLessons={
 NaCl:{atoms:[['Na','2, 8, 1','Na⁺','2, 8','melepas 1 e⁻'],['Cl','2, 8, 7','Cl⁻','2, 8, 8','menerima 1 e⁻']],formula:'NaCl',transfer:'Satu elektron dari Na berpindah ke Cl.',result:'Na⁺ + Cl⁻ → NaCl',note:'Muatan +1 dan −1 seimbang dalam perbandingan 1 : 1.'},
 MgO:{atoms:[['Mg','2, 8, 2','Mg²⁺','2, 8','melepas 2 e⁻'],['O','2, 6','O²⁻','2, 8','menerima 2 e⁻']],formula:'MgO',transfer:'Dua elektron dari Mg berpindah ke O.',result:'Mg²⁺ + O²⁻ → MgO',note:'Muatan +2 dan −2 seimbang dalam perbandingan 1 : 1.'},
 MgCl2:{atoms:[['Mg','2, 8, 2','Mg²⁺','2, 8','melepas 2 e⁻'],['2 Cl','2 × (2, 8, 7)','2 Cl⁻','2 × (2, 8, 8)','masing-masing menerima 1 e⁻']],formula:'MgCl₂',transfer:'Mg melepas dua elektron. Dua atom Cl masing-masing menerima satu elektron.',result:'Mg²⁺ + 2Cl⁻ → MgCl₂',note:'Satu Mg²⁺ membutuhkan dua Cl⁻ agar muatan total senyawa netral.'}
};let ionStep=0;
function renderIon(){const d=ionLessons[$('ionExample').value],steps=[`<div class="ion-atom neutral"><b>${d.atoms[0][0]}</b><small>Atom netral</small><span>${d.atoms[0][1]} e⁻</span></div><div class="ion-atom neutral"><b>${d.atoms[1][0]}</b><small>Atom netral</small><span>${d.atoms[1][1]} e⁻</span></div><p>Kedua atom masih netral: jumlah proton sama dengan jumlah elektron.</p>`,`<div class="ion-transfer"><div class="ion-atom positive"><b>${d.atoms[0][0]}</b><small>${d.atoms[0][4]}</small></div><div class="transfer-arrow">e⁻ ⟶</div><div class="ion-atom negative"><b>${d.atoms[1][0]}</b><small>${d.atoms[1][4]}</small></div></div><p>${d.transfer}</p>`,`<div class="ion-atom positive"><b>${d.atoms[0][2]}</b><small>Kation</small><span>${d.atoms[0][3]} e⁻</span></div><div class="ion-atom negative"><b>${d.atoms[1][2]}</b><small>Anion</small><span>${d.atoms[1][3]} e⁻</span></div><h3>${d.result}</h3><p>${d.note}</p>`];$('ionStage').innerHTML=`<div class="ion-step-title">${['1. Atom netral','2. Perpindahan elektron','3. Ion dan senyawa terbentuk'][ionStep]}</div><div class="ion-diagram">${steps[ionStep]}</div>`;$('ionStepLabel').textContent=`Langkah ${ionStep+1} dari 3`;$('ionPrev').disabled=ionStep===0;$('ionNext').textContent=ionStep===2?'Ulangi ↻':'Berikutnya →';}
$('ionExample').onchange=()=>{ionStep=0;renderIon()};$('ionPrev').onclick=()=>{ionStep=Math.max(0,ionStep-1);renderIon()};$('ionNext').onclick=()=>{ionStep=ionStep===2?0:ionStep+1;renderIon()};renderIon();

// VSEPR reference data: angles are typical/ideal teaching values, not universal constants.
const angleData={H2O:{formula:'H₂O',name:'Air',b:2,l:2,electron:'Tetrahedral',shape:'Bengkok',angle:'104,5°',why:'Dua pasangan bebas pada O menolak pasangan ikatan lebih kuat sehingga sudut H–O–H lebih kecil dari 109,5°.'},NH3:{formula:'NH₃',name:'Amonia',b:3,l:1,electron:'Tetrahedral',shape:'Trigonal piramida',angle:'≈107°',why:'Satu pasangan bebas pada N menekan tiga pasangan ikatan; sudut H–N–H sekitar 107°.'},CH4:{formula:'CH₄',name:'Metana',b:4,l:0,electron:'Tetrahedral',shape:'Tetrahedral',angle:'109,5°',why:'Empat pasangan ikatan setara tersusun tetrahedral dengan sudut ideal 109,5°.'},BF3:{formula:'BF₃',name:'Boron trifluorida',b:3,l:0,electron:'Trigonal planar',shape:'Trigonal planar',angle:'120°',why:'Tiga kelompok elektron berada pada satu bidang dengan sudut ideal 120°.'},CO2:{formula:'CO₂',name:'Karbon dioksida',b:2,l:0,electron:'Linear',shape:'Linear',angle:'180°',why:'Dua kelompok elektron di sekitar C tersusun berlawanan arah. Ikatan rangkap dihitung sebagai satu domain elektron dalam VSEPR.'},SF6:{formula:'SF₆',name:'Sulfur heksafluorida',b:6,l:0,electron:'Oktahedral',shape:'Oktahedral',angle:'90° dan 180°',why:'Enam kelompok ikatan tersusun pada enam arah; sudut antartetangga 90° dan pasangan berseberangan 180°.'},XeF4:{formula:'XeF₄',name:'Xenon tetrafluorida',b:4,l:2,electron:'Oktahedral',shape:'Planar persegi',angle:'90° dan 180°',why:'Enam domain elektron (4 ikatan + 2 pasangan bebas) tersusun oktahedral; pasangan bebas berseberangan sehingga bentuk molekul planar persegi.'}};
const angleSelect=$('angleExample');angleSelect.innerHTML=Object.entries(angleData).map(([k,d])=>`<option value="${k}">${d.formula} — ${d.name}</option>`).join('');
function renderAngle(){const d=angleData[angleSelect.value];$('angleVisual').innerHTML=`<div class="angle-molecule"><div class="angle-center">${d.formula}</div><div class="angle-shape">${d.shape}</div><div class="angle-angle">${d.angle}</div></div><div class="angle-explain">${d.why}</div>`;$('angleMetrics').innerHTML=[['Pasangan ikatan',d.b],['Pasangan bebas',d.l],['Total domain elektron',d.b+d.l],['Geometri elektron',d.electron],['Bentuk molekul',d.shape],['Sudut ikatan',d.angle]].map(x=>`<div><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');}
angleSelect.onchange=renderAngle;renderAngle();

// Compound builder deliberately exposes only reviewed examples; no arbitrary valence guessing.
const compoundData={H2O:{formula:'H₂O',kind:'kovalen',shape:'Bengkok · AX₂E₂',atoms:'2 H + 1 O',charge:'0',note:'Air; O memiliki dua pasangan bebas.',model:{b:2,e:2,atom:'O',preset:'bent'}},NH3:{formula:'NH₃',kind:'kovalen',shape:'Trigonal piramida · AX₃E',atoms:'3 H + 1 N',charge:'0',note:'Amonia; N memiliki satu pasangan bebas.',model:{b:3,e:1,atom:'N',preset:'trigonal-pyramidal'}},CH4:{formula:'CH₄',kind:'kovalen',shape:'Tetrahedral · AX₄',atoms:'4 H + 1 C',charge:'0',note:'Metana; empat pasangan ikatan di sekitar C.',model:{b:4,e:0,atom:'C',preset:'tetrahedral'}},CO2:{formula:'CO₂',kind:'kovalen',shape:'Linear · AX₂',atoms:'2 O + 1 C',charge:'0',note:'Karbon dioksida; dua ikatan rangkap dihitung sebagai dua domain elektron.',model:{b:2,e:0,atom:'C',preset:'linear'}},HCl:{formula:'HCl',kind:'kovalen polar',shape:'Linear / diatomik',atoms:'1 H + 1 Cl',charge:'0',note:'Hidrogen klorida; ikatan H–Cl polar.',model:{b:1,e:0,atom:'H',preset:'custom'}},BF3:{formula:'BF₃',kind:'kovalen',shape:'Trigonal planar · AX₃',atoms:'3 F + 1 B',charge:'0',note:'Boron trifluorida; contoh oktet tidak lengkap pada B.',model:{b:3,e:0,atom:'B',preset:'trigonal-planar'}},PCl5:{formula:'PCl₅',kind:'kovalen',shape:'Trigonal bipiramida · AX₅',atoms:'5 Cl + 1 P',charge:'0',note:'Fosfor pentaklorida; contoh molekul hipervalen pada pembahasan VSEPR SMA.',model:{b:5,e:0,atom:'P',preset:'trigonal-bipyramidal'}},SF6:{formula:'SF₆',kind:'kovalen',shape:'Oktahedral · AX₆',atoms:'6 F + 1 S',charge:'0',note:'Sulfur heksafluorida; enam domain ikatan.',model:{b:6,e:0,atom:'S',preset:'octahedral'}},NaCl:{formula:'NaCl',kind:'ionik',shape:'Kisi ion (bukan molekul VSEPR)',atoms:'Na⁺ : Cl⁻ = 1 : 1',charge:'0',note:'Satuan formula senyawa ion; tidak dimodelkan sebagai molekul diskret.',ion:'NaCl'},MgO:{formula:'MgO',kind:'ionik',shape:'Kisi ion (bukan molekul VSEPR)',atoms:'Mg²⁺ : O²⁻ = 1 : 1',charge:'0',note:'Muatan ion seimbang; tampilkan proses pembentukan di modul ion.',ion:'MgO'},MgCl2:{formula:'MgCl₂',kind:'ionik',shape:'Kisi ion (bukan molekul VSEPR)',atoms:'Mg²⁺ : Cl⁻ = 1 : 2',charge:'0',note:'Satu Mg²⁺ diseimbangkan oleh dua Cl⁻.',ion:'MgCl2'}};
const compoundSelect=$('compoundTemplate');compoundSelect.innerHTML=Object.entries(compoundData).map(([k,d])=>`<option value="${k}">${d.formula} — ${d.kind}</option>`).join('');
function renderCompound(){const d=compoundData[compoundSelect.value];$('compoundDetails').innerHTML=`<div class="compound-formula">${d.formula}</div><div class="compound-facts"><div><small>Jenis ikatan</small><b>${d.kind}</b></div><div><small>Komposisi</small><b>${d.atoms}</b></div><div><small>Muatan total</small><b>${d.charge}</b></div><div><small>Bentuk / susunan</small><b>${d.shape}</b></div></div><p>${d.note}</p>`;$('loadCompound').textContent=d.ion?'Buka proses pembentukan ion →':'Muat ke model geometri →';}
compoundSelect.onchange=renderCompound;renderCompound();$('loadCompound').onclick=()=>{const d=compoundData[compoundSelect.value];if(d.ion){$('ionExample').value=d.ion;ionStep=0;renderIon();showTab('ions');return;}const m=d.model;if(m){setModel(m.b,m.e,m.atom,m.preset);$('bondedAtom').value=compoundSelect.value==='BF3'||compoundSelect.value==='PCl5'||compoundSelect.value==='SF6'?'F':compoundSelect.value==='HCl'?'Cl':compoundSelect.value==='CO2'?'O':'H';state.bondedAtom=$('bondedAtom').value;draw();showTab('model');}};

// Interactive polarity sandbox: live ΔEN classification, separate from each molecule's fixed geometry.
function updateEnSandbox(){const a=Number($('enA').value),b=Number($('enB').value),d=Math.abs(a-b);$('enAValue').textContent=a.toFixed(1);$('enBValue').textContent=b.toFixed(1);$('enDelta').textContent=d.toFixed(1);let label=d<0.4?'Kovalen nonpolar / sangat lemah polar':d<1.7?'Kovalen polar':'Karakter ion kuat';$('enCharacter').textContent=label;$('enExplanation').textContent=d<0.4?'Elektronegativitas hampir sama; pasangan elektron relatif terbagi merata.':d<1.7?'Elektron lebih tertarik ke atom yang lebih elektronegatif sehingga muncul dipol ikatan.':'Perbedaan besar menunjukkan karakter ion yang kuat; batas ini hanya pedoman, bukan aturan mutlak.';}
$('enA').oninput=updateEnSandbox;$('enB').oninput=updateEnSandbox;updateEnSandbox();

// Draw explicit electron-dot pairs for the Lewis examples (schematic, not to scale).
const lewisVisuals={
 H2O:`<div class="lewis-visual horizontal"><span class="lewis-atom">H</span><span class="lewis-bond">—</span><span class="lewis-center"><i>••</i><b>O</b><i>••</i></span><span class="lewis-bond">—</span><span class="lewis-atom">H</span></div>`,
 NH3:`<div class="lewis-visual stack"><div><span class="lewis-atom">H</span><span class="lewis-bond">—</span><span class="lewis-center"><i>••</i><b>N</b></span><span class="lewis-bond">—</span><span class="lewis-atom">H</span></div><span class="lewis-bond vertical">│</span><span class="lewis-atom">H</span></div>`,
 CH4:`<div class="lewis-visual stack"><span class="lewis-atom">H</span><span class="lewis-bond vertical">│</span><div><span class="lewis-atom">H</span><span class="lewis-bond">—</span><b class="lewis-center"><b>C</b></b><span class="lewis-bond">—</span><span class="lewis-atom">H</span></div><span class="lewis-bond vertical">│</span><span class="lewis-atom">H</span></div>`,
 CO2:`<div class="lewis-visual horizontal"><span class="lewis-center"><i>••</i><b>O</b><i>••</i></span><span class="lewis-double">=</span><span class="lewis-atom">C</span><span class="lewis-double">=</span><span class="lewis-center"><i>••</i><b>O</b><i>••</i></span></div>`,
 HCl:`<div class="lewis-visual horizontal"><span class="lewis-atom">H</span><span class="lewis-bond">—</span><span class="lewis-center"><i>••</i><b>Cl</b><i>••</i><small>••</small></span></div>`,
 O2:`<div class="lewis-visual horizontal"><span class="lewis-center"><i>••</i><b>O</b><i>••</i></span><span class="lewis-double">=</span><span class="lewis-center"><i>••</i><b>O</b><i>••</i></span></div>`,
 N2:`<div class="lewis-visual horizontal"><span class="lewis-center"><i>••</i><b>N</b></span><span class="lewis-triple">≡</span><span class="lewis-center"><b>N</b><i>••</i></span></div>`,
 NH4:`<div class="lewis-visual stack"><span class="lewis-atom">H</span><span class="lewis-bond vertical">│</span><div><span class="lewis-atom">H</span><span class="lewis-bond">—</span><span class="lewis-atom">N</span><span class="lewis-bond">—</span><span class="lewis-atom">H</span></div><span class="lewis-bond vertical">│</span><span class="lewis-atom">H</span><b class="lewis-charge">+</b></div>`,
 H3O:`<div class="lewis-visual stack"><span class="lewis-atom">H</span><span class="lewis-bond vertical">│</span><div><span class="lewis-atom">H</span><span class="lewis-bond">—</span><span class="lewis-center"><i>••</i><b>O</b></span><span class="lewis-bond">—</span><span class="lewis-atom">H</span></div><b class="lewis-charge">+</b></div>`,
 BF3:`<div class="lewis-visual stack"><span class="lewis-center"><b>F</b><i>••</i><small>3 pasangan bebas</small></span><span class="lewis-bond vertical">│</span><div><span class="lewis-center"><b>F</b><i>••</i></span><span class="lewis-bond">—</span><span class="lewis-atom">B</span><span class="lewis-bond">—</span><span class="lewis-center"><b>F</b><i>••</i></span></div></div>`
};
const previousLewisRender=renderLewis;
renderLewis=function(){const key=lewisSelect.value,d=lewisExamples[key];$('lewisCanvas').innerHTML=`<div class="lewis-formula">${d.formula}</div>${lewisVisuals[key]||`<pre class="lewis-structure">${d.structure}</pre>`}<div class="lewis-atom-list">${d.atoms.map(a=>`<div><b>${a[0]}</b><span>${a[1]}</span><small>${a[2]}</small></div>`).join('')}</div>`;$('lewisSummary').textContent=d.note;};
renderLewis();
lewisSelect.onchange=renderLewis;
