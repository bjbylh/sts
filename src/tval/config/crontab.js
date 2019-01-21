const cacheTime = 1000 * 60 * 60;

module.exports = [{
   interval: cacheTime,
   immediate: true,
   handle: 'home/schedule/loadStageData'
},{
   interval: cacheTime,
   immediate: true,
   handle: 'home/schedule/getwallsat'
 },
    {
        interval: cacheTime,
        immediate: true,
        handle: 'home/schedule/loadSatData'
    }
]
