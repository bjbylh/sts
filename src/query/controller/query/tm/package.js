const BaseRest = require('../../rest.js');

module.exports = class extends BaseRest {
    async postAction() {
        // let type = 'DATF';
        const start = this.post('start');
        const end = this.post('end');
        const sat = this.post('sat');
        const pk = this.post('pk');

        let type = this.post('type');

        if (type == null || type == undefined || type == '')
            type = 'DATO';

        let alldata = {};

        const datfCollection = this.mongo(type, {database: sat});

        let result = await datfCollection.where({$and: [{_id: {$lte: end}}, {_id: {$gte: start}}, {PKNUM: pk}]}).select();
        //console.log(result)
        if (result.length > 0) {
            alldata['total'] = result.length;
            var r = [];

            result.forEach(function (item, index) {
                var j = {};
                j["t"] = Date.parse(item._id);
                j["v"] = item.MSG_CONTENT;
                r.push(j);
            });
            alldata['result'] = r;
        }

        return this.json(alldata);
    }
};
