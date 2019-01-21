const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async getAction(){
        let satid=this.get('satid');
        let filter=this.get('filter');

        let maindb=think.db.db(satid);
        let docs=await maindb.collection('subsys').find().toArray();
        let subsys,list=[];
        if(docs&&docs.length!=0) {
            for (let i = 0; i < docs.length; i++) {
                subsys = {};
                subsys._id=docs[i]._id;
                subsys.SubSystem = docs[i].code;
                subsys.SubName = docs[i].name;
                subsys.Type=docs[i].type;
                if (filter&&filter!='') {
                    if (subsys.SubSystem.indexOf(filter) >= 0 || subsys.SubName.indexOf(filter) >= 0 || subsys._id.indexOf(filter) >= 0 ||
                        subsys.Type.indexOf(filter)>=0)
                        list.push(subsys);
                }
                else
                    list.push(subsys);
            }
        }
        if(list.length!=0)
            this.json({State:1,Msg:'查询成功',Data:list});
        else
            this.json({State: 0,Msg:'未查到相关分系统', Data: null});
    }
};
