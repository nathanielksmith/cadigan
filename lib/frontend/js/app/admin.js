(function() {
    var AdminRouter = Backbone.Router.extend({
        routes: { 
            'admin': 'admin',
            'admin/posts': 'posts',
            'admin/posts/new': 'new',
            'admin/posts/edit/:id': 'edit'
        },
        admin: function() {
            $("#public").hide()
            $("#admin").show()
            $('#workspace').children().hide()
        },
        posts: function() {
            $("#public").hide()
            $("#admin").show()
            $('#workspace').children().hide()
            this.apsview = new PostsView({collection:new CadiganApp.models.Posts})
            this.apsview.collection.fetch()
        },
        'new': function() {
            $("#public").hide()
            $("#admin").show()
            $('#workspace').children().hide()
            this.new_view = new WriteView({$el: $('#admin_new')})
            this.new_view.render()
        },
        edit: function(id) {
            $("#public").hide()
            $("#admin").show()
            $('#workspace').children().hide()
            var post = new CadiganApp.models.Post({_id:id})
            post.fetch().success(function() {
                console.log(post)
                this.edit_view = new WriteView({model:post,$el:$('#admin_edit')})
                this.edit_view.render()
            }.bind(this))
        },
    })

    var PostView = Backbone.View.extend({
        tagName: 'tr',
        className: 'post',
        events: {
            'click .delete': 'delete',
            'click .publish': 'publish',
            'click .unpublish': 'unpublish',
            'click .edit': 'edit'
        },
        initialize: function(opts) {
            // For some reason the delegation here is broken; calling
            // delegateEvents manually did not help so I'm just calling
            // $.delegate myself which works fine.
            var $body = $('body'), delegate = $body.delegate.bind($body)
            _(this.events).pairs().forEach(function(tuple) {
                var evnt = tuple[0].split(' ')[0],
                    selector = tuple[0].split(' ')[1],
                    cb = this[tuple[1]].bind(this)

                delegate(evnt, selector, function(e) {
                    if (this.$el.has($(e.target))) { return cb(e) }
                })

                delegate(tuple[0].split(' ')[1], tuple[0].split(' ')[0], this[tuple[1]].bind(this))
            }.bind(this))
            this.template = CadiganApp.templates.admin_post
            this.model = opts.model
            this.model.on('change', this.render.bind(this))
            this.model.on('destroy', this.remove.bind(this))
        },
        'delete': function() { this.model.destroy() },
        publish: function() { this.model.publish() },
        unpublish: function() {  this.model.unpublish() },
        edit: function() {
            // TODO this is a bad coupling and is because of stupid styling stuff;
            // couldn't get an <a> to look like a <button> in the toolbelt
            // dropdown.
            CadiganApp.admin_router.navigate('#/admin/posts/edit/'+this.model.get('_id'), {trigger:true})
        },
        render: function() {
            this.$el.find('.dropdown-menu button').tooltip('destroy')
            this.$el.html(
                this.template.render(this.model.toJSON())
            )
            this.$el.find('.dropdown-menu button').tooltip()
            return this
        }
    })

    var PostsView = Backbone.View.extend({
        events: {
            'keydown input[name=filter]': 'filter',
            'keyup input[name=filter]': 'filter',
        },
        initialize: function(opts) {
            this.template = CadiganApp.templates.admin_posts
            this.$el = $('#admin_posts')
            this.el = $('#admin_posts')[0]
            this.collection = opts.collection
            this.collection.on('reset', function() {
                this.post_views = this.collection.map(function(p) {
                    var post_view = new PostView({model:p})
                    return post_view
                })
                this.render()
            }.bind(this))
        },
        filter: function(e) {
            var $filter = $('input[name=filter]')
            var keyword = $filter.val()
            if (!keyword) $('tr.post').show()
            $('tr.post').each(function() {
                var $tr = $(this)
                if ($tr.text().match(keyword)) $tr.show()
                else $tr.hide()
            })
        },
        render: function() {
            this.$el.html( this.template.render() )
            this.post_views.forEach(function(pv) {
                pv.$el.remove()
                this.$el.find('tr:last').after(pv.render().el)
            }.bind(this))
            this.$el.show()
            return this
        }
    })

    var WriteView = Backbone.View.extend({
        events: {
            'keyup #post': 'content_change',
            'keydown #post': 'content_change'
        },
        initialize: function(opts) {
            this.$el = opts.$el
            this.el = this.$el[0]
            this.template = CadiganApp.templates.admin_write
            this.model = opts && opts.model ? opts.model : new CadiganApp.models.Post
        },
        render: function() {
            this.$el.html(this.template.render(this.model.toJSON())).show()
            return this
        },
        $saving_div: $('<div/>', {'class':'alert alert-error'}).text('...saving').prepend($('<span/>', {'class':'icon-remove'})),
        $saved_div: $('<div/>', {'class':'alert alert-success'}).text('saved').prepend($('<span/>', {'class':'icon-ok'})),
        content_change: function(e) {
            var $editor = this.$('.posteditor')
            var new_content = $editor.val()
            this.$('#postpreview').html(CadiganApp.md2html(new_content))
            if (this.save_timeout) {
                this.$('#poststatus').html(this.$saving_div)
                // event should still bubble. otherwise text won't make it into textarea.
                return true
            }

            this.save_timeout = setTimeout(function() {
                this.model.save({
                    content:new_content,
                    title:this.$('input[name=title]').val(),
                    tags: this.$('input[name=tags]').val().split(',').map($.trim)
                }).success(function() {
                    this.$('#id').text(this.model.get('_id'))
                    this.save_timeout = null
                    this.$('#poststatus').html(this.$saved_div)
                }.bind(this)).error(function() {
                    console.error('did not save.')
                })
            }.bind(this), 1000)
        }
    })

    window.cadigan_admin = {
        AdminRouter: AdminRouter,
        PostsView: PostsView,
        PostView: PostView,
        WriteView: WriteView
    }

})()
