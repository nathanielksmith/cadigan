# cadigan

_is a tiny, zeroconf blog engine/server_

## features

 * CLI interface (use your $EDITOR)
 * web interface (with autosave and live markdown previews)
 * drafts/published
 * tagging
 * post permalinks

## install

        ssh myserver.com
        npm install -g cadigan
        cadigan start myserver.com 80

## status

everything works but performance is not given much thought and code could be
far cleaner. Also security is hateful as it does not currently support SSL; for
srs though you'd probably be running behind nginx or whatever anyway.

## changelog

#### 1.1.0

 * remove navbar
 * upgrade to bootstrap 2.1
 * better admin posts UI
 * CLI search bugfix

#### 1.0.0

 * admin
 * auth
 * writing posts
 * editing posts
 * filtering posts
 * viewing posts
 * tag/post links
 * cli interface
 * autosave
 * tagging
 * live markdown preview

## author

nathanielksmith <nathanielksmith@gmail.com>

## license

GPL3
