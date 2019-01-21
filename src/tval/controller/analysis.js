const Base = require('./base.js');
const fs = require('fs');
const clients = require('restify-clients');
const assert = require('assert');

const client = clients.createJsonClient({
  url: think.config('RestTrouble'),
  version: '~1.0'
});

module.exports = class extends Base {
  async satNYrAction() {
    return this.display();
  }

  async trbNo1Action() {
    return this.display();
  }

  async trbNo2Action() {
    return this.display();
  }

  async trbNo3Action() {
    return this.display();
  }

  async trbNo4Action() {
    return this.display();
  }

  async trbNo5Action() {
    return this.display();
  }

  async trbNo6Action() {
    return this.display();
  }

  async trbNo7Action() {
    return this.display();
  }

  async trbNo8Action() {
    return this.display();
  }

  async satAnaAction() {
    return this.display();
  }

  async gettroubledqsAction() {
    let result = new Array();

    //获取时间间隔天数
    const Xdiff = this.post("diff");
    let querysat = this.post("idxs");
    console.log(Xdiff, querysat);
    let querysatArr = querysat.split(",");
    console.log(querysatArr);

    let wherestr = {"code": {"$in": querysatArr}};
    const satellite = this.mongo('satellite');
    let sats = await satellite.where(wherestr).select();
    let satArr = new Array(sats.length);
    let maxArr = new Array(sats.length);
    sats.forEach(function (item) {
      satArr[item.code] = new Array();
      maxArr[item.code] = 0;
    });

    for (let i = 0; i < sats.length; i++) {
      let item = sats[i];
      let restparam = {satcode: item.code};//restful查询异常
      let data = await new Promise(function (resolve, reject) {
        client.post(think.config('RestTroubleAll'), restparam, function (err, req, res, obj) {
          assert.ifError(err);
          resolve(obj);
        });
      });
      let troublecollection = new Array();
      for (let j = 0; j < data.length; j++) {
        troublecollection.push(JSON.parse(data[j]));
      }
      if (troublecollection.length > 0) {
        troublecollection.forEach(function (t2) {
          const t_lanuch = new Date(item.lanuchTime);
          const t_occur = new Date(t2.occurTime);
          const num_lanuch = t_lanuch.valueOf();
          const num_occur = t_occur.valueOf();
          const num_diff = Math.floor((num_occur - num_lanuch) / (1000 * 60 * 60 * 24)) + 1;//时间差的天数
          //this_catArr.push(num_diff);
          let x = Math.floor(num_diff / Xdiff);
          if (maxArr[item.code] < x) {
            maxArr[item.code] = x;
          }
          let flag = false;
          for (let k = 0; k < satArr[item.code].length; k++) {
            if (satArr[item.code][k][0] == x) {
              satArr[item.code][k][1] += 1;
              flag = true;
              break;
            }
          }
          if (!flag) {
            satArr[item.code].push([x, 1]);
          }
        });
      }
      //补数,可优化
      for (let l = 0; l < maxArr[item.code]; l++) {
        let find = false;
        for (let m = 0; m < satArr[item.code].length; m++) {
          if (satArr[item.code][m][0] == l) {
            find = true;
            break;
          }
        }
        if (!find) {
          satArr[item.code].push([l, 0]);
        }
      }
      satArr[item.code].sort(function (x, y) {
        return x[0] - y[0];
      });
      if (item.code_out == undefined || item.code_out == '')
        item.code_out = item.code;
      result.push({"key": item.name, "value": satArr[item.code]});
    }
    return this.json({success: true, msg: '', data: result});
  }

  async satCPxAction() {
    return this.display();
  }

  async loadSatDataAction() {
    const cachefile = think.ROOT_PATH + '/tmp/cache/satdata.json';
    var cacheresult = JSON.parse(fs.readFileSync(cachefile));
    return this.json({data: cacheresult});
  }

  async trbCPxAction() {
    return this.display();
  }

  async loadTrbDataAction() {
    const cachefile = think.ROOT_PATH + '/tmp/cache/trbdata.json';
    var cacheresult = JSON.parse(fs.readFileSync(cachefile));
    return this.json({data: cacheresult});
  }

  async pdtCPxAction() {
    return this.display();
  }

  async loadProductDataAction() {
    const cachefile = think.ROOT_PATH + '/tmp/cache/productdata.json';
    var cacheresult = JSON.parse(fs.readFileSync(cachefile));
    return this.json({data: cacheresult});
  }
  
  async pdtCFgAction() {
    return this.display();
  }
  
  async pdtTRbAction() {
    return this.display();
  }
}
