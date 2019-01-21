const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async getAction() {
        let sat, reslist = [];
        let filter = this.get('filter');
        let maindb = think.db.db("yyyyy");
        let sats = await maindb.collection("satellite").find().toArray();
        if (sats && sats.length != 0) {
            for (let i = 0; i < sats.length; i++) {
                sat = {};
                sat.Name = sats[i].name;
                sat.SatId = sats[i].code;
                sat.Tag = '';
                if (filter && filter != '') {
                    if (sat.Name.indexOf(filter) >= 0 || sat.SatId.indexOf(filter) >= 0)
                        reslist.push(sat);
                }
                else
                    reslist.push(sat);
            }
        }
        if (reslist.length != 0)
            this.json({State: 1, Msg: '查询完成', Data: reslist});
        else
            this.json({State: 0, Msg: '没有找到卫星型号', Data: []});
    }
};
