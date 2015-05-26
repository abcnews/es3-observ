var ObservableValue = require('./value');

module.exports = ComputedObservable;

function ComputedObservable(observables, fn) {
    var values = [];

    function listener(index) {
        return function (value) {
            values[index] = value;
            c.set(fn.apply(null, values));
        };
    }

    for (var i = 0, len = observables.length; i < len; i++) {
        values.push(observables[i]());
        observables[i](listener(i));
    }

    var c = ObservableValue(fn.apply(null, values));

    return c;
}