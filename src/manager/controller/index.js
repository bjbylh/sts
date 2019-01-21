const Base = require('./base.js');

const fs = require('fs');

const async2 = require('async');

const clients = require('restify-clients');
const assert = require('assert');

const client = clients.createJsonClient({
  url: think.config('RestTrouble'),
  version: '~1.0'
});

module.exports = class extends Base {
  async indexAction() {
    const userInfo = await this.session('userInfo');
    this.assign('userInfo', userInfo);
    return this.display();
  }
  
  async intexAction() {
    return this.display();
  }

  async welcomeAction() {
    return this.display();
  }
  
  async prerankAction() {
    return this.display();
  }

  async getPreRankAction() {
    const condition = {};
    const factory = this.post('factory');
    const applyField = this.post('applyField');
    const orbitType = this.post('orbitType');
    const platform = this.post('platform');
    const ranktype = this.post('ranktype');
    const keywords = this.post('keywords');
    if (factory !== undefined && factory !== '' && factory !== 'all') {
      condition.factory = factory;
    }
    if (applyField !== undefined && applyField !== '' && applyField !== 'all') {
      condition.applyField = applyField;
    }
    if (orbitType !== undefined && orbitType !== '' && orbitType !== 'all') {
      condition.orbitType = orbitType;
    }
    if (platform !== undefined && platform !== '' && platform !== 'all') {
      condition.platform = platform;
    }
    const satellite = this.mongo('satellite');

    //const constr = {$and:[condition,{$or:[{stage:'在轨'},{retireTime:{$gte:'2004'}}]}]};

    //const constr = {$and: [condition, {$or: [{stage: '在轨'}, {retireTime: {$gte: '2004'}}, {invalidTime: {$gte: '2004'}}]}]};
    const constr = condition;


    const orbitSats = await satellite.where(constr).select();
    const result = [];


    //const waitflag = await new Promise(function (resolve, reject) {
    //async2.each(orbitSats,function(sat,callback){
    for (let idx = 0; idx < orbitSats.length; idx++) {
      const sat = orbitSats[idx];
      const item = {};
      item.name = sat.name;
      item.code = sat.code;
      if (sat.code_out === undefined || sat.code_out === '') {
        sat.code_out = sat.code;
      }
      item.code_out = sat.code_out;
      item.score = 0;
      item._id = sat._id;
      item.factory = sat.factory ? sat.factory : '';
      item.field = sat.field ? sat.field : '';
      item.lanuchTime = sat.lanuchTime ? sat.lanuchTime : '';
      item.assessLife = sat.assessLife ? sat.assessLife : '';
      item.life = sat.life ? sat.life : '';
      item.retireTime = sat.retireTime ? sat.retireTime : '';
      item.invalidTime = sat.invalidTime ? sat.invalidTime : '';
      item.stage = sat.stage;

      let E = 1;
      const fault = this.mongo('fault', {database: sat.code});
      let faults = await fault.where().select();
      for (let i = 0; i < faults.length; i++) {
        if(faults[i].impact==undefined || faults[i].impact=='')
          faults[i].impact=0.1;
        E = E * (1 - parseFloat(faults[i].impact));
      }
      item.E = E;
      item.F0 = faults.length;
      result.push(item);
    }
    ;
    const waitflag = await new Promise(function (resolve, reject) {
      async2.each(result, function (item, callback) {
        let L = 100;
        let design = 0;
        let start = 0;
        let end = 0;
        let existms = 0;
        if (item.assessLife != '' && item.assessLife != undefined) {
          design = parseFloat(item.assessLife);
        } else {
          if (item.life != '' && item.life != undefined) {
            design = parseFloat(item.life);
          }
        }
        if (isNaN(design)) design = 0;
        if (design != 0) {
          design = design * 365 * 24 * 60 * 60 * 1000;
          if (item.lanuchTime !== '' && item.lanuchTime !== undefined) {
            start = new Date(item.lanuchTime).valueOf();
            if (item.stage == '在轨') {
              end = new Date().valueOf();
              existms = end - start;
              if (design < existms) {
                L = (existms / design) * 100;
              }
            } else {
              if (item.retireTime == '' || item.retireTime == undefined) {
                if (item.invalidTime !== undefined && item.invalidTime !== '') {
                  end = new Date(item.invalidTime).valueOf();
                  existms = end - start;
                  L = (existms / design) * 100;
                }
              } else {
                end = new Date(item.retireTime).valueOf();
                existms = end - start;
                L = (existms / design) * 100;

              }
            }
          }
          if (isNaN(L)) {
            L = 100;
          }
        }

        let Q = 100;
        if (Q > L)
          Q = L;
          
        item.F1=0;
        item.F2=0;
        item.F3=0;
        item.F4=0;

        const restparam = {satcode: item.code};
        //const troubles = await new Promise(function (resolve, reject) {
        client.post(think.config('RestTroubleAll'), restparam, function (err, req, res, obj) {
          assert.ifError(err);
          //resolve(obj);
          for (let i = 0; i < obj.length; i++) {
            const trb = JSON.parse(obj[i]);
            if (trb.count == 1) {
              let occurTime = new Date(trb.occurTime).valueOf();
              let eff = 1 - (occurTime - start) / design;
              if (eff > 0) {
                if (trb.grade == '灾难性') {
                	item.F1 = item.F1+1;
                  Q = Q - eff * 20;
                } else if (trb.grade == '关键性') {
                	item.F2 = item.F2+1;
                  Q = Q - eff * 10;
                } else if (trb.grade == '轻度') {
                	item.F3 = item.F3+1;
                  Q = Q - eff * 5;
                } else if (trb.grade == '非主要') {
                	item.F4 = item.F4+1;
                  Q = Q - eff * 2;
                }
              }
            }
            if (Q <= 0) {
              Q = 0;
              break;
            }

          }
          item.E = (item.E * 100).toFixed(2);
          item.L = L.toFixed(2);
          item.EL = (item.E * L / 100).toFixed(2);
          item.Q = Q.toFixed(2);
          item.score = (0.5 * item.EL + 0.5 * Q).toFixed(2);
          //result.push(item);
          callback();
        });
      }, function (err) {
        resolve('ok');
      });
    });


    result.sort(function (x, y) {
      return y.score - x.score;
    });
    const ranklist = [];
    let scoreflag = -1;
    let noflag = -1;
    for (let i = 0; i < result.length; i++) {
      const rankitem = result[i];
      if (rankitem.score === scoreflag) {
        rankitem.rank = 'NO.' + noflag;
      } else {
        scoreflag = rankitem.score;
        noflag = i + 1;
        rankitem.rank = 'NO.' + (i + 1);
      }
      const reg = new RegExp(keywords, 'g');
      const testresult = reg.test(rankitem.name);
      const testresult2 = reg.test(rankitem.code);
      const testresult3 = reg.test(rankitem.code_out);
      if (testresult || testresult2 || testresult3) {
        ranklist.push(rankitem);
      }
    }
    return this.json({data: ranklist});
  }
};
