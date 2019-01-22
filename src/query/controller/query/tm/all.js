const BaseRest = require('../../rest.js');

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

        for (let i = 0; i < json.tmList.length; i++) {
            let item = json.tmList[i];
            await this.query(item, map);
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
    async query(json, map) {
        if (!json.hasOwnProperty('type'))
            json.type = 'DATE';
        const dateCollection = this.mongo(json.type, {database: json.sat});

        let where = {};
        where['_id'] = {'$lte': json.end, '$gte': json.start};
        where[json.code] = {'$exists': true};

        let set = json.code;

        if (json.rawvalue == 'true')
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
};