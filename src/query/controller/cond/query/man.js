const BaseRest = require('../../rest.js');

module.exports = class extends BaseRest {
    async postAction() {
        let user = this.post('user');

        let result = [];
        const queryManCollection = this.mongo('query_man', {database: 'yyyyy'});

        if (user == '') {
            result = await queryManCollection.where().select();
        } else {
            result = await queryManCollection.where({user: user}).select();
        }

        return this.json(result);
    }
};/**
 * Created by lihan on 2019/1/18.
 */