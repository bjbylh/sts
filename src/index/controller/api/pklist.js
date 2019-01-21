const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async getAction(){
        let satid=this.get('satid');
        let filter=this.get('filter');

        let maindb=think.db.db(satid);
        let docs=await maindb.collection('basic_mode').find().toArray();
        let pk,pklist=[];
        if(docs&&docs.length!=0) {
            for (let i = 0; i < docs.length; i++) {
                pk = {};
                pk.PkId=docs[i].packno;
                pk.PkName = docs[i].describe;
                pk.DataFlow=docs[i].channelcode;
                if (filter&&filter!='') {
                    if (pk.PkId.indexOf(filter) >= 0 || pk.PkName.indexOf(filter) >= 0 || pk.DataFlow.indexOf(filter) >= 0)
                        pklist.push(pk);
                }
                else
                    pklist.push(pk);
            }
        }
        if(pklist.length!=0)
            this.json({State:1,Msg:'查询成功',Data:pklist});
        else
            this.json({State: 0,Msg:'未查到相关pk包', Data: null});
    }
};
