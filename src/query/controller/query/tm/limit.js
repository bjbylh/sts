/**
 * Created by lihan on 2019/1/20.
 */
const BaseRest = require('../../rest.js');
let moment = require("moment");
module.exports = class extends BaseRest {
    async postAction() {
        let json = this.post();

        if (!json.hasOwnProperty('type')) {
            json.type = 'DATE';
        }

        if (json.hasOwnProperty('thresholdType')) {
            json.thresholdType = 'physical';
        }

        let result = {};
        while (true) {
            result = await this.query(json);

            if (result.length == 0 && Date.parse(json.end) < Date.parse(json.closetime)) {
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
        return this.json(result);
    }

    async query(json) {
        let alldata = [];
        const dateCollection = this.mongo(json.type, {database: json.sat});

        let where = {};
        where._id = {'$lte': json.end, '$gte': json.start};
        where[json.code] = {'$exists': true};

        let set = json.code;

        if (json.rawvalue == 'true')
            set = json.code + ',' + json.code + '_YM';

        if(json.downLimit=='-inf')
            json.downLimit = '-1000000000000000.0';

        if(json.upLimit=='inf')
            json.upLimit = '1000000000000000.0';

        let result = await dateCollection.where(where).field(set).select();

        result.forEach(function (item, index) {
            let v = parseFloat(item[json.code]);

            if(v >= parseFloat(json.downLimit) && v <= parseFloat(json.upLimit)){
                var jsObj = {};
                jsObj.t = Date.parse(item._id);
                jsObj.v = parseFloat(item[json.code]);
                if (json.rawvalue == 'true')
                    jsObj.r = item[json.code + '_YM'];
                alldata.push(jsObj);
            }
        });
        return alldata;
    }
};