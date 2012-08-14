howard =
    init: ->
        console.log 'init called'
        this
    new: ->
        console.log 'new called'
        this
    edit: ->
        console.log 'edit called'
        this
    delete: ->
        console.log 'delete called'
        this
    usage: -> 'usage'

exports.init = () -> howard.init()
