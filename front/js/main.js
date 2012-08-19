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
            .partial('/templates/admin.posts.mustache', {posts:cadigan._posts})
    })
    this.get('#/admin/edit/:post_id', function() {
        $('.modal').modal('hide')
        var rc = this.rc()
        cadigan.get({post_id:this.params.post_id}, function(err, post) {
            console.log(post)
            rc.loadPartials({sidebar:'/templates/admin.sidebar.mustache'})
                .partial('/templates/admin.new.mustache', post)
        })
    })
    this.post('#/admin/delete', function() {
        cadigan.delete({post_id:this.params.post_id}, function(err) {
            if (err) throw err
            $('.alerts').append($('#deletedalert').clone().show())
        })
    })
    this.post('#/admin/publish', function() {
        cadigan.publish({post_id:this.params.post_id}, function(err) {
            if (err) throw err
            $('.alerts').append($('#publishedalert').clone().show())
        })
    })
    this.post('#/admin/unpublish', function() {
        cadigan.unpublish({post_id:this.params.post_id}, function(err) {
            if (err) throw err
            $('.alerts').append($('#unpublishedalert').clone().show())
        })
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
