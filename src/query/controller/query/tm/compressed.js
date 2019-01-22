const BaseRest = require('../../rest.js');
let moment = require("moment");
module.exports = class extends BaseRest {
    async postAction() {
        // let type = 'DATF';
        let json = this.post();

        let compressedData = [];

        await this.queryAll(json, compressedData);

        return this.json(compressedData);
    }

    async queryAll(json, compressedData) {
        for (let i = 0; i < json.tmList.length; i++) {
            let item = json.tmList[i];
            await this.query(item, json.start, json.end, json.rawvalue, compressedData);
        }
    }


    async query(json, start, end, rawvalue, compressedData) {

        if (!json.hasOwnProperty('type'))
            json.type = 'DATE';

        let oldstart = Date.parse(start);
        let oldend = Date.parse(end);
        let span = oldend - oldstart;
        let interval = parseInt(span / 1000);
        let zerostart = Date.parse(start);
        var r = [];
        for (let i = 0; i < 1001; i++) {
            let newObject = {};
            newObject.start = moment(zerostart + i * interval).format('YYYY-MM-DD HH:mm:ss.SSS');
            newObject.end = moment(zerostart + (i + 1) * interval).format('YYYY-MM-DD HH:mm:ss.SSS');
            if (newObject.end == end) {
                jsons.push(newObject);
                break;
            }
            if (newObject.end > end) {
                newObject.end = end;
            }
            //jsons.push(newObject);
            await this.queryPerSlice(json.type, json.sat, start, end, json.code, json.rawvalue, r);
        }

        let it = {};
        it.code = json.code;
        it.sat = json.sat;
        it.data = r;
        compressedData.push(it);
    }

    async queryPerSlice(type, sat, start, end, code, rawvalue, r) {
        const dateCollection = this.mongo(type, {database: sat});

        let where = {};
        where._id = {'$lte': end, '$gte': start};
        where[code] = {'$exists': true};

        let set = code;

        if (rawvalue == 'true')
            set = code + ',' + code + '_YM';

        let result = await dateCollection.where(where).field(set).select();

        if (result.length > 0) {
            var max = result[0];
            var min = result[0];

            for (let item3 in result){
                if (parseFloat(item3[code] > parseFloat(max[code])))
                    max = item3;

                if (parseFloat(item3[code] < parseFloat(min[code])))
                    min = item3;
            }
            if (max === min) {
                var j = {};
                j.t = Date.parse(max._id);
                j.v = parseFloat(max[code]);
                if (rawvalue == 'true')
                    j.r = max[code + '_YM'];

                r.push(j);
            } else {
                let j = {};
                j.t = Date.parse(max._id);
                j.v = parseFloat(max[code]);
                if (rawvalue == 'true')
                    j.r = max[code + '_YM'];

                let j2 = {};
                j2.t = Date.parse(min._id);
                j2.v = parseFloat(min[code]);
                if (rawvalue == 'true')
                    j2.r = min[code + '_YM'];

                r.push(j);
                r.push(j2);
            }
        }
    }
};