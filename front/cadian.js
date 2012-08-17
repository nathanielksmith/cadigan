(function() {
    if (!window.$) throw 'cadigan requires jquery'

    var cadigan = {
        init: function(cb) {
            this._posts = []
        },

        fetch: function(cb) {
            var self = this
            $.getJSON('/posts')
            .success(function(data) {
                self._posts = data
                cb(null)
            })
            .error(function() {
                cb('unable to fetch posts')
            })
        },

        'new': function(post, cb) {
            $.post('/posts', post)
            .success(function() { cb(null); })
            .error(function() { cb('unable to save post' })
        },

        publish: function(post_id, cb) {
            $.post('/publish', {id:post_id})
            .success(function() { cb(null) })
            .error(function() { cb('unable to publish post '+post_id) })
        },

        update: function(post_id, newness, cb) {
            $.post('/update', {id:post_id, newness:newness})
            .success(function() { cb(null); })
            .error(function() { cb('unable to update post '+post_id) })
        },

        'delete': function(post_id, cb) {
            $.ajax({
                url:'/post',
                type: 'delete',
                data: {id:post_id},
            })
            .success(function() { cb(null) })
            .error(function() { cb('unable to delete post '+post_id) })
        },

        get: function(post_id, cb) {
            $.getJSON('/post', {id:post_id})
            .success(function(data) { cb(null, data) })
            .error(function() { cb('unable to fetch post '+post_id) })
        },

        search: function(keyword, cb) {
            $.getJSON('/search', {keyword:keyword})
            .success(function(data) { cb(null, data) })
            .error(function() { cb('unable to complete search for '+keyword) })
        },

        list: function(cb) { cb(null, this._posts) }
    }
    window.cadigan = cadigan
})()
