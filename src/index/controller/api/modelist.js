const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async getAction(){
        let satid=this.get('satid');
        let dataflow=this.get('dataflow');
        let filter=this.get('filter');

        let maindb=think.db.db(satid);
        let docs=await maindb.collection('basic_mode').find().toArray();
        let mode,modelist=[];
        if(docs&&docs.length!=0) {
            for (let i = 0; i < docs.length; i++) {
                mode = {};
                mode.ModeId=docs[i].code;
                mode.ModeWord = docs[i].name;
                mode.ModeDesc=docs[i].describe;

                if (filter&&filter!='') {
                    if (mode.ModeId.indexOf(filter) >= 0 || mode.ModeWord.indexOf(filter) >= 0 || mode.ModeDesc.indexOf(filter) >= 0)
                        modelist.push(mode);
                }
                else
                    modelist.push(mode);
            }
        }
        if(modelist.length!=0)
            this.json({State:1,Msg:'查询成功',Data:modelist});
        else
            this.json({State: 0,Msg:'未查到相关pk包', Data: null});
    }
};
