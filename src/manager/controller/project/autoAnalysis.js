const Base = require('../base.js');
const fs = require('fs');

module.exports = class extends Base {
    async computingMethodListAction() {
        const sat = this.get("_satid");
        const projectId = this.get("projectId");
        const db = this.mongo('project', {database: sat});
        let project = await db.where({_id: projectId}).find();
        let result = [];
        let excelList = project['computing_method']['excel']['sheets'];
        for (let sheetName in excelList) {
            excelList[sheetName]
            result.push(sheetName);
        }
        return this.json(result);
    }

    async saveCsvAction() {
        const csv = this.post("csv");
        const projectId = this.post("projectId");
        const sheetName = this.post("sheetName");
        const dir = './www/static/files/' + projectId;
        fs.exists(dir, function (exists) {
            if (!exists) {
                fs.mkdir(dir, function (error) {
                    if (error) {
                        console.log(error);
                        return false;
                    }
                    fs.writeFileSync(dir + '/' + sheetName + '.csv', csv);
                })
            } else {
                fs.writeFileSync(dir + '/' + sheetName + '.csv', csv);
            }
        });

    }

    async computingMethodSetAction() {
        const data = JSON.parse(this.post("data"));
        const template = data["template"];
        const sat = data["_satid"];
        const projectId = data["projectId"];
        const excel = JSON.parse(data["computingMethod"]);
        const db = this.mongo('project', {database: sat});
        let affectRows = await db.where({_id: projectId}).update({
            "computing_method": {
                "template": template,
                "excel": excel
            }
        });
        this.success({
            errno: 0,
            errmsg: '算法配置成功',
            data: affectRows + " 行已更新"
        });
    }

    async computingTaskStartAction() {
        const data = JSON.parse(this.post("data"));

        const id = data["_id"];
        const sat = data["_satid"];
        console.log(data);
        console.log(sat);

        const projectId = data["projectId"];
        const stage_name = data["stage_name"];
        const stage = data["stage"];
        const person = data["person"];
        const place = data["place"];
        const tag = data["tag"];

        const start = data["start"];
        const end = data["end"];
        const outlier = data["outlier"];
        const items = data["items"];
        const time = data["time"];
        const type = "auto";

        let result = {
            project: projectId,
            stage_name: stage_name,
            time: time,
            stage: stage,
            person: person,
            place: place,
            tag: tag,
            "restp" : "[]",
            "respa" : "[]",
            "resuv" : "[]",
            "resgl" : "[]",
            "imgarr" : "[]",
            computing_task: {
                start: start, end: end, outlier: outlier, items: items, status: 'dispach'
            }
        }

        const db = this.mongo('result', {database: sat});
        if (id == undefined || id == null || id == "") {
            let insertId = await db.add(result);
            return this.json({success: true, msg: '添加测试结果成功', data: insertId});
        } else {
            let affectedRows = await db.where({_id: _id}).update(result);
            return this.json({success: true, msg: '编辑测试结果成功', data: affectedRows});
        }
    }

    async getProjectAction() {
        const sat = this.get("sat");
        const projectId = this.get("projectId");
        const db = this.mongo('project', {database: sat});
        let data = await db.where({_id: projectId}).find();
        return this.json(data);
    }

    /*
    计算方法模板插入、更新
     */
    async templateUpsertAction() {
        const data = JSON.parse(this.post("data"));
        console.log(data);
        const name = data["name"];
        const desc = data["desc"];
        const excel = JSON.parse(data["excel"]);
        const id = data["id"];

        const db = this.mongo('c_template', {database: 'yyyyy'});
        if (id == undefined || id == null || id == "") {
            let insertId = await db.add({name: name, desc: desc, excel: excel});
            return this.json({success: true, msg: '添加模板成功', data: insertId});
        } else {
            let affectedRows = await db.where({_id: id}).update({name: name, desc: desc, excel: excel});
            return this.json({success: true, msg: '编辑模板成功', data: affectedRows});
        }
    }

    /*
    获取计算方法模板列表
     */
    async templateListAction() {
        const db = this.mongo('c_template', {database: 'yyyyy'});
        let data = await db.select();
        return this.json(data);
    }

    /*
     获取指定_id的计算方法模板
    */
    async templateList1Action() {
        const id = this.get("id");
        const db = this.mongo('c_template', {database: 'yyyyy'});
        let data = await db.where({_id: id}).find();
        return this.json(data);
    }
};
