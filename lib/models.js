var bb = require('backbone'),
    _ = require('underscore')

// TODO
//if (window) {
//    module = {exports:{}}
//    window.cadigan_models = module.exports
//}

var CadiganModel = bb.Model.extend({
    idAttribute: '_id'
})

var Metadata = CadiganModel.extend({
    initialize: function() {
        this._id = 'meta'
    }
})
var Authdata = CadiganModel.extend({
    initialize: function() {
        this._id = 'auth'
    }
})
var Authored = CadiganModel.extend({
    initialize: function() {
        this.set('published', false)
    }
})

var Post = Authored.extend({
})

var Page = Authored.extend({
})

module.exports = {
    Metadata:Metadata,
    Authdata: Authdata,
    Post: Post,
    Authored:Authored
}
