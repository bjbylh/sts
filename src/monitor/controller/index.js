const Base = require('./base.js');
const fs = require('fs');
const clients = require('restify-clients');

module.exports = class extends Base {
    async indexAction() {
        const userInfo = await this.session('userInfo');
        this.assign('userInfo', userInfo);
        return this.display();
    }

    async welcomeAction() {
        return this.display();
    }

    async getSatAction(){
        //读取文件
        /*let arr = [];
        let files =  fs.readdirSync(think.ROOT_PATH+'/'+this.config('cfgpath'));
        for(let i=0;i<files.length;i++){
            let len = files[i].length-5;
            if(len>=0&& files[i].lastIndexOf('.json')==len){
                arr.push(files[i].substring(0,len));
            }
        }*/
        let arr = this.config('machine');
        return this.json(arr);
    }

    async listAction(){
        //读取文件
        let group = this.get("group");
        this.assign("group",group);
        return this.display();
    }

    async getallAction(){
        let group = this.get("group");
        let client = clients.createJsonClient({
            url: group,
            version: '~1.0'
        });

        let back = await new Promise(function (resolve, reject) {
            client.get('/api/getall', function (err, req, res, obj) {
                if (err) {
                    console.error(err);
                } else {
                    resolve(obj);
                }
            });
        })
        return this.json(back);
    }

    async getServiceAction(){
        let arr = [];
        let group = this.get("group");
        let gro = JSON.parse(group);
        //读取文件
        for(let i=0;i<gro.length;i++){
            let ob = {};
            ob.satid=gro[i].satid;
            ob.arr=[];

            let item = gro[i].apps;
            for(let j=0;j<item.length;j++) {
                let obj = {};
                obj.name = item[j];
                obj.cpu = '';
                obj.id = '';
                obj.mem = '';
                obj.pid = '';
                obj.restartNum = '';
                obj.status = '';
                obj.uptime = '';
                ob.arr.push(obj);
            }
            arr.push(ob);
        }
        return this.json ({data: arr});
    }

};


