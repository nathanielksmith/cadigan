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

    $('.navbar .nav > li > a.admin').click(function(e) {
        $('.page').hide()
        $('div#admin').show()
        $('#workspace').html(
    })

    $('#controls a').click(function(e) {
        var target = $(e.target).attr('data-target')
        $('#'+target).show()
    })
})()
