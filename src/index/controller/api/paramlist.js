const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async getAction(){
        let satid=this.get('satid');
        let dataflow=this.get('dataflow');
        let subsystem=this.get('subsystem');
        let filter=this.get('filter');

        let maindb=think.db.db(satid);
        let results,temp;
        if(dataflow && subsystem)
            temp={channelcode:dataflow,subsyscode:subsystem};
        else if(dataflow)
            temp={channelcode:dataflow};
        else if(subsystem)
            temp={subsyscode:subsystem};

        if(temp)
            results=await maindb.collection('tminfo').find(temp).toArray();
        else
            results=await maindb.collection('tminfo').find().toArray();
        let reslist=[];
        let param;
        if(results&&results.length!=0) {
            for (let i = 0; i < results.length; i++) {
                param = {};
                param.ParId = results[i].paramid;
                //param.MapId = results[i].mapid;
                param.ParNo = results[i].tmcode;
                param.ParName = results[i].tmcaption;
                param.f=results[i].channelcode;
                param.s=results[i].subsyscode;
                param.Tag = '';
                if(filter&&filter!='') {
                    if (param.ParId.indexOf(filter) >= 0 || param.ParNo.indexOf(filter) >= 0 || param.ParName.indexOf(filter) >= 0
                        || param.Tag.indexOf(filter) >= 0 ||param.f.indexOf(filter)>=0 || param.s.indexOf(filter)>=0)
                        reslist.push(param);
                }
                else
                    reslist.push(param);
            }
        }
        if(reslist.length!=0)
            this.json({State: 1,Msg:'查询成功', Data: reslist});
        else
            this.json({State:0,Msg:'未查到符合条件的遥测',Data:null});
    }
};
