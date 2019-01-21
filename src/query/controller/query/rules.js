/**
 * Created by lihan on 2019/1/17.
 */
const BaseRest = require('../rest.js');

module.exports = class extends BaseRest {
    async postAction() {
        // let type = 'DATF';
        const start = this.post('start');
        const end = this.post('end');
        const sat = this.post('sat');

        let rule_id = this.post('rule_id');

        if (rule_id == null || rule_id == undefined || rule_id == '')
            rule_id = [];
        console.log(rule_id)
        let result = [];
        const jugeResultCollection = this.mongo('juge_result', {database: sat});

        if (rule_id.length == 0) {
            result = await jugeResultCollection.where({$and: [{RET_TIME: {$lte: new Date(end)}}, {RET_TIME: {$gte: new Date(start)}}]}).select();
        } else {
            result = await jugeResultCollection.where({$and: [{RET_TIME: {$lte: new Date(end)}}, {RET_TIME: {$gte: new Date(start)}}, {RET_RUL_ID: {$in: rule_id}}]}).select();
        }

        return this.json(result);
    }
};
