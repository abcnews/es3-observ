#es3-observ

An ES3-compatible rewrite of core 'observ' modules, exposed as a single API:

* [observ](https://github.com/Raynos/observ)
* [observ-struct](https://github.com/Raynos/observ-struct)
* [observ-varhash](https://github.com/nrw/observ-varhash)

## Getting Started

Observable can be used in any node/browserify project out of the box:

    var observ = require('es3-observ')

For global usage or AMD, you'll want to build the library (see Grunt Tasks below);

## Basic Usage

Create an observable with an optional initial value:

    var o = observ(1);

(if you don't pass an initial value, it will be set to `null`).

To get the value of the observable at any time, call it with no arguments:

    var value = o();

    console.log(value);

    >>> 1

To bind listeners to the observable, call it with a function:

    o(function (value) {
        console.log('[A]', value);
    });

This function will be called every time the observable changes.

To set the value of the observable, call its `set` method:

    o.set(2);
    >>> [A] 2

If you assigned your listeners to a variable, you can call that to remove that listener:

    var listenerB = o(function (value) {
        console.log('[B]', value);
    });

    o.set(3);

    >>> [A] 3
    >>> [B] 3

    listenerB();
    o.set(4);

    >>> [A] 4

## API

### `observ.value` (aliased to `observ`)

Described in Basic Usage

### `observ.computed`

Creates an observable which will update when any dependent observables change:

    var oA = observ.value(1);
    var oB = observ.value(1);
    var oC = observ.computed([oA, oB], function (vA, vB) {
        return vA + vB;
    });

    oA(function (value) { console.log('[A]', value); });
    oB(function (value) { console.log('[B]', value); });
    oC(function (value) { console.log('[C]', value); });

    oA.set(2);

    >>> [C] 3
    >>> [A] 2

    oB.set(2);

    >>> [C] 4
    >>> [B] 2

### `observ.struct`

Create an observable object which will update when any child observables change, and provide direct access to child observables.

    var o = observ.struct({
        a: observ.value(1),
        b: observ.value(1)
    });

    o.a(function (value) { console.log('[A]', value); });
    o.b(function (value) { console.log('[B]', value); });
    o(function (obj) { console.log('[S]', obj.a + obj.b); });

    o.a.set(2);

    >>> [S] 3
    >>> [A] 2

    o.b.set(2);

    >>> [S] 4
    >>> [B] 2

### `observ.varhash`

Create an observable mapping of keys to values which will update when any value changes, provide access to values through a `get` method, and allow insert/update and deletion of keys with the `put` and `delete` methods.

    var o = observ.varhash({});

    o(function (hash) {
        var sum = 0;

        for (var key in hash) {
            sum += hash[key];
        }

        console.log('[V]', sum);
    });

    o.put('a', 1);

    >>> [V] 1

    console.log(o.get('a'));

    >>> 1

    o.put('b', 2);

    >>> [V] 3

    o.put('a', 2);

    >>> [V] 4

    o['delete']('b');

    >>> [V] 2

## Examples

Run the development grunt task (instructions below) and open [http://localhost:8000](http://localhost:8000) in your browser. You'll find basic examples of ObservableValue, ComputedObservable, ObservableStruct & ObservableVarhash, as well as the code that created them.

## Development

```
$ npm start
```

This will run `npm install` to locally install Node package dependencies, then run the default grunt task which:

* Runs `grunt dev` to create a development build (see Tasks, below)
* Starts up a development server in the build directory, running on [http://localhost:8000](http://localhost:8000)
* Watches files under `src/` for changes, triggering partial development builds as required

### Grunt Tasks

The build tasks transform the project source in `src/` into a build under `build/`.

#### Development Build: `$ grunt dev`

Creates a local development build of the project.

* JS in `scripts/` is linted by [JSHint](http://jshint.com/), then bundled by [Browserify](http://browserify.org/) into `scripts/index.js`
* All other directories/files under `src/` are copied directly across (such as `index.html` where the interactive examples live)

A global `observ` object is exposed when you run `build/scripts/index.js` globally or use an AMD loader.

#### Production Build: `$ grunt prod`

Creates a production-ready standalone build of the project.

The build process is similar to the development build, except the script is minified

#### Default: `$ grunt`
