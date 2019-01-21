const Base = require('./base.js');

module.exports = class extends Base {
    async  indexAction() {
        const _groupid = this.get('_groupid');
        const _satid = this.get('_satid');
        this.assign('groupid', _groupid);
        this.assign('satid', _satid);

        const doc_sat = this.mongo('satellite');
        let sat = await doc_sat.where({_id: _satid}).find();
        this.assign('sat', sat.code);

        return this.display();
    }

    async  testAction() {
        const _groupid = this.get('_groupid');
        const _satid = this.get('_satid');
        this.assign('groupid', _groupid);
        this.assign('satid', _satid);

        const doc_sat = this.mongo('satellite');
        let sat = await doc_sat.where({_id: _satid}).find();
        this.assign('sat', sat.code);
        return this.display('bdm/rule_test.html');
    }

    async indexmenuAction() {
        return this.display();
    }

    /**
     * 获取所有判读规则（可带条件）
     * @returns {Promise.<void>}
     */
    async  getListAction() {
        try {
            const _satid = this.get('_satid');
            const _groupid = parseInt(this.get('_groupid'));
            const satellite = this.mongo('satellite');
            let sat = await satellite.where({_id: _satid}).find();
            const doc = this.mongo('juge_rule', {database: sat.code});

            var rules = {}
            if (_groupid != undefined && _groupid != '' && _groupid != null)
                rules = await doc.where({RUL_GROUP_ID: _groupid}).select();
            else
                rules = await doc.where().select();
            return this.json({data: rules});
        } catch (e) {
            return this.json({success: false});
        }
    }

    /**
     * 删除判读规则
     * @returns {Promise.<void>}
     */
    async  doDeleteAction() {
        try {
            const data = JSON.parse(this.post('data'));
            let id = data._id
            let sat = data.RUL_SAT;
            const jr = this.mongo('juge_rule', {database: sat});
            const affectedRows = await jr.where({_id: id}).delete();
            return this.json({success: true});
        } catch (e) {
            return this.json({success: false});
        }
    }

    //
    // /**
    //  * 判读规则编辑保存
    //  * @returns {Promise.<void>}
    //  */
    // async saveTableAction() {
    //     try {
    //         const json = JSON.parse(this.post('data'));
    //         for (var i = 0; i < json.length; i++) {
    //             let sat = json[i].RUL_SAT;
    //             let id = json[i].RUL_ID;
    //             const jr = this.mongo('juge_rule', {database: sat});
    //             const affectedRows = await jr.where({RUL_ID: id}).update(json[i]);
    //         }
    //         return this.json({success: true});
    //     } catch (e) {
    //         return this.json({success: false});
    //     }
    // }

    /**
     * 插入判读规则
     * @returns {Promise.<void>}
     */
    async  insertRuleAction() {
        try {
            let json = JSON.parse(this.post('data'));

            for (var i = 0; i < json.length; i++) {

                delete json[i]._satid;
                const sat = json[i].RUL_SAT;

                json[i]['RUL_TIME'] = new Date();

                const jr = this.mongo('juge_rule', {database: sat});
                let affectedRows;
                if (json[i]._id != undefined && json[i]._id != '' && json[i]._id != null) {

                    affectedRows = await jr.where({_id: json[i]._id}).update(json[i]);
                }
                else {
                    delete json[i]._id;
                    affectedRows = await jr.add(json[i]);
                }
            }
            return this.json({success: true});
        } catch (e) {
            console.log(e)
            return this.json({success: false});
        }
    }

    /**
     * 获取所有知识组数据（可带条件）
     * @returns {Promise.<void>}
     */
    // async getGroupListIIAction() {
    //     try {
    //         const sat = this.post('GROUP_SAT');
    //         const GROUP_ID = this.post('GROUP_ID');
    //         const GROUP_NAME = this.post('GROUP_NAME');
    //         const GROUP_TYPE = this.post('GROUP_TYPE');
    //
    //         let cond = {};
    //
    //         if (GROUP_ID != undefined && GROUP_ID != '' && GROUP_ID != 'NAN')
    //             cond['GROUP_ID'] = parseInt(GROUP_ID);
    //
    //         if (GROUP_NAME != undefined && GROUP_NAME != '' && GROUP_NAME != 'NAN')
    //             cond['GROUP_NAME'] = GROUP_NAME;
    //
    //         if (GROUP_TYPE != undefined && GROUP_TYPE != '' && GROUP_TYPE != 'NAN')
    //             cond['GROUP_TYPE'] = parseInt(GROUP_TYPE);
    //
    //         const doc = this.mongo('juge_group', {database: sat});
    //
    //         let data = await doc.where(cond).select();
    //         return this.json({data: data});
    //     } catch (e) {
    //         return this.json({data: ''});
    //     }
    // }

    async  getGroupListAction() {
        const _satid = this.get('_satid');
        const satellite = this.mongo('satellite');
        let sat = await satellite.where({_id: _satid}).find();
        const doc = this.mongo('juge_group', {database: sat.code});
        let data = await doc.where().select();
        return this.json({data: data});
    }

    /**
     * 插入知识组数据
     * @returns {Promise.<void>}
     */
    async insertGroupAction() {
        try {
            let json = JSON.parse(this.post('data'));
            delete json._satid;
            const _satid = this.post('_satid');
            const satellite = this.mongo('satellite');
            const sat = await satellite.where({_id: _satid}).find();
            json['GROUP_SAT'] = sat.code;
            json['GROUP_ID'] = Math.floor(Math.random() * 1000000);
            let type = parseInt(json.GROUP_TYPE);
            json['GROUP_TYPE'] = type;
            const jr = this.mongo('juge_group', {database: sat.code});
            const affectedRows = await jr.add(json);
            return this.json({success: true});
        } catch (e) {
            return this.json({success: false});
        }
    }

    async editAction() {
        const _satid = this.get('_satid');
        const doc_sat = this.mongo('satellite');
        let sat = await doc_sat.where({_id: _satid}).find();
        this.assign('sat', sat);
        const doc_tar = this.mongo('juge_group', {database: sat.code});
        const _groupid = parseInt(this.get('_groupid'));
        let data = await doc_tar.where({GROUP_ID: _groupid}).find();
        this.assign('data', data);
        return this.display('bdm/rule_edit.html');
    }

    /**
     * 知识组编辑结果保存
     * @returns {Promise.<void>}
     */
    async saveGroupAction() {
        try {
            let json = JSON.parse(this.post('data'));
            const _satid = this.post('_satid');
            const satellite = this.mongo('satellite');
            const sat = await satellite.where({_id: _satid}).find();
            let gid = parseInt(json.GROUP_ID);
            json['GROUP_ID'] = gid;
            let type = parseInt(json.GROUP_TYPE);
            json['GROUP_TYPE'] = type;
            const jr = this.mongo('juge_group', {database: sat.code});
            const affectedRows = await jr.where({GROUP_ID: gid}).update(json);
            return this.json({success: true});
        } catch (e) {
            return this.json({success: false});
        }
    }

    /**
     * 删除知识分组
     * @returns {Promise.<void>}
     */
    async  doGroupDeleteAction() {
        try {
            const data = JSON.parse(this.post('data'));
            const _satid = data._satid;
            const satellite = this.mongo('satellite');
            const sat = await satellite.where({_id: _satid}).find();

            const jr = this.mongo('juge_group', {database: sat.code});

            const gid = parseInt(data._id);
            const affectedRows = await jr.where({GROUP_ID: gid}).delete();
            return this.json({success: true});
        } catch (e) {
            return this.json({success: false});
        }
    }

    /**
     * 获取所有判读结果数据（可带条件）
     * @returns {Promise.<void>}
     */
    // async getResultListAction() {
    //     try {
    //         const sat = this.post('RET_SATID');
    //         const RET_RUL_ID = this.post('RET_RUL_ID');
    //         const RET_RUL_NAME = this.post('RET_RUL_NAME');
    //         const KEY = this.post('KEY');
    //         const TIME_BEGIN = this.post('TIME_BEGIN');
    //         const TIME_END = this.post('TIME_END');
    //         let cond = {};
    //
    //         if (RET_RUL_ID != undefined && RET_RUL_ID != '' && RET_RUL_ID != 'NAN')
    //             cond['RET_RUL_ID'] = parseInt(RET_RUL_ID);
    //
    //         if (RET_RUL_NAME != undefined && RET_RUL_NAME != '' && RET_RUL_NAME != 'NAN')
    //             cond['RET_RUL_NAME'] = RET_RUL_NAME;
    //
    //         if (KEY != undefined && KEY != '' && KEY != 'NAN')
    //             cond['KEY'] = parseInt(KEY);
    //
    //         if (TIME_BEGIN != '' && TIME_END != '')
    //             cond['RET_TIME'] = {"$lte": TIME_END, "$gte": TIME_BEGIN};
    //         else if (TIME_BEGIN != '')
    //             cond['RET_TIME'] = {"$gte": TIME_BEGIN};
    //         else
    //             cond['RET_TIME'] = {"$lte": TIME_END};
    //
    //         const doc = this.mongo('juge_result', {database: sat});
    //
    //         let data = await doc.where(cond).select();
    //         return this.json({data: data});
    //     } catch (e) {
    //         return this.json({data: ''});
    //     }
    // }

    // async editAction() {
    //     return this.display('bdm/rule_edit.html');
    // }

    async  projectAction() {
        const _groupid = this.get('_groupid');
        const _satid = this.get('_satid');
        this.assign('groupid', _groupid);
        this.assign('satid', _satid);
        const doc_sat = this.mongo('satellite');
        let sat = await doc_sat.where({_id: _satid}).find();
        this.assign('sat', sat.code);
        return this.display('bdm/rule_project.html');
    }

    async  sourceAction() {
        const _groupid = this.get('_groupid');
        const _satid = this.get('_satid');
        this.assign('groupid', _groupid);
        this.assign('satid', _satid);
        const doc_sat = this.mongo('satellite');
        let sat = await doc_sat.where({_id: _satid}).find();
        this.assign('sat', sat.code);
        return this.display('bdm/rule_source.html');
    }

    async  adruleAction() {
        const _satid = this.get('_satid');
        const doc_sat = this.mongo('satellite');
        let sat = await doc_sat.where({_id: _satid}).find();
        this.assign('sat', sat);
        const _groupid = this.get("_groupid");
        this.assign('_groupid', _groupid);
        return this.display('bdm/rule_adrule.html');
    }
};
