const Base = require('./base.js');
const fs = require('fs');

module.exports = class extends Base {
  async indexAction() {
    const satellite = this.mongo('satellite');
    const satCount = {};
    const sats = await satellite.where({'stage':'测试'}).select();
    satCount.all_count = sats.length;
    satCount.muyang_count=0;
    satCount.zhengyang_count=0;
    satCount.chuyang_count=0;
    /*for(let i=0;i<sats.length;i++){
    	let item=sats[i];
    	if(item.stage==='在轨'){
    		satCount.orbit_count++;
    		let launchorign = new Date(item.lanuchTime);
    		let current = new Date();
    		current = current.getTime();
    		let passed = current - launchorign.getTime();
    		let life1 = 100;
    		let life2 = 100;
    		if(item.assessLife!==undefined){
    			life1 = item.assessLife;
    		}
    		if(item.life!==undefined){
    			life2 = item.life;
    		}
    		let life3=0;
    		if(life1<life2){
    			life3=life2;
    		}else{
    			life3=life1;
    		}
    		let life = parseFloat(life3)*365*24*3600*1000;
    		if(passed>life){
    			satCount.outer_count++;
    		}else{
    			satCount.inner_count++;
    		}

    	}

    }*/

    for(let i=0;i<sats.length;i++){
    	console.log(sats[i]);
    	if(sats[i].produce_stage == "模样"){
            satCount.muyang_count++;
		}else if(sats[i].produce_stage == "正样"){
            satCount.zhengyang_count++;
		}else{
            satCount.chuyang_count++;
		}
	}


    //satCount.all_count = await satellite.where({$or: [{stage: '在轨'}, {stage: '退役'}]}).count();
      /*satCount.all_count = await satellite.where().count();
      satCount.orbit_count = await satellite.where({stage: '在轨'}).count();
      //satCount.health_count = await satellite.where({stage: '在轨', health: '完全健康态'}).count();
      satCount.health_count = await satellite.where({stage: '在轨', $or: [{health: '完全健康态'}, {health: '健康达标态'}]}).count();
      satCount.ill_count = await satellite.where({
        stage: '在轨',
        $or: [{health: '亚健康'}, {health: '故障态'}, {health: '失效态'}]
      }).count();
      */
    this.assign('sat_count', satCount);
    return this.display();
  }

  async wallAction() {
    return this.display();
  }

  async getwallsatAction() {
    const cachefile = think.ROOT_PATH + '/tmp/cache/wallsat.json';
    var cacheresult = JSON.parse(fs.readFileSync(cachefile));
    return this.json({data: cacheresult});
  }

    /*
    async getwallsatAction() {
      const cachefile = think.ROOT_PATH + '/tmp/cache/wallsat.json';
      const cacheexists = await new Promise(function (resolve, reject) {
        fs.exists(cachefile, function (exists) {
          resolve(exists);
        });
      });
      if (cacheexists) {
        const cachestat = fs.statSync(cachefile);
        let cachenow = new Date();
        let cachetime = cachestat.mtime;
        let cachediff = cachenow.getTime() - cachetime.getTime();
        if (cachediff < this.config('cacheTime')) {//直接从cache中获取
          var cacheresult = JSON.parse(fs.readFileSync(cachefile));
          return this.json({data: cacheresult});
        }
      }

      const satellite = this.mongo('satellite');
      const sats = await satellite.where().order("lanuchTime").select();
      const result = [];
      for (let i = 0; i < sats.length; i++) {
        const item={};
        item._id = sats[i]._id;
        item.name = sats[i].name;
        item.code = sats[i].code;
        if (sats[i].code_out == undefined || sats[i].code_out=='') { sats[i].code_out = sats[i].code };
        item.code_out = sats[i].code_out;
        item.stage = sats[i].stage;
        if (sats[i].commander == undefined) { sats[i].commander = '' };
        item.commander = sats[i].commander;
        if (sats[i].designer == undefined) { sats[i].designer = '' };
        item.designer = sats[i].designer;

        const code = sats[i].code;
        //判断文件是否存在
        const path = think.ROOT_PATH + '/www/static/satimgs/' + code + '.png';
        const exists = await new Promise(function(resolve, reject) {
          fs.exists(path, function(exists) {
            resolve(exists);
          });
        });
        if (exists) {
          item.imgpath = '/static/satimgs/' + code + '.png';
        } else {
          item.imgpath = '/static/satimgs/default.png';
        }

        if (sats[i].lanuchTime == undefined ) { sats[i].lanuchTime = '1900-01-01 00:00:00' };
        item.lanuchTime = (new Date( sats[i].lanuchTime)).Format('yyyy-MM-dd hh:mm:ss');

        let current = new Date();
        if(sats[i].stage=='退役' || sats[i].stage=='失效'){
          if(sats[i].retireTime=='' || sats[i].retireTime==undefined){
            if(sats[i].invalidTime!==undefined && sats[i].invalidTime!==''){
              current = new Date(sats[i].invalidTime);
            }else{
              current = new Date(sats[i].lanuchTime);
            }
          }else{
            current = new Date(sats[i].retireTime);
          }
        }
        current = current.getTime();

        let launchorign = new Date(sats[i].lanuchTime);
        let passed = current - launchorign.getTime();
        let lifeorign = parseFloat(sats[i].life);
        if(lifeorign >= parseFloat(sats[i].assessLife))
          lifeorign = parseFloat(sats[i].assessLife);
        item.lifepercent = (passed/(1000*60*60*24*365)).toFixed(2)+'Y/'+lifeorign.toFixed(2)+'Y';
        item.factory = sats[i].factory? sats[i].factory : '';
        item.field = sats[i].field? sats[i].field : '';
        item.applyField = sats[i].applyField? sats[i].applyField : '';
        item.orbitType = sats[i].orbitType? sats[i].orbitType : '';
        item.platform = sats[i].platform ? sats[i].platform : '';
        item.user = sats[i].user? sats[i].user : '';
        item.designer = sats[i].designer? sats[i].designer : '';
        item.commander = sats[i].commander? sats[i].commander : '';
        item.size = sats[i].size? sats[i].size : '';
        item.powerstyle = sats[i].powerstyle? sats[i].powerstyle : '';
        item.lanuchYear = launchorign.getFullYear()+'';

        result.push(item);
      }
      fs.writeFileSync(cachefile, JSON.stringify(result));
      return this.json({data: result});
    }*/

};
