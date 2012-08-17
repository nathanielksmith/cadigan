var app = Sammy('#main', function() {
    $.ajaxSetup({xhrFields: {withCredentials:true}})
    this.use('Mustache')
    this.helper('rc', function(){ return new Sammy.RenderContext(this) })

    this.get('#/', function() {
        this.rc()
            .loadPartials({post:'/templates/post.mustache'})
            .partial('/templates/index.mustache', {posts:cadigan._posts})
    })

    this.get('#/admin', function() {
        this.rc()
            .partial('/templates/admin.mustache')
    })
});

cadigan.init(function(err) {
    cadigan.fetch(function(err) {
        app.run('#/')
    })
})
