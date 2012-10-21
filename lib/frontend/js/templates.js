if (!window.Hogan) { throw 'missing requirement' }

var templates = {}
;['post', 'header', 'posts', 'admin_posts', 'admin_post'].forEach(function(x) {
    templates[x] = Hogan.compile($("#"+x+"_tmpl").text())
})