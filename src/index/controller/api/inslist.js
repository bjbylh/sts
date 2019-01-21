const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async getAction(){
        let satid=this.get('satid');
        let flowtype=this.get('flowtype');
        let subsystem=this.get('subsystem');
        let filter=this.get('filter');
        let search={};
        if(flowtype)
            search.channel=flowtype;
        if(subsystem)
            search.device=subsystem;

        let maindb=think.db.db(satid);
        let docs=await maindb.collection('basic_instruction').find(search).toArray();
        let ins,list=[];
        if(docs&&docs.length!=0){
            for (let i = 0; i < docs.length; i++) {
                ins = {};
                ins.InsId = docs[i].insid;
                ins.InsNo=docs[i].insno;
                ins.InsName=docs[i].insname;
                ins.f=docs[i].channel;
                ins.s=docs[i].device;
                if (filter&&filter!='') {
                    if (ins.InsId.indexOf(filter) >= 0 || ins.InsNo.indexOf(filter) >= 0 || ins.InsName.indexOf(filter) >= 0
                      ||ins.f.indexOf(filter)>=0 || ins.s.indexOf(filter)>=0)
                        list.push(ins);
                }
                else
                    list.push(ins);
            }
        }
        if(list.length!=0)
            this.json({State:1,Msg:'查询成功',Data:list});
        else
            this.json({State: 0,Msg:'没有找到指令信息', Data: null});
    }
};
