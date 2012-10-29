(function() {
    // require public, admin, models, templates, util
    // create cadigan object
    // do setup code (routers, meta view)
    // backbone history start
    var Post = models.Post,
        Posts = models.Posts,
        Metadata = models.Metadata

    var converter = new Showdown.converter();
    window.md2html = function(text) { return converter.makeHtml(text) }
    window.datefmt = function(ts) { return String(new Date(ts*1000)).split(' ').slice(0,5).join(' ') }

    var meta = new Metadata
    meta_view = new MetaView({ model:meta, el: $('#header') })
    meta.fetch()

    var CadiganApp = {
        models: models,
        pub_router: new PublicCadiganRouter,
        admin_router: new AdminCadiganRouter
    }
    window.CadiganApp = CadiganApp

    Backbone.history.start({pushState:false})
}).apply(window)
