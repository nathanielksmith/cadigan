(function() {
    if (!window.$) throw 'cadigan requires jquery'
    if (!window.toa) throw 'cadigan requires cadigan/fun.js'

    var cadigan,mkcall,mkpost,mkjson,mkdel;

    mkcall = function(jqfun, path, success, error) {
        path = '/api' + path
        return function() {
            var args = toa(arguments)
            var data = {}
            var cb = function(){};
            if (args.length === 1) cb = args[0];
            else if (args.length === 2) {
                data = args[0]
                cb = args[1]
            } else
            var successwrap
            if (!success) {
                successwrap = function(data) { cb(null, data) }
            }
            else {
                successwrap = function(data) {
                    success.call(cadigan, data, cb);
                }
            }
            if (!error) {
                error = function() {
                    cb('unable to call ' + jqfun.name + ' path ' + data);
                }
            }
            jqfun(path, data).success(successwrap).error(error)
        }
    }

    mkpost = mkcall.p($.post)
    mkjson = mkcall.p($.getJSON)
    mkdel = mkcall.p(function(path, data) {
        return $.ajax({
            url:path,
            data:data,
            type:'delete'
        })
    })

    cadigan = {
        init: function(cb) {
            this._posts = []
            cb(null)
        },
        list: function(cb) { cb(null, this._posts) },
        'delete': mkdel('/post'),
        get: mkjson('/post'),
        fetch: mkjson('/posts', function(data, cb) {
            this._posts = data
            cb(null)
        }),
        search: mkjson('/search'),
        'new': mkpost('/post'),
        publish: mkpost('/publish'),
        unpublish: mkpost('/unpublish'),
        update: mkpost('/update')
    }

    window.cadigan = cadigan
})()
