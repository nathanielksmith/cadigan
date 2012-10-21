if (![window.Backbone, window.$, window._, window.templates].reduce(function(p,v) { return p && v }, true)) {
    throw 'missing requirements'
}

console.log('1')
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
    render: function() {
        this.$el.find('.dropdown-menu button').tooltip('destroy')
        this.$el.html(
            this.template.render(this.model.toJSON())
        )
        this.$el.find('.dropdown-menu button').tooltip()
        return this
    }
})

var AdminPostsView = Backbone.View.extend({
    events: {
        'keydown input[name=filter]': 'filter',
        'keyup input[name=filter]': 'filter',
        'click .delete': 'delete',
        'click .publish': 'publish',
        'click .unpublish': 'unpublish'
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
