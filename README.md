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
        # go to myserver.com:80/admin to start writing

## running with forever

        forever start -c coffee $(which cadigan) start domain 80

## status

things work and it's not ass-slow anymore. code could be far cleaner. Also
security is hateful as it does not currently support SSL; for srs though you'd
probably be running behind nginx or whatever anyway.

i'm dog-fooding this at [chip the glasses](http://chiptheglasses.com).


## roadmap

in no particular order:

 * port to Backbone (replacing sammy.js)
 * SSL for admin
 * post summaries
 * post slugging
 * post scheduling / backdating
 * pagination
 * plugins (site-wide and per-post)
 * themes

## changelog

#### 1.3.2

 * bugfix: feed not linked from home page

#### 1.3.1

 * bugfix: feeds were in reverse order

#### 1.3.0

 * localstorage posts/metadata caching
 * compressed front-end js, css
 * vague style updates

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
