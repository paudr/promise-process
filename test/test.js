var promiseProcess = require('../promiseProcess');
var sinon = require('sinon');
var assert = require('assert');

suite('promise-process', function() {

    test("should run all processes in the queue", function(done) {
        var testCount = 25;
        var spy = sinon.spy(function() {
            return Promise.resolve();
        });

        var process = promiseProcess();
        for (var i = 0; i < testCount; i++) {
            process.push(spy);
        }

        process.exec().then(function() {
            sinon.assert.callCount(spy, testCount);
            done();
        }).catch(function(e) {
            sinon.assert.fail(e);
            done();
        });
    });

    test("should sent to a process the result of the previous process", function(done) {
        var testCount = 25;
        var spy = sinon.spy(function (process, value) {
            return Promise.resolve(value + 1);
        });

        var process = promiseProcess();
        for (var i = 0; i < testCount; i++) {
            process.push(spy);
        }

        process.exec(1).then(function(lastValue) {
            assert.strictEqual(lastValue, testCount + 1);
            sinon.assert.calledWith(spy.lastCall, process, testCount);
            done();
        }).catch(function(e) {
            sinon.assert.fail(e);
            done();
        });
    });

    test("should run processes added during execution", function(done) {
        var spy1 = sinon.spy(function () {
            return Promise.resolve();
        });
        var spy2 = sinon.spy(function (process) {
            process.unshift(spy1);
            process.push(spy1);
            return Promise.resolve();
        });
        var spy3 = sinon.spy(function () {
            return Promise.resolve();
        });

        var process = promiseProcess();
        process.push(spy2);
        process.push(spy3);

        process.exec().then(function() {
            sinon.assert.callOrder(spy2, spy1, spy3, spy1);
            done();
        }).catch(function(e) {
            sinon.assert.fail(e);
            done();
        });
    });

    test("should expose current process", function(done) {
        var getProc = function() {
            var proc = function(process) {
                assert.strictEqual(process.current, proc);
                return Promise.resolve();
            };
            return proc;
        };

        var proc1 = getProc();
        var proc2 = getProc();
        var proc3 = getProc();

        var process = promiseProcess();
        process.push(proc1);
        process.push(proc2);
        process.push(proc3);

        process.exec().then(function() {
            done();
        }).catch(function(e) {
            sinon.assert.fail(e);
            done();
        });
    });
});
