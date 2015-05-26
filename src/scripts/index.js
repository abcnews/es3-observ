/*!
 * es3-observ
 *
 * @version development
 * @author Colin Gourlay <gourlay.colin@abc.net.au>
 */

var ObservableValue = require('./value');
var ObservableStruct = require('./struct');
var ObservableVarhash = require('./varhash');
var ComputedObservable = require('./computed');

function observ(value) {
    return ObservableValue(value);
}

observ.value = ObservableValue;
observ.struct = ObservableStruct;
observ.varhash = ObservableVarhash;
observ.computed = ComputedObservable;

module.exports = observ;
