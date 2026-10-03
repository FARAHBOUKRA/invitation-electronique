(function(){
  var MUSIC_URL='music.m4a';   // اسم ملف أغنيتك
  console.log('player.js محمّل، الأغنية: '+MUSIC_URL);

  var KEY='wm_state';
  var audio=new Audio(MUSIC_URL);
  audio.loop=true; audio.preload='auto'; audio.volume=0.8;
  audio.addEventListener('error',function(){console.log('تعذّر تحميل ملف الأغنية: '+MUSIC_URL);});
  var on=false;

  function save(){try{sessionStorage.setItem(KEY,JSON.stringify({on:on,t:audio.currentTime||0}));}catch(e){}}
  function load(){try{return JSON.parse(sessionStorage.getItem(KEY));}catch(e){return null;}}
  function play(){var p=audio.play(); if(p&&p.catch)p.catch(function(){});}

  function start(){ on=true; play(); save(); return true; }
  function stop(){ on=false; audio.pause(); save(); }

  function restore(){
    var s=load(); if(!s||!s.on) return false;
    var t=s.t||0;
    function seek(){try{audio.currentTime=t;}catch(e){}}
    if(audio.readyState>=1) seek(); else audio.addEventListener('loadedmetadata',seek,{once:true});
    return start();
  }

  function unlock(){ if(on&&audio.paused) play(); }
  ['click','touchend','keydown'].forEach(function(e){document.addEventListener(e,unlock);});

  window.addEventListener('pagehide',save);
  setInterval(function(){ if(on) save(); },1000);

  window.WeddingMusic={start:start,stop:stop,restore:restore,isOn:function(){return on;}};
})();