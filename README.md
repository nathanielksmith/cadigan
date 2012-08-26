# cadigan

_is a tiny, zeroconf blog engine/server_

## features

 * CLI interface (use your $EDITOR)
 * web interface (with autosave and live markdown previews)
 * drafts/published
 * tagging
 * post permalinks
 * atom feed
 * search

## install

        ssh myserver.com
        npm install -g cadigan
        cadigan start myserver.com 80

## running with forever

        forever start -c coffee $(which cadigan) start domain 80

## status

everything works but performance is not given much thought and code could be
far cleaner. Also security is hateful as it does not currently support SSL; for
srs though you'd probably be running behind nginx or whatever anyway.

i'm dog-fooding this at [chip the glasses](http://chiptheglasses.com).


## roadmap

in no particular order:

 * actually caring about performance
 * post summaries
 * post slugging
 * post scheduling / backdating
 * pagination
 * plugins (site-wide and per-post)
 * themes

## changelog

#### 1.2.1

 * bugfix: dropdowns were hilariously broken in admin

#### 1.2.0

 * atom feed
 * front page search

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
