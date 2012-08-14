#!/usr/local/bin/coffee
[command, args] = [process.argv[2], process.argv[3..]]

howard = (require '../lib/howard').init()

howard[command]?.apply(howard, args) or console.error(howard.usage())
