functional-node is a port of the Functional Javascript library.
 https://github.com/bailus/functional-node

Functional defines higher-order methods and functions for functional
and function-level programming.  It also defines "string lambdas",
that allow strings such as `x+1` and `x -> x+1` to be used in some
contexts as functions.

It is licensed under the MIT License.

For more details, see 
 http://osteele.com/javascripts/functional

Credits:
 - Samuel Bailey <sam@bailey.geek.nz> -- node.js port
 - Oliver Steele -- original author
 - Dean Edwards -- Array.slice suggestion
 - henrah -- Function.lambda memoization
 - Raganwald -- Rhino compatibility
 - Jesse Hallett -- Spidermonkey shell compatibiilty

Usage:
//load the Functional.* methods into the global namespace:
global.Functional = require('functional-node').load();
Functional.curry('a/b', 1)(2);
 → 0.5

//or inject the Functional.* methods directly into the global namespace:
require('functional-node').load().install();
curry('a/b', 1)(2);
 → 0.5

//or load Functional without touching the global namespace:
var Functional = require('functional-node').load();
Functional.curry('a/b', 1)(2);
 → 0.5

Run tests:
$ node debugify.js -f ./tests.js

Run examples:
$ node debugify.js -f ./examples.js
