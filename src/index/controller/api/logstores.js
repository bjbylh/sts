const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async getAction(){
        let filterlist=[],idx,temp;
        let reslist=[];
        let res =await think.es.cat.indices();
        res=res.split(' ');
        for(let i=0;i<res.length;i++){
            if(res[i]!=''){
                idx=res[i].indexOf('\n');
                if(idx>=0){
                    filterlist.push(res[i].slice(0,idx));
                    temp=res[i].slice(idx+1);
                    if(temp!='')
                        filterlist.push(temp);
                    continue;
                }
                filterlist.push(res[i]);
            }
        }
        if(filterlist.length>=10) {
            temp = filterlist.length / 10;
            for (let i = 0; i < temp; i++) {
                idx=filterlist[i * 10 + 2];
                if(idx[0]!='.') {
                    idx=idx.slice(0,idx.indexOf('.'))+'*';
                    if(!containitem(idx,reslist))
                        reslist.push(idx);
                }
            }
        }

        if(reslist.length!=0)
            this.json({State:1,Msg:'查询成功',Data:reslist});
        else
            this.json({State: 0,Msg:'未查到软件集', Data: null});
    }
};

function containitem(item,list) {
    for(let i=0;i<list.length;i++){
        if(list[i]==item)
            return true;
    }
    return false;
}