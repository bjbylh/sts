const Base = require('./base.js');
const sqlite = require('./aa-sqlite');
const fs = require('fs');

function stsMap() {

}

stsMap.prototype.Set = function (key, value) {
    this[key] = value;
};
stsMap.prototype.Get = function (key) {
    return this[key];
};
stsMap.prototype.Contains = function (key) {
    return this.Get(key) != null;
};
stsMap.prototype.Remove = function (key) {
    delete this[key];
};
module.exports = class extends Base {
    async indexAction() {
        return this.display();
    }

    async checkImportDBFileAction() {
        var dbfile = this.file('dbfile');
        var postparams = this.post();
        var dbfilePath = dbfile.path;
        const sat_doc = this.mongo('satellite');
        var sat_mg = await sat_doc.where({_id: postparams.listSatellite}).find();
        var mergeType = postparams.listConflictType;
        try {
            await sqlite.open(dbfilePath);
        } catch (e) {
            fs.unlinkSync(dbfile.path);
            return this.json({success: false, msg: '数据文件解析失败，请确认是否正确的SQLite数据库文件'});
        }
        var sats_db = [];
        var channels_db = [];
        var subsyss_db = [];
        var modes_db = [];
        var inss_db = [];
        var tms_db = [];
        var poss_db = [];
        var protypes_db = [];
        var regs_db = [];
        var proinfo_db = [];
        try {
            sats_db = await sqlite.all('select * from SATELLITEINFO', []);
        } catch (e) {
            await sqlite.close();
            fs.unlinkSync(dbfile.path);
            return this.json({success: false, msg: '从导入数据中获取型号信息失败，导入操作取消'});
        }
        if (sats_db.length < 1) {
            await sqlite.close();
            fs.unlinkSync(dbfile.path);
            return this.json({success: false, msg: '导入的基础数据中无型号信息'});
        }
        var sat_db = null;
        for (let i = 0; i < sats_db.length; i++) {
            if (sats_db[i].SAT_NO === sat_mg.code) {
                sat_db = sats_db[i];
                break;
            }
        }
        if (sat_db == null) {
            await sqlite.close();
            fs.unlinkSync(dbfile.path);
            return this.json({success: false, msg: '导入的基础数据型号信息与目标型号不匹配'});
        }
        try {
            channels_db = await sqlite.all('select * from TYPEINFO where SAT_KEY=?;', [sat_db.SAT_KEY]);
        } catch (e) {
            await sqlite.close();
            fs.unlinkSync(dbfile.path);
            return this.json({success: false, msg: '获取导入数据中的数据类型信息失败：' + e});
        }
        try {
            subsyss_db = await sqlite.all('select * from DEVICEINFO where SAT_KEY=?;', [sat_db.SAT_KEY]);
        } catch (e) {
            await sqlite.close();
            fs.unlinkSync(dbfile.path);
            return this.json({success: false, msg: '获取导入数据中的分系统和地面设备信息失败：' + e});
        }
        try {
            modes_db = await sqlite.all('select * from MODEINFO where TYP_KEY in (select TYP_KEY from TYPEINFO where SAT_KEY=?);', [sat_db.SAT_KEY]);
        } catch (e) {
            await sqlite.close();
            fs.unlinkSync(dbfile.path);
            return this.json({success: false, msg: '获取导入数据中的分系统和地面设备信息失败：' + e});
        }
        try {
            tms_db = await sqlite.all('select * from PARAMETERINFO left join PROINFO on PARAMETERINFO.PAR_KEY=PROINFO.PAR_KEY where PARAMETERINFO.DEV_KEY in (select DEV_KEY from DEVICEINFO where SAT_KEY=?);', [sat_db.SAT_KEY]);
        } catch (e) {
            await sqlite.close();
            fs.unlinkSync(dbfile.path);
            return this.json({success: false, msg: '获取导入数据中的遥测参数失败：' + e});
        }
        try {
            inss_db = await sqlite.all('select * from INSTRUCTINFO where DEV_KEY in (select DEV_KEY from DEVICEINFO where SAT_KEY=?);', [sat_db.SAT_KEY]);
        } catch (e) {
            await sqlite.close();
            fs.unlinkSync(dbfile.path);
            return this.json({success: false, msg: '获取导入数据中的遥控指令失败：' + e});
        }
        try {
            poss_db = await sqlite.all('select * from POSITION;', []);
        } catch (e) {
            log(e);
            await sqlite.close();
            fs.unlinkSync(dbfile.path);
            return this.json({success: false, msg: '获取导入数据中的遥测参数位置信息失败：' + e});
        }
        try {
            protypes_db = await sqlite.all('select * from PROTYPE where SAT_KEY=? or SAT_KEY is null;', [sat_db.SAT_KEY]);
        } catch (e) {
            await sqlite.close();
            fs.unlinkSync(dbfile.path);
            return this.json({success: false, msg: '获取导入数据中的计算公式信息失败：' + e});
        }
        try {
            regs_db = await sqlite.all('select * from REGULATION where SAT_KEY=?;', [sat_db.SAT_KEY]);
        } catch (e) {
            await sqlite.close();
            await fs.unlinkSync(dbfile.path);
            return this.json({success: false, msg: '获取导入数据中的校准方法信息失败：' + e});
        }

        /*
         try {
         proinfo_db = await sqlite.all("select * from PROINFO where PROINFO.PAR_KEY in (select PAR_KEY from PARAMETERINFO where DEV_KEY in (select DEV_KEY from DEVICEINFO where SAT_KEY=?));",[sat_db.SAT_KEY]);
         }catch (e) {
         await sqlite.close();
         fs.unlinkSync(dbfile.path);
         return this.json({success: false, msg: '获取导入数据中的计算公式信息失败：' + e});
         }
         */
        await sqlite.close();
        fs.unlinkSync(dbfile.path);

        var dic_mode_db = new stsMap();
        var dic_channels_db = new stsMap();
        var dic_subsys_db = new stsMap();
        var dic_regs_db = new stsMap();
        var dic_protype_db = new stsMap();
        var dic_pos_db = new stsMap();
        var dic_tm_db = new stsMap();
        var dic_ins_db = new stsMap();
        try {
            for (let i = 0; i < modes_db.length; i++) {
                dic_mode_db.Set(modes_db[i].MOD_KEY, modes_db[i]);
            }
            for (let i = 0; i < channels_db.length; i++) {
                dic_channels_db.Set(channels_db[i].TYP_KEY, channels_db[i]);
            }
            for (let i = 0; i < subsyss_db.length; i++) {
                dic_subsys_db.Set(subsyss_db[i].DEV_KEY, subsyss_db[i]);
            }
            for (let i = 0; i < regs_db.length; i++) {
                dic_regs_db.Set(regs_db[i].REG_KEY, regs_db[i]);
            }
            for (let i = 0; i < protypes_db.length; i++) {
                dic_protype_db.Set(protypes_db[i].PRT_KEY, protypes_db[i]);
            }
            for (let i = 0; i < poss_db.length; i++) {
                if (dic_pos_db.Contains(poss_db[i].PAR_KEY)) {
                    dic_pos_db.Get(poss_db[i].PAR_KEY).push(poss_db[i]);
                } else {
                    dic_pos_db.Set(poss_db[i].PAR_KEY, [poss_db[i]]);
                }
            }
            for (let i = 0; i < tms_db.length; i++) {
                dic_tm_db.Set(tms_db[i].PAR_KEY, tms_db[i]);
            }
            for (let i = 0; i < inss_db.length; i++) {
                dic_ins_db.Set(inss_db[i].INS_KEY, inss_db[i]);
            }
        } catch (e) {
            return this.json({success: false, msg: '从整理导入数据时发生错误' + e});
        }

        const channel_doc = this.mongo('basic_channel', {database: sat_mg.code});
        const mode_doc = this.mongo('basic_mode', {database: sat_mg.code});
        const subsys_doc = this.mongo('subsys', {database: sat_mg.code});
        const tm_doc = this.mongo('tminfo', {database: sat_mg.code});
        const ins_doc = this.mongo('basic_instruction', {database: sat_mg.code});
        const formula_doc = this.mongo('basic_formula', {database: sat_mg.code});
        const regulate_doc = this.mongo('basic_regulate', {database: sat_mg.code});
        const genformula_doc = this.mongo('basic_formula');

        var channels_mg = [];
        var subsyss_mg = [];
        var modes_mg = [];
        var inss_mg = [];
        var tms_mg = [];
        var formulas_mg = [];
        var regs_mg = [];
        var genformulas_mg = [];

        var dic_channel_mg = new stsMap();
        var dic_subsys_mg = new stsMap();
        var dic_mode_mg = new stsMap();
        var dic_ins_mg = new stsMap();
        var dic_tm_mg = new stsMap();
        var dic_formula_mg = new stsMap();
        var dic_regs_mg = new stsMap();
        var dic_genformula_mg = new stsMap();

        try {
            channels_mg = await channel_doc.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
            for (let i = 0; i < channels_mg.length; i++) {
                dic_channel_mg.Set(channels_mg[i].code, channels_mg[i]);
            }
        } catch (e) {
            return this.json({success: false, msg: '从数据库中获取数据类型/通道发生错误' + e});
        }

        try {
            subsyss_mg = await subsys_doc.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
            for (let i = 0; i < subsyss_mg.length; i++) {
                dic_subsys_mg.Set(subsyss_mg[i].code, subsyss_mg[i]);
            }
        } catch (e) {
            return this.json({success: false, msg: '从数据库中获取分系统发生错误' + e});
        }

        try {
            modes_mg = await mode_doc.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
            for (let i = 0; i < modes_mg.length; i++) {
                dic_mode_mg.Set(modes_mg[i].code, modes_mg[i]);
            }
        } catch (e) {
            return this.json({success: false, msg: '从数据库中获取模式信息发生错误' + e});
        }

        try {
            inss_mg = await ins_doc.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
            for (let i = 0; i < inss_mg.length; i++) {
                dic_ins_mg.Set(inss_mg[i].insid, inss_mg[i]);
            }
        } catch (e) {
            return this.json({success: false, msg: '从数据库中获取遥控指令发生错误' + e});
        }

        try {
            tms_mg = await tm_doc.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
            for (let i = 0; i < tms_mg.length; i++) {
                dic_tm_mg.Set(tms_mg[i].paramid, tms_mg[i]);
            }
        } catch (e) {
            return this.json({success: false, msg: '从数据库中获取遥测参数发生错误' + e});
        }

        try {
            formulas_mg = await formula_doc.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
            for (let i = 0; i < formulas_mg.length; i++) {
                dic_formula_mg.Set(formulas_mg[i].code, formulas_mg[i]);
            }
        } catch (e) {
            return this.json({success: false, msg: '从数据库中获取型号计算公式发生错误' + e});
        }

        try {
            regs_mg = await regulate_doc.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
            for (let i = 0; i < regs_mg.length; i++) {
                dic_regs_mg.Set(regs_mg[i].code, regs_mg[i]);
            }
        } catch (e) {
            return this.json({success: false, msg: '从数据库中获取校准方法发生错误' + e});
        }

        try {
            genformulas_mg = await genformula_doc.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
            for (let i = 0; i < genformulas_mg.length; i++) {
                dic_genformula_mg.Set(genformulas_mg[i].code, genformulas_mg[i]);
            }
        } catch (e) {
            return this.json({success: false, msg: '从数据库中获取通用计算公式发生错误' + e});
        }

        try {
            if (mergeType == 3) {
                for (let i = 0; i < channels_db.length; i++) {
                    if (dic_channel_mg.Contains(channels_db[i].TYP_ID)) {
                        return this.json({success: true, msg: '数据类型信息冲突，取消导入'});
                    }
                }
                for (let i = 0; i < modes_db.length; i++) {
                    if (dic_mode_mg.Contains(modes_db[i].MOD_ID)) {
                        return this.json({success: true, msg: '模式信息冲突，取消导入'});
                    }
                }
                for (let i = 0; i < subsyss_db.length; i++) {
                    if (dic_subsys_mg.Contains(subsyss_db[i].DEV_KEY)) {
                        return this.json({success: true, msg: '分系统/地面设备信息冲突，取消导入'});
                    }
                }
                for (let i = 0; i < regs_db.length; i++) {
                    if (dic_regs_mg.Contains(regs_db[i].REG_ID)) {
                        return this.json({success: true, msg: '校准方法信息冲突，取消导入'});
                    }
                }
                for (let i = 0; i < protypes_db.length; i++) {
                    if (dic_formula_mg.Contains(protypes_db[i].PRT_ID) || genformulas_mg.Contains(protypes_db[i].PRT_ID)) {
                        return this.json({success: true, msg: '计算公式信息冲突，取消导入'});
                    }
                }
                for (let i = 0; i < tms_db.length; i++) {
                    if (dic_tm_mg.Contains(tms_db[i].PAR_ID)) {
                        return this.json({success: true, msg: '遥测参数信息冲突，取消导入'});
                    }
                }
                for (let i = 0; i < inss_db.length; i++) {
                    if (dic_ins_mg.Contains(inss_db[i].INS_ID)) {
                        return this.json({success: true, msg: '遥控指令信息冲突，取消导入'});
                    }
                }
            }
        } catch (e) {
            return this.json({success: false, msg: '检查导入数据与原有数据冲突情况时发生错误' + e});
        }

        try {
            let datWaitInsert = [];
            let datWaitUpdate = [];
            //处理数据类型（TYPEINFO, basic_channel）导入
            for (let i = 0; i < channels_db.length; i++) {
                let objmg = {};
                if (dic_channel_mg.Contains(channels_db[i].TYP_ID)) {
                    if (mergeType == 1) {//保留原有数据
                        continue;
                    }
                    objmg = dic_channel_mg.Get(channels_db[i].TYP_ID);
                }
                else {
                    objmg.code = channels_db[i].TYP_ID;
                    dic_channel_mg.Set(objmg.code, objmg);
                }
                objmg.name = channels_db[i].TYP_NAME;
                objmg.prefix = channels_db[i].TYP_PREFIX;
                objmg.type = channels_db[i].TYP_TYPE;

                objmg.lastmodify = new Date();
                if (channels_db[i].TYP_MAPFLAG !== undefined && channels_db[i].TYP_MAPFLAG != null && channels_db[i].TYP_MAPFLAG >= 0) {
                    objmg.mirrorcode = channels_db[i].TYP_MAPNAME;
                }
                if (objmg._id === undefined || objmg._id == null) {
                    datWaitInsert.push(objmg);
                } else {
                    datWaitUpdate.push(objmg);
                }
            }
            //let cmd=[];
            //for (let i = 0; i < datWaitInsert.length; i++) {
            //cmd.push({insertOne:{"document":datWaitInsert[i]}});
            // await channel_doc.add(datWaitInsert[i]);
            //}
            //await  channel_doc.bulkWrite(cmd);
            if (datWaitInsert.length > 0) {
                await channel_doc.addMany(datWaitInsert);
            }
            for (let i = 0; i < datWaitUpdate.length; i++) {
                let affectedRows = await channel_doc.where({_id: datWaitUpdate[i]._id}).update(datWaitUpdate[i]);
            }
        } catch (e) {
            return this.json({success: false, msg: '导入/更新数据类型/通道数据时发生错误' + e});
        }

        try {
            //处理模式导入（MODEINFO,basic_mode）
            let datWaitInsert = [];
            let datWaitUpdate = [];
            for (let i = 0; i < modes_db.length; i++) {
                let objmg = {};
                if (dic_mode_mg.Contains(modes_db[i].MOD_ID)) {
                    if (mergeType == 1) {//保留原有数据
                        continue;
                    }
                    objmg = dic_mode_mg.Get(modes_db[i].MOD_ID);
                }
                else {
                    objmg.code = modes_db[i].MOD_ID;
                    dic_mode_mg.Set(objmg.code, objmg);
                }
                objmg.name = modes_db[i].MOD_DESC;
                objmg.describe = modes_db[i].MOD_DESC;
                if (modes_db[i].TYP_KEY !== undefined && modes_db[i].TYP_KEY != null) {
                    var channel = dic_channels_db.Get(modes_db[i].TYP_KEY);
                    if (channel != null) {
                        objmg.channelcode = channel.TYP_ID;
                        objmg.channelname = channel.TYP_NAME;
                    }
                }
                objmg.evidence = modes_db[i].MOD_WORD;
                objmg.packno = modes_db[i].PAK_NO;
                objmg.length = modes_db[i].MOD_LEN;
                objmg.innercount = modes_db[i].PAK_TYPE;
                objmg.lastmodify = new Date();
                if (objmg._id === undefined || objmg._id == null) {
                    datWaitInsert.push(objmg);
                } else {
                    datWaitUpdate.push(objmg);
                }
            }
            if (datWaitInsert.length > 0) {
                await mode_doc.addMany(datWaitInsert);
            }
            for (let i = 0; i < datWaitUpdate.length; i++) {
                let affectedRows = await mode_doc.where({_id: datWaitUpdate[i]._id}).update(datWaitUpdate[i]);
            }
        } catch (e) {
            return this.json({success: false, msg: '导入/更新模式信息时发生错误' + e});
        }

        try {
            for (let i = 0; i < subsyss_db.length; i++) {
                let objmg = {};
                if (subsyss_db[i].DEV_TYPE == null || subsyss_db[i].DEV_TYPE === undefined || subsyss_db[i].DEV_TYPE < 1 || subsyss_db[i].DEV_TYPE > 2) {
                    objmg.type = 1;
                } else {
                    objmg.type = osubsyss_db[i].DEV_TYPE + 1;
                }
                if (objmg.type != 1) {
                    subsyss_db[i].DEV_ID = 'G_' + subsyss_db[i].DEV_ID;
                }
                if (dic_subsys_mg.Contains(subsyss_db[i].DEV_ID)) {
                    if (mergeType == 1) {//保留原有数据
                        continue;
                    }
                    objmg = dic_subsys_mg.Get(subsyss_db[i].DEV_ID);
                }
                else {
                    objmg.code = subsyss_db[i].DEV_ID;
                    dic_subsys_mg.Set(objmg.code, objmg);
                }
                objmg.name = subsyss_db[i].DEV_NAME;
                objmg.prefix = subsyss_db[i].DEV_ID;
                objmg.type = subsyss_db[i].DEV_TYPE;

                objmg.lastmodify = new Date();
                if (objmg._id === undefined || objmg._id == null) {
                    objmg._id = await subsys_doc.add(objmg);
                } else {
                    await subsys_doc.where({_id: objmg._id}).update(objmg);
                }
            }
        } catch (e) {
            return this.json({success: false, msg: '导入/更新分系统信息时发生错误' + e});
        }

        try {
            let datWaitInsert = [];
            let datWaitInsertGen = [];
            for (let i = 0; i < protypes_db.length; i++) {
                let objmg = {};

                if (dic_formula_mg.Contains(protypes_db[i].PRT_ID)) {
                    if (mergeType === 1) {//保留原有数据
                        continue;
                    }
                    objmg = dic_formula_mg.Get(protypes_db[i].PRT_ID);
                }
                else if (dic_genformula_mg.Contains(protypes_db[i].PRT_ID)) {
                    if (mergeType === 1) {//保留原有数据
                        continue;
                    }
                    objmg = dic_genformula_mg.Get(protypes_db[i].PRT_ID);
                }
                else {
                    objmg.code = protypes_db[i].PRT_ID;
                    if (protypes_db[i].SAT_KEY === sat_db.SAT_KEY) {
                        dic_mode_mg.Set(objmg.code, objmg);
                    }
                    else {
                        dic_genformula_mg.Set(objmg.code, objmg);
                    }
                }
                objmg.name = protypes_db[i].PRT_NAME;
                objmg.describe = protypes_db[i].PRT_DESC;
                objmg.type = protypes_db[i].PRT_TYPE;
                objmg.custom = protypes_db[i].PRT_DEF;
                objmg.lastmodify = new Date();
                if ((objmg.type === 1 || objmg.type === 2) && objmg.custom != null && objmg.custom !== undefined) {
                    objmg.custom = objmg.custom.replace(/\(/g, '').replace(/\)/g, ';');
                }
                if (protypes_db[i].SAT_KEY === sat_db.SAT_KEY) {
                    if (objmg._id === undefined || objmg._id == null) {
                        datWaitInsert.push(objmg);
                    } else {
                        await formula_doc.where({_id: objmg._id}).update(objmg);
                    }
                }
                else {
                    if (objmg._id === undefined || objmg._id == null) {
                        datWaitInsertGen.push(objmg);
                    } else {
                        await genformula_doc.where({_id: objmg._id}).update(objmg);
                    }
                }
            }

            if (datWaitInsert.length > 0) {
                await formula_doc.addMany(datWaitInsert);
            }
            if (datWaitInsertGen.length > 0) {
                await genformula_doc.addMany(datWaitInsertGen);
            }
        } catch (e) {
            return this.json({success: false, msg: '导入/更新型号计算公式/通用计算公式时发生错误' + e});
        }

        try {
            let datWaitInsert = [];
            for (let i = 0; i < regs_db.length; i++) {
                let objmg = {};
                if (dic_regs_mg.Contains(regs_db[i].REG_ID)) {
                    if (mergeType == 1) {//保留原有数据
                        continue;
                    }
                    objmg = dic_regs_mg.Get(regs_db[i].REG_ID);
                }
                else {
                    objmg.code = regs_db[i].REG_ID;
                    dic_regs_mg.Set(objmg.code, objmg);
                }
                objmg.name = regs_db[i].REG_DESC;
                objmg.describe = regs_db[i].REG_DESC;
                objmg.type = regs_db[i].REG_TYPE;
                objmg.way = regs_db[i].REG_WAY;
                objmg.enable = regs_db[i].REG_USEFUL;
                var para = regs_db[i].REG_PARA;
                var volt = regs_db[i].REG_STDVALUE;
                objmg.coefs = [{'tmcode': para, 'value': volt}];
                objmg.lastmodify = new Date();
                if (objmg._id === undefined || objmg._id == null) {
                    datWaitInsert.push(objmg);
                } else {
                    await regulate_doc.where({_id: objmg._id}).update(objmg);
                }
            }
            if (datWaitInsert.length > 0) {
                await regulate_doc.addMany(datWaitInsert);
            }
        } catch (e) {
            return this.json({success: false, msg: '导入/更新校准方法时发生错误' + e});
        }

        try {
            let datWaitInsert = [];
            for (let i = 0; i < inss_db.length; i++) {
                let objmg = {};
                if (dic_ins_mg.Contains(inss_db[i].INS_ID)) {
                    if (mergeType == 1) {//保留原有数据
                        continue;
                    }
                    objmg = dic_ins_mg.Get(inss_db[i].INS_ID);
                }
                else {
                    objmg.insid = inss_db[i].INS_ID;
                    dic_ins_mg.Set(objmg.insid, objmg);
                }
                objmg.insno = inss_db[i].INS_NO;
                objmg.insname = inss_db[i].INS_NAME;
                objmg.insplus = inss_db[i].INS_PLUS;
                objmg.ins_enable = inss_db[i].INS_ENABLE;
                objmg.instype = inss_db[i].INS_TYPE;
                objmg.inssubs = inss_db[i].REG_SUBS;
                objmg.inswidth = inss_db[i].INS_WIDTH;
                objmg.insparsrule = inss_db[i].INS_PARSRULE;
                objmg.inspars = inss_db[i].INS_PARS;
                objmg.lastmodify = new Date();
                if (inss_db[i].TYP_KEY != null && inss_db[i].TYP_KEY !== undefined && dic_channels_db.Contains(inss_db[i].TYP_KEY)) {
                    let ch = dic_channels_db.Get(inss_db[i].TYP_KEY);
                    objmg.channel = ch.TYP_ID;
                }
                if (inss_db[i].DEV_KEY != null && inss_db[i].DEV_KEY !== undefined && dic_subsys_db.Contains(inss_db[i].DEV_KEY)) {
                    let sub = dic_subsys_db.Get(inss_db[i].DEV_KEY);
                    objmg.device = sub.DEV_ID;
                    objmg.devicename = sub.DEV_NAME;
                }
                if (inss_db[i].INS_DEV != null && inss_db[i].INS_DEV !== undefined && dic_subsys_db.Contains(inss_db[i].INS_DEV)) {
                    let sub = dic_subsys_db.Get(inss_db[i].INS_DEV);
                    objmg.instarget = sub.DEV_ID;
                }
                objmg.instarget = inss_db[i].INS_DEV;
                //objmg.scaleword = inss_db[i].REG_USEFUL;
                //objmg.critical = inss_db[i].REG_USEFUL;
                if (objmg._id === undefined || objmg._id == null) {
                    datWaitInsert.push(objmg);
                } else {
                    await ins_doc.where({_id: objmg._id}).update(objmg);
                }
            }
            if (datWaitInsert.length > 0) {
                await ins_doc.addMany(datWaitInsert);
            }
        } catch (e) {
            return this.json({success: false, msg: '导入/更新遥控指令时发生错误' + e});
        }

        try {
            let datWaitInsert = [];
            for (let i = 0; i < tms_db.length; i++) {
                let objmg = {};
                if (dic_tm_mg.Contains(tms_db[i].PAR_ID)) {
                    if (mergeType == 1) {//保留原有数据
                        continue;
                    }
                    objmg = dic_tm_mg.Get(tms_db[i].PAR_ID);
                }
                else {
                    objmg.paramid = tms_db[i].PAR_ID;
                    objmg.imported = 1;
                    objmg.type = 0;
                    dic_tm_mg.Set(objmg.paramid, objmg);
                }
                objmg.tmid = tms_db[i].PAR_KEY;
                objmg.tmcode = tms_db[i].PAR_NO;
                objmg.tmcaption = tms_db[i].PAR_NAME;
                if (tms_db[i].DEV_KEY != null && tms_db[i].DEV_KEY !== undefined && dic_subsys_db.Contains(tms_db[i].DEV_KEY)) {
                    let sub = dic_subsys_db.Get(tms_db[i].DEV_KEY);
                    objmg.subsyscode = sub.DEV_ID;
                    objmg.subsysname = sub.DEV_NAME;
                }
                if (tms_db[i].TYP_KEY != null && tms_db[i].TYP_KEY !== undefined && dic_channels_db.Contains(tms_db[i].TYP_KEY)) {
                    let ch = dic_channels_db.Get(tms_db[i].TYP_KEY);
                    objmg.channelcode = ch.TYP_ID;
                }
                objmg.datatype = tms_db[i].PAR_TYPE;
                objmg.unit = tms_db[i].PAR_UNIT;
                if (tms_db[i].PAR_LIMIT != null && tms_db[i].PAR_LIMIT !== undefined && parseFloat(tms_db[i].PAR_LIMIT).toString() !== 'NaN') {
                    let lm = parseFloat(tms_db[i].PAR_LIMIT);
                    objmg.rangeleft = 0 - lm;
                    objmg.rangeright = lm;
                }
                objmg.lastmodify = new Date();
                var proc = {};
                if (tms_db[i].PRT_KEY != null && tms_db[i].PRT_KEY !== undefined && dic_protype_db.Contains(tms_db[i].PRT_KEY)) {
                    let protype = dic_protype_db.Get(tms_db[i].PRT_KEY);
                    proc.typ = protype.SAT_KEY !== sat_db.SAT_KEY;
                    proc.fc = protype.PRT_ID;
                    proc.fn = protype.PRT_NAME;
                }
                if (tms_db[i].PRO_EXP != null) proc.exp = tms_db[i].PRO_EXP;
                if (tms_db[i].PRO_COND != null) proc.cnd = tms_db[i].PRO_COND;
                if (tms_db[i].PRO_PARAMS != null) proc.relt = tms_db[i].PRO_PARAMS;
                if (tms_db[i].REG_ID != null) proc.rc = tms_db[i].REG_ID;
                if (proc.rc != null && proc.rc !== undefined && proc.rc !== '' && dic_regs_mg.Contains(proc.rc)) {
                    let reg = dic_regs_mg.Get(proc.rc);
                    proc.rn = reg.name;
                }
                if (tms_db[i].PRO_FLAG != null) proc.flag = tms_db[i].PRO_FLAG;
                if (tms_db[i].PRO_MODULUS != null) proc.modulus = tms_db[i].PRO_MODULUS;
                if (tms_db[i].PRO_LIMIT != null) proc.limit = tms_db[i].PRO_LIMIT;
                objmg.process = JSON.stringify(proc);
                let poss = [];
                let posdef = dic_pos_db.Get(tms_db[i].PAR_KEY);
                if (posdef != null && posdef.length > 0) {
                    for (let j = 0; j < posdef.length; j++) {
                        let pos = {};
                        if (posdef[j].MOD_KEY != null && posdef[j].MOD_KEY !== undefined) {
                            let mode = dic_mode_db.Get(posdef[j].MOD_KEY);
                            pos.mc = mode.MOD_ID;
                            pos.mn = mode.MOD_DESC;
                        }
                        else {
                            continue;
                        }
                        pos.pos = posdef[j].MOD_POS.replace(/0X/g, '');
                        poss.push(pos);
                    }
                }
                objmg.positions = JSON.stringify(poss);
                if (objmg._id === undefined || objmg._id == null) {
                    datWaitInsert.push(objmg);
                } else {
                    await tm_doc.where({_id: objmg._id}).update(objmg);
                }
            }
            if (datWaitInsert.length > 0) {
                await tm_doc.addMany(datWaitInsert);
            }
        } catch (e) {
            return this.json({success: false, msg: '导入/更新遥测参数时发生错误' + e});
        }
        return this.json({success: true, msg: '导入型号基础数据成功'});
    };

};
