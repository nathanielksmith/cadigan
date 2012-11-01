(function() {
    window.cadigan_templates = {}
    ;['post', 'header', 'posts', 'admin_posts', 'admin_post', 'admin_write'].forEach(function(x) {
        window.cadigan_templates[x] = Hogan.compile($("#"+x+"_tmpl").text())
    })
})()
