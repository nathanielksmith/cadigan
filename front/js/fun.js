var toa = function(a) { return Array.prototype.slice.call(a) }
Function.prototype.p = function() {
    var args = toa(arguments);
    var f = this;
    return function() {
        var inner_args = toa(arguments);
        return f.apply(this, args.concat(inner_args))
    };
};
