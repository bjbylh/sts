module.exports = [
    [/\/basic\/api\/(\w+)(?:\/(\w+))?/, 'index/api/:1?param=:2', 'rest'],
    [/\/rbac\/api\/(\w+)(?:\/(\w+))?/, 'rbac/api/:1?id=:2', 'rest'],
    [/\/query\/tm\/(\w+)(?:\/(\w+))?/, 'query/query/tm/:1?id=:2', 'rest'],
    [/\/query\/(\w+)(?:\/(\w+))?/, 'query/query/:1?id=:2', 'rest'],
    [/\/cond\/query\/(\w+)(?:\/(\w+))?/, 'query/cond/query/:1?id=:2', 'rest'],
    [/\/query\/tc\/(\w+)(?:\/(\w+))?/, 'query/query/tc/:1?id=:2', 'rest']
];
