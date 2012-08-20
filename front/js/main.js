var app = Sammy('#main', function() {
    $.ajaxSetup({
        // TODO not using cookies so don't need this...
        xhrFields: {withCredentials:true},
        cache:false
    })
    this.use('Mustache')
    this.helper('rc', function(){ return new Sammy.RenderContext(this) })

    this.before({}, function() { app.clearTemplateCache(); })
    this.before({}, function() { $('.modal').modal('hide') })
    this.before({}, function() { cadigan.fetch() })

    this.get('/', function() {
        this.rc()
            .loadPartials({post:'/templates/post.mustache'})
            .partial('/templates/index.mustache', {posts:cadigan._posts.filter(function(x) { return x.published == true })})
    })

    this.get('#/', function() {
        var rc = this.rc()
        cadigan.fetch(function(err) {
            if (err) throw err
            rc.loadPartials({post:'/templates/post.mustache'})
                .partial('/templates/index.mustache', {posts:cadigan._posts.filter(function(x) { return x.published == true })})
        })
    })

    this.get('#/post/:post_id', function() {
        var post_id = this.params.post_id
        rc = this.rc()
        cadigan.get({post_id:post_id}, function(err, post) {
            if (err) throw err
            console.log(post)
            rc.loadPartials({post:'/templates/post.mustache'})
                .partial('/templates/index.mustache', {posts:[post]})
        })
    })

    this.get('#/tag/:tag', function() {
        var tag = this.params.tag
        var rc = this.rc()
        cadigan.by_tag({tag:tag}, function(err, posts) {
            if (err) throw err
            rc.loadPartials({post:'/templates/post.mustache'})
                .partial('/templates/index.mustache', {posts:posts.filter(function(x) { return x.published == true })})
        })
    })

    this.get('#/admin', function() {
        this.rc()
            .loadPartials({sidebar:'/templates/admin.sidebar.mustache'})
            .partial('/templates/admin.mustache')
    })

    this.get('#/admin/new', function() {
        this.rc()
            .loadPartials({sidebar:'/templates/admin.sidebar.mustache'})
            .partial('/templates/admin.write.mustache')
    })
    this.get('#/admin/posts', function() {
        var rc = this.rc()
        cadigan.fetch(function(err) {
            if (err) throw err
            rc.loadPartials({sidebar:'/templates/admin.sidebar.mustache'})
                .partial('/templates/admin.posts.mustache', {posts:cadigan._posts})
        })
    })
    this.get('#/admin/edit/:post_id', function() {
        $('.modal').modal('hide')
        var rc = this.rc()
        cadigan.get({post_id:this.params.post_id}, function(err, post) {
            console.log(post)
            rc.loadPartials({sidebar:'/templates/admin.sidebar.mustache'})
                .partial('/templates/admin.write.mustache', post)
        })
    })
    this.post('#/admin/delete', function() {
        var post_id = this.params.post_id
        cadigan.delete({post_id:post_id}, function(err) {
            if (err) throw err
            $('.alerts').append($('#deletedalert').clone().show())
            $('tr[data-post_id='+post_id+']').fadeOut()
        })
    })
    this.post('#/admin/publish', function() {
        var post_id = this.params.post_id
        cadigan.publish({post_id:post_id}, function(err) {
            if (err) throw err
            $('.alerts').append($('#publishedalert').clone().show())
            $($('tr[data-post_id='+post_id+']').find('td')[3]).html('<span class="icon-ok"></span>')
        })

    })
    this.post('#/admin/unpublish', function() {
        var post_id = this.params.post_id
        cadigan.unpublish({post_id:post_id}, function(err) {
            if (err) throw err
            $('.alerts').append($('#unpublishedalert').clone().show())
            $($('tr[data-post_id='+post_id+']').find('td')[3]).html('')
        })
    })
    this.post('#/auth', function() {
        var username = this.params.username
        var shaObj = new jsSHA(this.params.password, "ASCII");
        var password = shaObj.getHash("SHA-256", "HEX");
        cadigan.auth({username:username, password:password}, function(err) {
            if (err) throw err
            $('.alerts').append($('#welcomealert').clone().show())
            $('.modal').modal('hide')
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
