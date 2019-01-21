const Base = require('./base.js');

/*
var http=require('http');

let synchronous_get = function (url){
    return new Promise(function(resolve, reject){
    http.get(url, (res) => {
        let data = "";
        res.on('data', (chunk) => {
            console.log(chunk)
        data += chunk;
    })
        res.on('end', () => {
            resolve(data);

    })
    }).on("error",function(data){
            reject(data);
        })

    });
};
*/


module.exports = class extends Base {
  indexAction() {
    return this.display();
  }

  async getelasticindexAction() {
    var data = await this.fetch('http://39.98.93.230/basic/api/logstores').then(res => res.json());
    console.log(data)
    return this.json(data.Data);
  }

  async getelasticdataAction() {
    var testb = this.post();
	var data = await this.fetch('http://39.98.93.230/basic/api/searchlog', {
            method: 'post',
            body:    JSON.stringify(testb),
            headers: { 'Content-Type': 'application/json' },
        }).then(res => res.json());
		
    console.log(data)
    return this.json(data.Data);
  }
};
