const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async postAction(){
        let grpid=this.post('grpid');
        let filter=this.post('filter');

        let maindb=think.db.db('yyyyy');
        let docs=await maindb.collection('group').find({code:grpid}).toArray();
        let grp,sat;
        if(docs&&docs.length!=0) {
            for (let i = 0; i < docs.length; i++) {
                grp = {};
                grp.Code=docs[i].code;
                grp.Name = docs[i].name;
                grp.Params=[];
                for(let y=0;y<docs[i].groupsats.length;y++){
                    sat={};
                    sat.SatId=docs[i].groupsats[y];
                    sat.SatName=await maindb.collection('satellite').findOne({code:sat.SatId});
                    sat.SatName=sat.SatName.name;
                    if (filter&&filter!='') {
                        if (sat.SatId.indexOf(filter) >= 0 || sat.SatName.indexOf(filter) >= 0)
                            grp.Params.push(sat);
                    }
                    else
                        grp.Params.push(sat);
                }
            }
        }
        if(grp)
            this.json({State:1,Msg:'查询成功',Data:grp});
        else
            this.json({State: 0,Msg:'未查到相关pk包', Data: null});
    }
};
