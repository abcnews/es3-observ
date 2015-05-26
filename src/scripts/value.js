module.exports = ObservableValue;

function ObservableValue(value) {
    var listeners = [];

    value = value === undefined ? null : value;

    function obs(listener) {
        if (!listener) {
            return value;
        }

        listeners.push(listener);

        return function remove() {
            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        };
    }

    obs.set = function (v) {
        value = v;

        for (var i = 0, len = listeners.length; i < len; i++) {
            listeners[i](v);
        }
    };

    return obs;
}