const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async getAction(){
        let satid=this.get('satid');
        let filter=this.get('filter');

        let maindb=think.db.db(satid);
        let docs=await maindb.collection('basic_vcinfo').find().toArray();
        let vc,vclist=[];
        if(docs&&docs.length!=0) {
            for (let i = 0; i < docs.length; i++) {
                vc = {};
                vc.VcNumber=docs[i].vcno;
                vc.VcName = docs[i].name;
                vc.DataFlow=docs[i].channelcode;
                if (filter&&filter!='') {
                    if (vc.VcNumber== parseInt(filter) || vc.VcName.indexOf(filter) >= 0 || vc.DataFlow.indexOf(filter) >= 0)
                        vclist.push(vc);
                }
                else
                    vclist.push(vc);
            }
        }
        if(vclist.length!=0)
            this.json({State:1,Msg:'查询成功',Data:vclist});
        else
            this.json({State: 0,Msg:'未查到相关VC包', Data: null});
    }
};
