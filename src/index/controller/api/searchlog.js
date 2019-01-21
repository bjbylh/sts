const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async postAction(){
        //let index=this.post('index');//相当于数据库
        let index=this.post('index');//相当于数据库
        let appname=this.post('appname');
        let msg=this.post('msg');//具体消息
        let level=this.post('level');//error
        let start=this.post('start');//时间段
        let end=this.post('end');
        let list=[],res;
        if(appname)
            list.push({match:{message:appname}});
        if(msg)
            list.push({regexp:{message:msg+'.*'}});
        if(level)
            list.push({match:{message:level}});
        res= await think.es.search({
            index:index,//'vela-log-2018*',
            //_sourceInclude:type,
            body:{
                _source: {
                    include:['message']
                },
                //field:['message','type']
                query:{
                    bool:{
                        should:list
                    }
                }
            },
            size:5000
        });
        if(start&&end) {
            start = utctime(start);
            end = utctime(end);
        }
        else{
            start=null;
            end=null;
        }
        let item,temp;
        list=[];
        for(let i=0;i<res.hits.hits.length;i++) {
            try{item=JSON.parse(res.hits.hits[i]._source.message);}
            catch(err){continue;}
            if(start && end) {
                try{temp = utctime(item.time);}
                catch(e){continue;}
                if (temp <= end && temp >= start) {
                    if (Object.getOwnPropertyNames(item).length != 0)
                        allowpush(list,item,appname,msg,level);
                }
            }
            else {
                if (Object.getOwnPropertyNames(item).length != 0)
                    allowpush(list,item,appname,msg,level);
            }
        }
        //list=sortres(list);
        list.sort(function (a,b) {
            utctime(a.time) - utctime(b.time);
        });
        if(list.length!=0)
            this.json({State:1,Msg:'查询成功',Data:list});
        else
            this.json({State: 0,Msg:'未查到相关日志', Data: null});
    }
};

function utctime(str){
    let date,time;
    str=str.split(' ');
    date=str[0];
    time=str[str.length-1];
    date=date.split('-');
    time=time.split(':');
    return Date.UTC(parseInt(date[0]),parseInt(date[1]),parseInt(date[2]),parseInt(time[0]),parseInt(time[1]),parseInt(time[2]),0);
}

function allowpush(list,item,appname,msg,level) {
    let allow=true;
    if(appname)
        if(appname==item.appname)
            allow&=true;
        else
            allow&=false;
    if(msg)
        if(item.content.indexOf(msg)>=0)
            allow&=true;
        else
            allow&=false;
    if(level)
        if(item.level.toLowerCase()==level.toLowerCase())
            allow&=true;
        else
            allow&=false;
    if(allow)
        list.push(item);
}
