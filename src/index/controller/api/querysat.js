const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async postAction(){
        let satid=this.post('satid');
        let filter=this.post('filter');

        let maindb=think.db.db('yyyyy');
        let doc=await maindb.collection('satellite').findOne({code:satid});
        let sat;
        if(doc) {
            sat={};
            sat.SatId=satid;
            sat.Name=doc.name;
            sat.Tag='';
            sat.Params=[];
            let par;
            for (let i = 0; i < doc.params.length; i++) {
                par = {};
                par.ParId=doc.params[i].tmid;
                //par.MapId = '';
                par.DataFlow=doc.params[i].dataflow;
                par.ParNo=doc.params[i].code;
                par.ParName=doc.params[i].note;
                par.Tag='';

                if (filter&&filter!='') {
                    if (par.ParId.indexOf(filter) >= 0 || par.DataFlow.indexOf(filter) >= 0  || par.ParNo.indexOf(filter) >= 0
                        || par.ParName.indexOf(filter) >= 0 || par.Tag.indexOf(filter) >= 0)
                        sat.Params.push(par);
                }
                else
                    sat.Params.push(par);
            }
        }
        if(sat)
            this.json({State:1,Msg:'查询成功',Data:sat});
        else
            this.json({State: 0,Msg:'未查到型号关键参数', Data: null});
    }
};
