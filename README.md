# PromiseProcess
PromiseProcess is a helper module that allows you to queue promise-returning functions to be executed in series, as in Promise waterfall, but with the ability to add or delete promise-returning functions after the execution has started.


## Installation
Using npm:
```shell
npm install promise-process
```
Using bower:
```shell
bower install promise-process
```
Download [minified](https://raw.githubusercontent.com/frikeldon/promise-process/master/promiseProcess.min.js) file.


## Quick examples

### Recursive Promises
Given a directory, lists all its files and all files in its subdirectories recursively.
```javascript
var promiseProcess = require('promise-process');
var fs = require('fs');
var path = require('path');

function getFile(filePath) {
    return function(process, list) {
        return new Promise(function(fulfill, reject) {
            fs.stat(filePath, function(err, stat) {
                if (err) return reject(err);
                if (stat.isDirectory()) {
                    process.unshift(listChilds(filePath));
                }
                list.push(filePath);
                fulfill(list);
            });
        });
    };
}

function listChilds(dirPath) {
    return function(process, list) {
        console.log('aqui');
        return new Promise(function(fulfill, reject) {
            fs.readdir(dirPath, function(err, files) {
                if (err) return reject(err);
                files.forEach(function(file) {
                    process.push(getFile(path.join(dirPath, file)));
                });
                fulfill(list);
            });
        });
    };
}

var process = promiseProcess();
process.push(getFile('./'));
process.exec([]).then(function(list) {
    console.log(list);
});
```

### Promises with retry
Check a collection of url sites with three retrials.
```javascript
var promiseProcess = require('promise-process');
var rp = require('request-promise');

function requestWithRetry(url, numTries) {
    return function(ps) {
        return rp('http://' + url).then(function() {
                console.log(url +  'is running.');
        }).catch(function(error) {
            if (--numTries) {
                console.log('KO - ' + url +  '(' + numTries + ' tries left)');
                ps.unshift(ps.current);
            } else {
                console.log(url +  ' is not running.');
            }
        });
    };
}

rp({
    uri: 'http://jsonplaceholder.typicode.com/users',
    json: true
}).then(function(users) {
    var ps = promiseProcess();
    users.forEach(function(user) {
        ps.push(requestWithRetry(user.website, 3));
    });
    return ps.exec();
}).then(function() {
    console.log('done');
}).catch(function(error) {
    console.log('ERROR!');
    console.log(error);
});
```


# API
```javascript
var promiseProcess = require('promise-process');
```


#### promiseProcess(*[Promise]*)
The **promiseProcess()** method creates a new promiseProcess instance. If given, the instance will use the [Promises/A+](https://promisesaplus.com/) compatible constructor for Promise creation, else global Promise constructor will be used.
```javascript
var process = promiseProcess(require('q'));
```

## Properties

### process.length
The **length** property represents an unsigned, 32-bit integer that is always numerically equal than the number of elements in the queue.
```javascript
process.push(...);
process.push(...);
process.length; // 2
```

### process.current
The **current** property exposes the promise-returning functions that are in execution, or null if no execution in progress.
```javascript
process.current; // [Function]
```


## Methods

#### process.push(*[element1]*, *...*, *[elementN]*)
The **push()** method adds one or more elements to the end of the queue and returns the new length of the queue.

The added elements must be promise-returning functions. That functions will be invoked with the promiseProcess instance as a first argument, and the return values of the previous promise as aditional arguments.

```javascript
process.push(
    function(process[, ..params]) { return Promise.resolve(); },
    function(process[, ..params]) { return Promise.resolve(); }
);
```


#### process.pop()
The **pop()** method removes the last element from an array and returns that element.
```javascript
process.pop();
```


#### process.shift()
The **shift()** method removes the first element from an array and returns that element. This method changes the length of the array.
```javascript
process.shift();
```


#### process.unshift(*[element1]*, *...*, *[elementN]*)
The **unshift()** method adds one or more elements to the beginning of an array and returns the new length of the array.


The added elements must be promise-returning functions. That functions will be invoked with the promiseProcess instance as a first argument, and the return values of the previous promise as aditional arguments.

```javascript
process.unshift(
    function(process[, ..params]) { return Promise.resolve(); },
    function(process[, ..params]) { return Promise.resolve(); }
);
```


#### process.exec(*[element1]*, *...*, *[elementN]*)
The **exec()** method remove and execute each element in the queue and returns a Promise of the process.
```javascript
process.exec(param).then(function(result) {
    // Done!
});
```
