const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async postAction(){
        let user=this.post('user');
        let password=this.post('password');
        let data=await think.db.db("yyyyy").collection("user").findOne({account:user,password:password});
        if(data)
            this.json({State:1,Msg:''});
        else
            this.json({State:0,Msg:'没有找到用户'});
    }
};
