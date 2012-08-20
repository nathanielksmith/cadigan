#!/usr/local/bin/coffee
cli = (require '../lib/cli').cli

[command, args] = [process.argv[2], process.argv[3..]]

cli.init((err) ->
    throw err if err
    cli[command]?.call(cli, args, (err) ->
        throw err if err
    )
)
