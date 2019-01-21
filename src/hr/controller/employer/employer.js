const Base = require('../base.js');
/*const pinyin = require("pinyin");

function name_to_pinyin(name){
    const pinyin_data = pinyin(name, {
        style: pinyin.STYLE_NORMAL
    });

    var pinyinname = "";
    for (var n in pinyin_data) {
        pinyinname = pinyinname + pinyin_data[n];
    }

    return pinyinname;
}*/

function timefield_to_string(data) {
    if (typeof(data.birthday) == 'object') {
        data.birthday = data.birthday.Format("yyyy-MM-dd");
    }
    if (typeof(data.work_time) == 'object') {
        data.work_time = data.work_time.Format("yyyy-MM-dd");
    }
    if (typeof(data.graduat_time) == 'object') {
        data.graduat_time = data.graduat_time.Format("yyyy-MM-dd");
    }
    if (typeof(data.cast_time) == 'object') {
        data.cast_time = data.cast_time.Format("yyyy-MM-dd");
    }
    if (typeof(data["501_time"]) == 'object') {
        data["501_time"] = data["501_time"].Format("yyyy-MM-dd");
    }
    if (typeof(data.department_time) == 'object') {
        data.department_time = data.department_time.Format("yyyy-MM-dd");
    }
}

module.exports = class extends Base {

    /**
     * HTML display action
     */

    async listAction() {
        return this.display();
    }

    async editAction() {
        // get user info
        const _id = this.get('_id');
        if (_id) {
            const user = this.mongo('user');
            const data = await user.where({'_id': _id}).find();
            this.assign('data', data);
        }
        return this.display();
    }

    /**
     * new or edit the employer
     * @returns {Promise<*>}
     */
    async editDetailAction() {

        // get user info
        const _id = this.get('_id');
        const user = this.mongo('user');
        const data = await user.where({'_id': _id}).find();
        this.assign('data', data);

        // get nation info
        const configure = this.mongo('configure');
        const nation = await configure.where({'key': 'nation'}).find();
        this.assign('nation', nation['values']);

        // get department info
        const department = await configure.where({'key': 'department'}).find();
        this.assign('department', department['values']);

        // get employer_type info
        const employer_type = await configure.where({'key': 'employer_type'}).find();
        this.assign('employer_type', employer_type['values']);

        // get title_type info
        const title_type = await configure.where({'key': 'title_type'}).find();
        this.assign('title_type', title_type['values']);

        // get degree_type info
        const degree_type = await configure.where({'key': 'degree_type'}).find();
        this.assign('degree_type', degree_type['values']);

        // get province info
        const province = await configure.where({'key': 'province'}).find();
        this.assign('province', province['values']);

        // get secret type
        const secret_type = await configure.where({'key' : 'secret_type'}).find();
        this.assign('secret_type', secret_type['values']);

        // get room info
        const room_no = await configure.where({'key' : 'room_no'}).find();
        this.assign('room_no', room_no['values']);

        // get political_outlook info
        const political_outlook = await configure.where({'key': 'political_outlook'}).find();
        this.assign('political_outlook', political_outlook['values']);

        // get department title
        const duty = await configure.where({'key' : 'duty'}).find();
        this.assign('duty', duty['values']);

        // get department info
        const department_m = this.mongo('department');
        const department_document = await department_m.where().select();
        this.assign('department_document', department_document);

        // get position info
        const position_m = this.mongo('position');
        const position_document = await position_m.where().select();
        this.assign('position_document', position_document);
        return this.display();
    }

    /**
     * Database modify action
     */
    async getAction() {
        const user = this.mongo('user');
        const data = await user.where().select();

        /**
         * update the user account and password
        for (var index in data) {
            console.log(data[index]);
            timefield_to_string(data[index]);
            data[index].account = name_to_pinyin(data[index].name);
            data[index].password = data[index].account;
            data[index].mobile_phone_1 = String(data[index].mobile_phone_1);
            await user.where({_id: data[index]._id}).update(data[index]);
        }
         **/
        return this.json({'data': data});
    }

    async getByIdAction() {
        const _id = this.get('_id');
        const user = this.mongo('user');
        const data = await user.where({'_id': _id}).find();
        return this.json(data);
    }

    /**
     * add or update the employer
     * @returns {Promise<*>}
     */
    async saveAction() {
        const data = {};

        // account info
        data.account = this.post('account');
        data.password = this.post('password');

        // basic info
        data.name = this.post('name');
        const user = this.mongo('user');
        if (this.isMethod("POST")) {
            const insertId = await user.add(data);
            return this.json({success: true, msg: '用户信息添加成功', data: insertId});
        } else if (this.isMethod("PUT")){
            const _id = this.post('_id');
            const affectedRows = await user.where({_id: _id}).update(data);
            return this.json({success: true, msg: '用户信息修改成功', data: affectedRows});
        } else {
            return this.json({success: false, msg: 'play use post or put metho'});
        }
    }

    async saveDetailAction() {
        const data = {};
        // account info
        data.account = this.post('account');
        data.password = this.post('password');

        // basic info
        data.name = this.post('name');
        data.sex = this.post('sex');
        data.nation = this.post('nation');
        data.birthday = this.post('birthday');
        data.province = this.post('province');
        data.id_card = this.post('id_card');
        data.political_outlook = this.post('political_outlook');
        data.adress = this.post('adress');
        data.post = this.post('post');
        data.mobile_phone_1 = this.post('mobile_phone_1');
        data.mobile_phone_2 = this.post('mobile_phone_2');
        data.mobile_phone_3 = this.post('mobile_phone_3');
        data.home_phone_1 = this.post('home_phone_1');
        data.home_phone_2 = this.post('home_phone_2');
        data.home_phone_3 = this.post('home_phone_3');

        // study info
        data.degree_type = this.post('degree_type');
        data.university = this.post('university');
        data.professional = this.post('professional');
        data.graduat_time = this.post('graduat_time');
        data['501_time'] = this.post('501_time');

        // work info
        data.department = this.post('department');
        data.group = this.post('group');
        data.profession = this.post('profession');
        data.position = this.post('position');
        data.title = this.post('title');
        data.duty = this.post('duty');
        data.duty_2 = this.post('duty_2');
        data.employer_type = this.post('employer_type');
        data.title_type = this.post('title_type');
        data.secret_type = this.post('secret_type');
        data.room_no_1 = this.post('room_no_1');
        data.room_no_2 = this.post('room_no_2');
        data.office_phone_1 = this.post('office_phone_1');
        data.office_phone_2 = this.post('office_phone_2');

        const user = this.mongo('user');
        if (this.isMethod("PUT")){
            const _id = this.post('_id');
            const affectedRows = await user.where({_id: _id}).update(data);
            return this.json({success: true, msg: '用户信息修改成功', data: affectedRows});
        } else {
            return this.json({success: false, msg: 'Please use put method'});
        }
    }

    async deleteAction() {
        const _id = this.get('_id');
        const user = this.mongo('user');
        const userRole = this.mongo('userRole');
        await userRole.where({'userid': _id}).delete();
        const affectedRows = await user.where({'_id': _id}).delete();
        return this.json({success: true, msg: '删除用户成功', data: affectedRows});
    }
}
