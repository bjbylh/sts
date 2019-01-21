const Base = require('./intexBase.js');

module.exports = class extends Base {
    intexAction(){
        return this.display('home/index_intex.html');
    }
};