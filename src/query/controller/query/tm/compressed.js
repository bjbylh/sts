const BaseRest = require('../../rest.js');
let moment = require("moment");
module.exports = class extends BaseRest {
    async postAction() {
        // let type = 'DATF';
        let json = this.post();

        let compressedData = [];

        while (true) {
            await this.queryAll(json);

            if (compressedData.length == 0 && Date.parse(json.end) < Date.parse(json.closetime)) {
                let oldstart = Date.parse(json.start);
                let oldend = Date.parse(json.end);
                let close = Date.parse(json.closetime);
                let span = oldend - oldstart;
                let newend = oldend + span;
                if (newend >= close)
                    newend = close;

                json.start = json.end;
                json.end = moment(newend).format('YYYY-MM-DD HH:mm:ss.SSS');
            } else {
                break;
            }
        }

        let ret = [];
        map.forEach(function (value, key, mapObj) {
            var item = {};
            item.t = key;
            item.d = value;
            ret.push(item);
        });
        return this.json(ret.sort(await this.compare('t')));
    }

    async queryAll(json) {
        for (let i = 0; i < json.tmList.length; i++) {
            let item = json.tmList[i];
            await this.query(item, json.start, json.end, json.rawvalue);
        }
    }

    async compare(prop) {
        return function (obj1, obj2) {
            var val1 = obj1[prop];
            var val2 = obj2[prop];
            if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    async query(json, start, end, rawvalue) {

        if (!json.hasOwnProperty('type'))
            json.type = 'DATE';
        const dateCollection = this.mongo(json.type, {database: json.sat});

        let where = {};
        where._id = {'$lte': end, '$gte': start};
        where[json.code] = {'$exists': true};

        let set = json.code;

        if (rawvalue == 'true')
            set = json.code + ',' + json.code + '_YM';

        let result = await dateCollection.where(where).field(set).select();

        let jsObj = {}
        jsObj.code = json.code;
        jsObj.sat = json.sat;

        var r = [];
        result.forEach(function (item, index) {
            var j = {};
            j.t = Date.parse(item._id);
            j.v = parseFloat(item[json.code]);
            if (rawvalue == 'true')
                j.r = item[json.code + '_YM'];

            r.push(j);
        });
        jsObj.data = r;
        compressedData.push(jsObj);
    }
};