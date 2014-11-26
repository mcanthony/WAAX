!function(WX){"use strict";function FMVoice(synth){this.parent=synth,this.params=synth.params,this.voiceKey=null,this._minDur=null,this._mod=WX.OSC(),this._modGain=WX.Gain(),this._car=WX.OSC(),this._carGain=WX.Gain(),this._mod.to(this._modGain),this._modGain.connect(this._car.frequency),this._car.to(this._carGain).to(this.parent._filter),this._mod2=WX.OSC(),this._modGain2=WX.Gain(),this._car2=WX.OSC(),this._carGain2=WX.Gain(),this._mod2.to(this._modGain2),this._modGain2.connect(this._car2.frequency),this._car2.to(this._carGain2).to(this.parent._filter)}function FMK1(preset){WX.PlugIn.defineType(this,"Generator"),this.numVoice=0,this.voices=[];for(var i=0;128>i;i++)this.voices[i]=[];this._filter=WX.Filter(),this._filter.to(this._output),WX.defineParams(this,{harmonicRatio:{type:"Generic",name:"HRatio","default":4,min:1,max:60},modulationIndex:{type:"Generic",name:"ModIdx","default":1,min:0,max:2},attack:{type:"Generic",name:"Att","default":.005,min:0,max:5,unit:"Seconds"},decay:{type:"Generic",name:"Dec","default":.04,min:0,max:5,unit:"Seconds"},sustain:{type:"Generic",name:"Sus","default":.25,min:0,max:1},release:{type:"Generic",name:"Rel","default":.2,min:0,max:10,unit:"Seconds"},balance:{type:"Generic",name:"Balance","default":.5,min:0,max:1},filterType:{type:"Itemized",name:"FiltType","default":"highshelf",model:WX.FILTER_TYPES},filterFrequency:{type:"Generic",name:"FiltFreq","default":2500,min:20,max:2e4,unit:"Hertz"},filterQ:{type:"Generic",name:"FiltQ","default":0,min:0,max:40},filterGain:{type:"Generic",name:"FiltGain","default":0,min:-40,max:40,unit:"Decibels"}}),WX.PlugIn.initPreset(this,preset)}FMVoice.prototype={noteOn:function(pitch,velocity,time){var p=this.params,freq=WX.mtof(pitch),hr=p.harmonicRatio.get(),mi=p.modulationIndex.get(),att=p.attack.get(),dec=p.decay.get(),sus=p.sustain.get(),bal=p.balance.get(),scale=WX.veltoamp(velocity);this._mod.start(time),this._car.start(time),this._car.frequency.set(freq,time,0),this._mod.frequency.set(freq*hr,time,0),this._modGain.gain.set(freq*hr*mi,time,0),this._modGain.gain.set(.1,time+1.5,2),this._carGain.gain.set(0,time,0),this._carGain.gain.set(scale*bal,time+att,1),this._carGain.gain.set(sus*scale*bal,[time+att,dec],3),this._mod2.start(time),this._car2.start(time),this._car2.frequency.set(2*freq,time,0),this._mod2.frequency.set(freq*hr,time,0),this._modGain2.gain.set(freq*hr*mi*.5,time,0),this._modGain2.gain.set(.5,time+1.5,2),this._carGain2.gain.set(0,time,0),this._carGain2.gain.set(scale*(1-bal),time+att,1),this._carGain2.gain.set(sus*scale*(1-bal),[time+att,dec],3),this.minDur=time+att+dec},noteOff:function(pitch,velocity,time){if(this.minDur){time=time<WX.now?WX.now:time;var p=this.params,rel=p.release.get();this.voiceKey=pitch,this._mod.stop(this.minDur+rel+2),this._car.stop(this.minDur+rel+2),this._mod2.stop(this.minDur+rel+2),this._car2.stop(this.minDur+rel+2),time<this.minDur?(this._carGain.gain.cancel(this.minDur),this._carGain.gain.set(0,[this.minDur,rel],3),this._carGain2.gain.cancel(this.minDur),this._carGain2.gain.set(0,[this.minDur,rel],3)):(this._carGain.gain.set(0,[time,rel],3),this._carGain2.gain.set(0,[time,rel],3))}}},FMK1.prototype={info:{name:"FMK1",version:"0.0.1",api_version:"1.0.0-alpha",author:"Hongchan Choi",type:"Generator",description:"FM Bell-based Keys"},defaultPreset:{harmonicRatio:10,modulationIndex:1.8,attack:.002,decay:.03,sustain:.65,release:.55,balance:.7165,filterType:"highshelf",filterFrequency:7e3,filterQ:0,filterGain:8},$balance:function(){},$filterType:function(value){this._filter.type=value},$filterFrequency:function(value,time,rampType){this._filter.frequency.set(value,time,rampType)},$filterQ:function(value,time,rampType){this._filter.Q.set(value,time,rampType)},$filterGain:function(value,time,rampType){this._filter.gain.set(value,time,rampType)},noteOn:function(pitch,velocity,time){time=time||WX.now;var voice=new FMVoice(this);this.voices[pitch].push(voice),this.numVoice++,voice.noteOn(pitch,velocity,time)},noteOff:function(pitch,velocity,time){time=time||WX.now;for(var playing=this.voices[pitch],i=0;i<playing.length;i++)playing[i].noteOff(pitch,velocity,time),this.numVoice--;this.voices[pitch]=[]},onData:function(action,data){switch(action){case"noteon":this.noteOn(data.pitch,data.velocity);break;case"noteoff":this.noteOff(data.pitch,data.velocity)}}},WX.PlugIn.extendPrototype(FMK1,"Generator"),WX.PlugIn.register(FMK1)}(WX);