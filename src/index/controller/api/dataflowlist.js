const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async postAction(){
        let satid=this.post('satid');
        let flowtype=this.post('flowtype');
        let filter=this.post('filter');

        let maindb=think.db.db(satid);
        // if(flowtype)
        //     flowtype=await this.mirrorList(flowtype,maindb);
        let docs;
        if(!flowtype)
            docs=await maindb.collection('basic_channel').find().toArray();
        else
            docs = await maindb.collection('basic_channel').find({type: {$in:flowtype}}).toArray();
        let reslist=[];
        let flow;
        if(docs&&docs.length!=0) {
            for (let i = 0; i < docs.length; i++) {
                flow = {};
                flow.DataFlow = docs[i].code;
                flow.FlowName = docs[i].name;
                flow.MapFlow=docs[i].mirrorcode;
                if(filter&&filter!='') {
                    if (flow.DataFlow.indexOf(filter) >= 0 || flow.FlowName.indexOf(filter) >= 0 || flow.MapFlow.indexOf(filter) >= 0 )
                        reslist.push(flow);
                }
                else
                    reslist.push(flow);
            }
        }
        if(reslist.length!=0)
            this.json({State: 1,Msg:'查询成功', Data: reslist});
        else
            this.json({State:0,Msg:'没有找到数据流信息',Data:null});
    }
};
