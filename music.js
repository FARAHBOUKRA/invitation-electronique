(function(){
  var KEY='wm_state';
  var N={C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392.0,A4:440.0,B4:493.88,C5:523.25,D5:587.33,E5:659.25,G5:783.99,
         C3:130.81,F3:174.61,G3:196.0,A3:220.0};
  var melody=[
    ['E5',1],['D5',1],['C5',1],['D5',1],['E5',1],['E5',1],['E5',2],
    ['D5',1],['D5',1],['D5',2],['E5',1],['G5',1],['G5',2],
    ['E5',1],['D5',1],['C5',1],['D5',1],['E5',1],['E5',1],['E5',1],['E5',1],
    ['D5',1],['D5',1],['E5',1],['D5',1],['C5',4]
  ];
  var bass=['C3','C3','A3','F3','C3','G3','C3','C3'];
  var beat=0.5, AHEAD=1.2;
  var ctx=null, master=null, timer=null, nextT=0, mi=0, bi=0, bc=0, on=false;

  function save(){try{sessionStorage.setItem(KEY,JSON.stringify({on:on,mi:mi,bi:bi,bc:bc}));}catch(e){}}
  function load(){try{return JSON.parse(sessionStorage.getItem(KEY));}catch(e){return null;}}

  function tone(freq,t,dur,type,vol){
    var o=ctx.createOscillator(), g=ctx.createGain();
    o.type=type; o.frequency.value=freq;
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(vol,t+0.015);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+0.05);
  }
  function schedule(){
    if(!ctx) return;
    while(nextT<ctx.currentTime+AHEAD){
      var m=melody[mi%melody.length], f=N[m[0]];
      tone(f,nextT,1.6,'triangle',0.20);
      tone(f*2,nextT,0.5,'sine',0.05);
      mi++;
      for(var i=0;i<m[1];i++){
        if(bc%4===0){tone(N[bass[bi%bass.length]],nextT+i*beat,2.0,'sine',0.16);bi++;}
        bc++;
      }
      nextT+=m[1]*beat;
    }
  }
  function setup(){
    var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return false;
    ctx=new AC(); master=ctx.createGain(); master.gain.value=0;
    var delay=ctx.createDelay(); delay.delayTime.value=0.32;
    var fb=ctx.createGain(); fb.gain.value=0.35;
    var wet=ctx.createGain(); wet.gain.value=0.45;
    master.connect(ctx.destination);
    master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
    return true;
  }
  function start(){
    if(!ctx && !setup()) return false;
    on=true;
    var p=ctx.resume(); if(p&&p.catch) p.catch(function(){});
    master.gain.setTargetAtTime(0.9,ctx.currentTime,0.5);
    nextT=ctx.currentTime+0.1; schedule();
    if(!timer) timer=setInterval(schedule,200);
    save(); return true;
  }
  function stop(){
    on=false; clearInterval(timer); timer=null; save();
    if(ctx){
      var c=ctx; master.gain.setTargetAtTime(0,c.currentTime,0.05);
      ctx=null; master=null;
      setTimeout(function(){try{c.close();}catch(e){}},500);
    }
  }
  function restore(){
    var s=load(); if(!s||!s.on) return false;
    mi=s.mi|0; bi=s.bi|0; bc=s.bc|0;
    return start();
  }
  function unlock(){ if(on&&ctx&&ctx.state!=='running'){ var p=ctx.resume(); if(p&&p.catch)p.catch(function(){}); } }
  ['click','touchend','keydown'].forEach(function(e){document.addEventListener(e,unlock);});
  window.addEventListener('pagehide',save);

  window.WeddingMusic={start:start,stop:stop,restore:restore,isOn:function(){return on;}};
})();