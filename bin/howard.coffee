#!/usr/local/bin/coffee

[command, args] = [process.argv[2], process.argv[3..]]

init_cb = (err, howard) ->
    throw err if err
    howard[command]?.call(howard, args, (err, howard) ->
        throw err if err
        console.log 'done.'
    )

(require '../lib/howard').init(init_cb)
