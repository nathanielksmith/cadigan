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
            }
            var auth = JSON.parse(window.localStorage.getItem('auth'))
            if (auth) {
                data.username = auth.username
                data.password = auth.password
            }
            var successwrap
            if (!success) {
                successwrap = cb.p(null)
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
    mkjson = mkcall.p(function(path, data) {
        return $.ajax({
            url:path,
            data:data,
            type:'get',
            dataType:'json',
            cache:false
        })
    })
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
        by_tag: function(data, cb) {
            var posts = cadigan._posts.filter(function(x) {
                return Boolean(x.tags.filter(function(t) { return t == data.tag })[0])
            })
            cb(null, posts)
        },
        'delete': mkdel('/post'),
        meta: mkjson('/meta'),
        //get: mkjson('/post'),
        get: function(data, cb) {
            var post = this._posts.filter(function(x) {
                return x._id == data.post_id
            })[0]
            cb(null, post)
        },
        fetch: mkjson('/posts', function(data, cb) {
            this._posts = data.sort(function(a,b) { return -(a.created-b.created) }).map(function(x) {
                var datefmt = function(ts) { return String(new Date(ts*1000)).split(' ').slice(0,5).join(' ') }
                x.pretty_created = datefmt(x.created)
                x.pretty_updated = datefmt(x.updated)
                var converter = new Showdown.converter();
                x.pretty_content = converter.makeHtml(x.content)
                return x
            })
            cb(null)
        }),
        search: function(data, cb) {
            cb(null, this._posts.filter(function(x) {
                var check = [x.content, x.title].concat(x.tags)
                var reductor = function(p,c) {
                    return p || Boolean(c.match(data.keyword))
                }
                return check.reduce(reductor, false)
            }))
        },
        'new': mkpost('/post'),
        publish: mkpost('/publish'),
        unpublish: mkpost('/unpublish'),
        update: mkpost('/update'),
        auth: mkpost('/check-auth', function(data, cb) {
            if (data.username && data.password) {
                window.localStorage.setItem('auth', JSON.stringify(data))
                return cb(null)
            }
            else return cb('something strange')
        })
    }

    window.cadigan = cadigan
})()
