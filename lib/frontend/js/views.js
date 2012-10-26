if (![window.Backbone, window.$, window._, window.templates].reduce(function(p,v) { return p && v }, true)) {
    throw 'missing requirements'
}

var AdminPostView = Backbone.View.extend({
    tagName: 'tr',
    className: 'post',
    // TODO this *should* work but something weird is happening with events/table
    //  elements. the event methods are called by the containing AdminPostsView
    //events: {
    //    'click .delete': 'delete',
    //    'click .publish': 'publish',
    //    'click .unpublish': 'unpublish'
    //},
    initialize: function(opts) {
        this.template = templates.admin_post
        this.model = opts.model
        this.model.on('change', this.render.bind(this))
        this.model.on('destroy', this.remove.bind(this))
        this.$el.attr('data-cid', this.model.cid)
    },
    'delete': function() { this.model.destroy() },
    publish: function() { this.model.save({published:true}) },
    unpublish: function() { this.model.save({published:false}) },
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

var AdminWriteView = Backbone.View.extend({
    events: {
        'keyup #post': 'content_change',
        'keydown #post': 'content_change'
    },
    initialize: function(opts) {
        this.$el = $('#admin_write')
        this.el = $('#admin_write')[0]
        this.template = templates.admin_write
        this.model = opts && opts.model ? opts.model : new models.Post
    },
    render: function() {
        this.$el.html(this.template.render(this.model.toJSON())).show()
        return this
    },
    $saving_span: $('<span/>').text('...saving').addClass('saving icon-remove'),
    $saved_span: $('<span/>').text('saved.').addClass('saved icon-ok'),
    content_change: function(e) {
        var $editor = $('#posteditor')
        var new_content = $editor.val()
        // TODO update preview
        if (this.save_timeout) {
            $('#poststatus')
                .html(this.$saving_span)
                .addClass('alert-error')
                .removeClass('alert-success')
            console.log('no')
            return
        }

        this.save_timeout = setTimeout(function() {
            this.model.save({
                content:new_content,
                title:$('input[name=title]').val(),
                tags: $('input[name=tags]').val().split(',').map($.trim)
            }).success(function() {
                $('#id').text(this.model.get('_id'))
                this.save_timeout = null
                $('#poststatus')
                    .html(this.$saved_span)
                    .removeClass('alert-error')
                    .addClass('alert-success')
            }.bind(this)).error(function() {
                console.error('did not save.')
            })
        }.bind(this), 1000)
    }
})

var AdminPostsView = Backbone.View.extend({
    events: {
        'keydown input[name=filter]': 'filter',
        'keyup input[name=filter]': 'filter',
        'click .delete': 'delete',
        'click .publish': 'publish',
        'click .unpublish': 'unpublish',
        'click .edit': 'edit'
    },
    initialize: function(opts) {
        this.template = templates.admin_posts
        this.$el = $('#admin_posts')
        this.el = $('#admin_posts')[0]
        this.collection = opts.collection
        this.collection.on('reset', function() {
            this.post_views = this.collection.map(function(p) {
                var post_view = new AdminPostView({model:p})
                return post_view
            })
            this.render()
        }.bind(this))
    },
    _by_cid: function(cid) {
        return this.post_views.filter(function(p) {
            return p.model.cid === cid
        })[0]
    },
    'delete': function(e) {
        this._by_cid($(e.target).parents('tr').attr('data-cid')).delete()
    },
    unpublish: function(e) {
        this._by_cid($(e.target).parents('tr').attr('data-cid')).unpublish()
    },
    publish: function(e) {
        this._by_cid($(e.target).parents('tr').attr('data-cid')).publish()
    },
    edit: function(e) {
        this._by_cid($(e.target).parents('tr').attr('data-cid')).edit()
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
