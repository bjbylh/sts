const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async getAction(){
        let satid=this.get('satid');
        let subsystem=this.get('subsystem');
        let filter=this.get('filter');

        let maindb=think.db.db(satid);
        let doc=await maindb.collection('subsys').findOne({code:subsystem});
        let list=[],id,dev;
        if(doc) {
            id=doc._id.toString();
            //devobj={};
            //devobj.SubName=doc.name;
            //devobj.Devs=[];
            doc=await maindb.collection('basic_device').find({subsys:id}).toArray();
            if(doc) {
                for (let i = 0; i < doc.length; i++) {
                    dev = {};
                    dev.DevId = doc[i].code;
                    dev.DevName = doc[i].name;
                    dev.Tag = '';
                    dev.s=doc[i].subsyscode;
                    if (filter && filter != '') {
                        if (dev.DevId.indexOf(filter) >= 0 || dev.DevName.indexOf(filter) >= 0 || dev.Tag.indexOf(filter) >= 0
                            || dev.s.indexOf(filter) >= 0)
                            list.push(dev);
                    }
                    else
                        list.push(dev);
                }
            }
        }
        if(list.length!=0)
            this.json({State:1,Msg:'查询成功',Data:list});
        else
            this.json({State: 0,Msg:'未查到相关单机列表', Data: null});
    }
};
