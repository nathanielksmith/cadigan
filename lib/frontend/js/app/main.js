(function() {
    // require public, admin, models, templates, util
    // create cadigan object
    // do setup code (routers, meta view)
    // backbone history start

    var Metadata = cadigan_models.Metadata,
        MetaView = cadigan_public.MetaView,
        converter = new Showdown.converter()

    window.CadiganApp = {
        models: models,
        md2html: function(text) { return converter.makeHtml(text) },
        datefmt: function(ts) { return String(new Date(ts*1000)).split(' ').slice(0,5).join(' ') },
        templates: window.cadigan_templates,
    }
    CadiganApp.pub_router = new cadigan_public.PublicRouter
    CadiganApp.admin_router = new cadigan_admin.AdminRouter

    // main

    var meta = new Metadata
    meta_view = new MetaView({ model:meta, el: $('#header') })
    meta.fetch()

    Backbone.history.start({pushState:false})
})()
