/**
 * Created by lihan on 2019/1/20.
 */
const BaseRest = require('../../rest.js');
let moment = require("moment");
module.exports = class extends BaseRest {
    async postAction() {
        // let type = 'DATF';
        let json = this.post();
        // const start = this.post('start');
        // const end = this.post('end');
        // const sat = this.post('sat');
        // const code = this.post('code');
        // const rawvalue = this.post('rawvalue');
        // const closetime = this.post('closetime');

        let thresholdType = this.post('thresholdType');

        if (thresholdType == null || thresholdType == undefined || thresholdType == '')
            json['thresholdType'] = 'physical';

        let type = this.post('type');

        if (type == null || type == undefined || type == '')
            json['type'] = 'DATE';

        let result = {};
        while (true) {
            result = await this.query(json);

            if (result.length == 0 && Date.parse(json.end) < Date.parse(json.closetime)) {
                var oldstart = Date.parse(json.start);
                var oldend = Date.parse(json.end);
                var close = Date.parse(json.closetime);
                var span = oldend - oldstart;
                var newend = oldend + span;
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
        const dateCollection = this.mongo(json.type, {database: json.sat});

        let where = {};
        where['_id'] = {'$lte': json.end, '$gte': json.start};
        where[json.code] = {'$exists': true};

        let set = json.code;

        if (json.rawvalue == 'true')
            set = json.code + ',' + json.code + '_YM';

        let result = await dateCollection.where(where).field(set).select();

        return result;
    }
};