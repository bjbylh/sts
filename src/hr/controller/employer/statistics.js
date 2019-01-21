const Base = require('../base.js');

module.exports = class extends Base {

    /**
     * HTML display action
     */

    async departmentAction() {
        return this.display();
    }

    async getDepartmentInfoAction() {
        const user = this.mongo('user');

        var data;
        data = await user.aggregate([
            {
                $group : {
                    _id: null,
                    count: { $sum: 1}
                }
            }
        ]);
        let total = data[0].count;

        data = await user.aggregate([
            {
                $group : {
                    _id: {department:'$department'},
                    count: { $sum: 1}
                }
            },
            {
                $sort: {
                    _id: -1
                }
            }
        ]);

        var categories = [];
        var department = [];
        for (var i in data) {
            const v = data[i];
            if (v._id.department) {
                categories.push(v._id.department);
                var group_data = await user.aggregate([
                    {
                        $match : {department: v._id.department}
                    },
                    {
                        $group : {
                            _id: {department:'$department', group:'$group'},
                            count: { $sum: 1}
                        }
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }
                ]);

                var d = {
                    drilldown : {}
                };
                d.drilldown.name = v._id.department;
                d.y = v.count / total * 100;
                d.drilldown.categories = [];
                d.drilldown.data = [];
                for (var j in group_data) {
                    const g_v = group_data[j];
                    d.drilldown.categories.push(g_v._id.group);
                    d.drilldown.data.push(g_v.count / total * 100);
                }
                department.push(d);
            }
        }

        console.log(department);
        console.log(categories);
        console.log("----------------getDepartmentInfo----------------");

        const result = {};
        result.categories = categories;
        result.department = department;
        return this.json({data: result});
    }
}
