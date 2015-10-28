/**
 * @license
 * promise-process 1.0.1 <https://github.com/frikeldon/promise-process>
 * Copyright 2015 frikeldon <http://www.paudr.com/>
 * Available under MIT license <https://github.com/frikeldon/promise-process/blob/master/LICENSE>
 */
;(function(root, factory) {
    var instance = factory();
/* jshint -W117 */
    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) { // AMD
        define(function() { return instance; });
    } else if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) { // Node
            exports = module.exports = instance;
        }
        exports.promiseProcess = instance;
    } else { // browser
      root.promiseProcess = instance;
    }
/* jshint +W117 */
})(this, function() {
    "use strict";

    return function (defaultPromise) {
        var Prom = typeof defaultPromise === 'function' ? defaultPromise : Promise;
        var stream = [];
        var current = null;

        var instance = {
            push: Array.prototype.push.bind(stream),
            pop: Array.prototype.pop.bind(stream),
            shift: Array.prototype.shift.bind(stream),
            unshift: Array.prototype.unshift.bind(stream)
        };

        Object.defineProperty(instance, 'length', {
            get: function() {
                return stream.length;
            }
        });

        Object.defineProperty(instance, 'current', {
            get: function() {
                return current;
            }
        });

        instance.exec = function() {
            var initialArguments = Array.prototype.slice.call(arguments);
            var clearCurrentAnd = function clearCurrentAnd(fn) {
                return function() {
                    current = null;
                    fn.apply(null, arguments);
                };
            };
            return new Prom(function(fulfill, reject) {
                var nextAction = function nextAction() {
                    var params = Array.prototype.slice.call(arguments);
                    if (stream.length === 0) {
                        return fulfill.apply(null, params);
                    }
                    params.unshift(instance);
                    current = stream.shift();
                    return current.apply(null, params)
                        .then(clearCurrentAnd(nextAction))
                        .catch(clearCurrentAnd(reject));
                };
                nextAction.apply(null, initialArguments);
            });
        };

        return instance;
    };

});
