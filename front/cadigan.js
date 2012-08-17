(function() {
    if (!window.$) throw 'cadigan requires jquery'
    if (!window.toa) throw 'cadigan requires cadigan/fun.js'

    var cadigan,mkcall,mkpost,mkjson,mkdel;

    mkcall = function(jqfun, path, success) {
        return function() {
            var args = toa(arguments)
            var data = {}
            var cb = function(){};
            if (args.length === 1) cb = args[0];
            else if (args.length === 2) {
                data = args[0]
                cb = args[1]
            }
            var successwrap
            if (!success) {
                successwrap = function(data, cb) { cb(null, data) }
            }
            else {
                successwrap = function(data) {
                    success.call(cadigan, data, cb);
                }
            }
            jqfun(path, data).success(successwrap).error(function() {
                cb('unable to call ' + jqfun.name + ' path ' + data);
            })
        }
    }

    mkpost = mkcall.p($.post)
    mkjson = mkcall.p($.getJSON)
    mkdel = mkcall.p(function(path, data) {
        $.ajax({
            url:path,
            data:data,
            type:'delete'
        })
    })

    cadigan = {
        init: function(cb) {
            this._posts = []
        },
        list: function(cb) { cb(null, this._posts) }
        'delete': mkdel('/post'),
        get: mkjson('/post'),
        fetch: mkjson('/posts', function(data, cb) {
            this._posts = data
            cb(null)
        }),
        search:mkjson('/search'),
        'new': mkpost('/posts'),
        publish: mkpost('/publish'),
        update: mkpost('/update')
    }

    window.cadigan = cadigan
})()
