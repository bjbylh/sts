/**
 * Created by lihan on 2019/1/17.
 */
const BaseRest = require('../../rest.js');

module.exports = class extends BaseRest {
    async postAction() {
        let user = this.post('user');

        if (user == null || user == undefined || user == '')
            user = '';

        let result = [];
        const queryAutoCollection = this.mongo('query_auto', {database: 'yyyyy'});

        if (user == '') {
            result = await queryAutoCollection.where().select();
        } else {
            result = await queryAutoCollection.where({user: user}).select();
        }

        return this.json(result);
    }
};
