const BaseRest = require('../../rest.js');

module.exports = class extends BaseRest {
    async postAction() {
        // let type = 'DATF';
        let json = this.post();

        let limit = this.post('limit');

        if (limit == null || limit == undefined || limit == '')
            json['limit'] = 1000;

        let inst = this.post('inst');

        if (inst == null || inst == undefined || inst == '')
            json['inst'] = 'false';


        return this.json(alldata);
    }

    async query(json) {
        const dateCollection = this.mongo(json.type, {database: json.sat});

        let where = {};
        where['_id'] = {'$lte': json.end, '$gte': json.start};
        where[json.code] = {'$exists': true};

        let set = json.code;

        if (json.rawvalue == 'true')
            set = json.code + ',' + json.code + '_YM';

        let result = await dateCollection.where(where).field(set).select();

        var jsObj = {}
        jsObj["code"] = code;
        jsObj["sat"] = sat;
        jsObj["type"] = type;

        result.forEach(function (item, index) {
            var j = {};
            var r = [];

            jsObj["v"] = parseFloat(item[code]);
            if (rawvalue == 'true')
                jsObj["r"] = item[code + '_YM'];

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
        });

        return result;
    }
};