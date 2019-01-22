const BaseRest = require('../../rest.js');

module.exports = class extends BaseRest {
    async postAction() {
        // let type = 'DATF';
        let json = this.post();

        let where = {};
        let or = {};

        let w1 = [];
        if (json.hasOwnProperty('tcList') && json.tcList.length > 0) {
            for (let tc in json.tcList) {
                let k = {};
                k.INS_ID = json.tcList[tc];
                w1.push(k);

                if (json.tcList[tc].length < 12) {
                    let str = json.tcList[tc];
                    for (let i = 0; i < (12 - json.tcList[tc].length); i++) {
                        str += " ";
                    }
                    let k0 = {}
                    k0.INS_ID = str;
                    w1.push(k0);
                }
            }

            or.$or = w1;

            let w2 = [];
            let k2 = {};
            k2._id = {"$lte": json.end, "$gte": json.start};
            w2.push(k2);
            w2.push(or);

            where.$and = w2;
        } else {
            where._id = {"$lte": json.end, "$gte": json.start};
        }

        const insCollection = this.mongo('MESG', {database: json.sat});

        let result = await insCollection.where(where).select();

        let ret = [];

        for (let i = 0; i < result.length; i++) {
            let newItem = await this.queryTcName(result[i],json.sat);
            ret.push(newItem);
        }
        return this.json(ret);
    }

    async queryTcName(item,sat) {
        let where = {};
        where.insid = item.INS_ID.trim();
        const insCollection = this.mongo('basic_instruction', {database: sat});

        let result = await insCollection.where(where).field('insname').find();

        if(think.isEmpty(result))
            item.INS_NAME = '';
        else
            item.INS_NAME = result.insname;
        return item;
    }
};
