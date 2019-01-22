const BaseRest = require('../../rest.js');
let moment = require("moment");
module.exports = class extends BaseRest {
    async postAction() {
        // let type = 'DATF';
        let json = this.post();

        let limit = this.post('limit');

        if (limit == null || limit == undefined || limit == '')
            json.limit = 1000;

        let inst = this.post('inst');

        if (inst == null || inst == undefined || inst == '')
            json.inst = 'false';

        let map = new Map();

        while (true) {
            await this.queryAll(json, map);

            if (map.size == 0 && Date.parse(json.end) < Date.parse(json.closetime)) {
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

        if (map.size > 0) {
            if (json.inst == 'true') {
                var set = new Set();
                for (let i = 0; i < json.tmList.length; i++) {
                    set.add(json.tmList[i].sat);
                }

                for (let set0 of set) {

                    let alltcs = await this.queryTcAll(json.start, json.end, set0);

                    for (let i = 0; i < alltcs.length; i++) {
                        // r.forEach(function (item, index) {
                        let item = alltcs[i];
                        let jsObj = {}
                        jsObj.code = 'INST';
                        jsObj.sat = set0;
                        jsObj.type = 'MESG';
                        jsObj.c = item.INS_ID;
                        jsObj.n = item.INS_NAME;
                        var r = [];

                        var t = Date.parse(item._id);

                        if (map.has(t)) {
                            var rr = map.get(t);
                            rr.push(jsObj);
                            map.delete(t);
                            map.set(t, rr);
                        } else {
                            r.push(jsObj);
                            map.set(t, r);
                        }
                    }
                }
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

    async queryAll(json, map) {
        for (let i = 0; i < json.tmList.length; i++) {
            let item = json.tmList[i];
            await this.query(item, map, json.start, json.end, json.rawvalue);
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

    async query(json, map, start, end, rawvalue) {

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

        var jsObj = {}
        jsObj.code = json.code;
        jsObj.sat = json.sat;
        jsObj.type = json.type;

        result.forEach(function (item, index) {
            var r = [];

            jsObj.v = parseFloat(item[json.code]);
            if (rawvalue == 'true')
                jsObj.r = item[json.code + '_YM'];

            let t = Date.parse(item._id);

            if (map.has(t)) {
                let rr = map.get(t);
                rr.push(jsObj);
                map.delete(t);
                map.set(t, rr);
            } else {
                r.push(jsObj);
                map.set(t, r);
            }
        });
    }

    async queryTcAll(start, end, sat) {
        let where = {};

        where._id = {"$lte": end, "$gte": start};

        const insCollection = this.mongo('MESG', {database: sat});

        let result = await insCollection.where(where).select();

        let ret = [];

        for (let i = 0; i < result.length; i++) {
            let newItem = await this.queryTcName(result[i], sat);
            ret.push(newItem);
        }

        return ret;
    }

    async queryTcName(item, sat) {
        let where = {};
        where.insid = item.INS_ID.trim();
        const insCollection = this.mongo('basic_instruction', {database: sat});

        let result = await insCollection.where(where).field('insname').find();

        if (think.isEmpty(result))
            item.INS_NAME = '';
        else
            item.INS_NAME = result.insname;
        return item;
    }
};