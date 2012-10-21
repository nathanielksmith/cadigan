if (![window.Backbone, window.$, window._, window.templates].reduce(function(p,v) { return p && v }, true)) {
    throw 'missing requirements'
}

var AdminPostView = Backbone.View.extend({
    tagName: 'tr',
    className: 'post',
    events: {
        'click .delete': 'delete',
        'click .publish': 'publish',
        'click .unpublish': 'unpublish'
    },
    initialize: function(opts) {
        this.template = templates.admin_post
        this.model = opts.model
        this.model.on('change', this.render.bind(this))
        this.model.on('destroy', this.remove.bind(this))
    },
    'delete': function() { this.model.destroy() },
    publish: function() { this.model.save({published:true}) },
    unpublish: function() { this.model.save({published:false}) },
    render: function() {
        this.$el.html(
            this.template.render(this.model.toJSON())
        )
        return this
    }
})

var AdminPostsView = Backbone.View.extend({
    events: {
        'keydown input[name=filter]': 'filter',
        'keyup input[name=filter]': 'filter'
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
            this.$el.find('tr:last').after(pv.render().$el)
        }.bind(this))
        this.$el.show()
        return this
    }
})
