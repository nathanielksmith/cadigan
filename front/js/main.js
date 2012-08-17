(function() {
    var render = function() {
        cadigan._posts.forEach(function(p) {
            var tmpl = $('#post.template').html()
            $('#posts').append(Mustache.render(tmpl, p));
        })
    }

    cadigan.init(function(err) {
        if (err) throw err
        cadigan.fetch(render)
    })
})()
