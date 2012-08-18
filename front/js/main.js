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
            .loadPartials({sidebar:'/templates/admin.sidebar.mustache'})
            .partial('/templates/admin.mustache')
    })

    this.get('#/admin/new', function() {
        this.rc()
            .loadPartials({sidebar:'/templates/admin.sidebar.mustache'})
            .partial('/templates/admin.new.mustache')
    })
    this.get('#/admin/posts', function() {
        this.rc()
            .loadPartials({sidebar:'/templates/admin.sidebar.mustache'})
            .partial('/templates/admin.posts.mustache')
    })
    this.get('#/admin/search', function() {
        this.rc()
            .loadPartials({sidebar:'/templates/admin.sidebar.mustache'})
            .partial('/templates/admin.search.mustache')
    })
});

var converter = new Showdown.converter();
app.md = function(text) { return converter.makeHtml(text) }

$(function() {
    cadigan.init(function(err) {
        cadigan.fetch(function(err) {
            app.run('#/')
        })
    })
})
