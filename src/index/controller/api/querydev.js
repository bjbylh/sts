const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async postAction(){
        let satid=this.post('satid');
        let devid=this.post('deviceid');
        let filter=this.post('filter');

        let maindb=think.db.db(satid);
        let doc=await maindb.collection('device').findOne({code:devid});
        let dev;
        if(doc) {
            dev={};
            dev.SatId=satid;
            dev.DevName=doc.name;
            dev.Tag='';
            dev.Params=[];
            let par;
            if(doc.params) {
                for (let i = 0; i < doc.params.length; i++) {
                    par = {};
                    par.ParId = doc.params[i].tmid;
                    par.MapId = '';
                    par.ParNo = doc.params[i].code;
                    par.ParName = doc.params[i].note;
                    par.Tag = '';

                    if (filter && filter != '') {
                        if (par.ParId.indexOf(filter) >= 0 || par.MapId.indexOf(filter) >= 0 || par.ParNo.indexOf(filter) >= 0
                            || par.ParName.indexOf(filter) >= 0 || par.Tag.indexOf(filter) >= 0)
                            dev.Params.push(par);
                    }
                    else
                        dev.Params.push(par);
                }
            }
            else
                dev=null;
        }
        if(dev)
            this.json({State:1,Msg:'查询成功',Data:dev});
        else
            this.json({State: 0,Msg:'未查到单机关键参数', Data: null});
    }
};
