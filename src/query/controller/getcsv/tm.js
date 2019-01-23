/**
 * Created by lihan on 2019/1/17.
 */
const BaseRest = require('../rest.js');
const fs = require('fs');
module.exports = class extends BaseRest {
    async getAction() {
        // let type = 'DATF';
        let filaneme = this.get('filename')
        let filePath = "/home/dis/data/" + fileName;

        let stats = fs.statSync(filePath);
        if (stats.isFile()) {
            res.set({
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': 'attachment; filename=' + fileName,
                'Content-Length': stats.size
            });
            fs.createReadStream(filePath).pipe(res);
        } else {
            res.end(404);
        }
        return this.json(result);
    }
};
