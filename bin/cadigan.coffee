#!/usr/local/bin/coffee

[command, args] = [process.argv[2], process.argv[3..]]

init_cb = (err, cadigan) ->
    throw err if err
    cadigan[command]?.call(cadigan, args, (err, cadigan) ->
        throw err if err
    )

(require '../lib/cli').init(init_cb)
