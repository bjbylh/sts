const path = require('path');
const Application = require('thinkjs');

const instance = new Application({
  ROOT_PATH: __dirname,
  APP_PATH : path.join(__dirname, 'src'),
  proxy    : true,                          // use proxy
  env      : 'production'
});

instance.run();

var MongoClient = require('mongodb').MongoClient;
var url         = "mongodb://127.0.0.1:27017";
connectdb();
function connectdb() {
    setTimeout(function () {
        MongoClient.connect(url, function (err, db) {//, {useNewUrlParser: true}
            if (err){
                console.error(err);
                connectdb();
                return;
            }
            think.db = db;
        });
    },1000);
}

var elasticsearch = require('elasticsearch');
    think.es      = elasticsearch.Client({
    host: '39.98.93.230:9200',
    log : 'trace'
});