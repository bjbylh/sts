const path = require('path');
const Application = require('thinkjs');
const watcher     = require('think-watcher');

const instance = new Application({
  ROOT_PATH: __dirname,
  APP_PATH : path.join(__dirname, 'src'),
  watcher  : watcher,
  env      : 'development'
});

instance.run();

var MongoClient = require('mongodb').MongoClient;
var url         = "mongodb://39.98.93.230:27017";
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