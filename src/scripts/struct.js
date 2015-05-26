var xtend = require('xtend');
var ObservableValue = require('./value');

var blackList = {
    _diff: '_diff is reserved key of ObservableStruct.\n',
    length: 'Clashes with `Function.prototype.length`.\n',
    name: 'Clashes with `Function.prototype.name`.\n'
};

var NO_TRANSACTION = {};

module.exports = ObservableStruct;

function ObservableStruct(struct) {
    var key, initialState, currentTransaction, nestedTransaction, obs, _set;

    initialState = {};
    currentTransaction = NO_TRANSACTION;
    nestedTransaction = NO_TRANSACTION;

    for (key in struct) {
        if (blackList.hasOwnProperty(key)) {
            throw new Error('cannot create an ObservableStruct ' +
                'with a key named \'' + key + '\'.\n' + blackList[key]);
        }

        initialState[key] = isFn(struct[key]) ?
            struct[key]() : struct[key];
    }

    obs = ObservableValue(initialState);

    for (key in struct) {
        obs[key] = struct[key];

        if (isFn(struct[key])) {
            (function (key) {
                struct[key](function (value) {
                    var state;

                    if (nestedTransaction === value) {
                        return;
                    }

                    state = xtend(obs());
                    state[key] = value;
                    state._diff = diff(key, value);
                    currentTransaction = state;
                    obs.set(state);
                    currentTransaction = NO_TRANSACTION;
                });
            })(key);
        }
    }

    _set = obs.set;
    
    obs.set = function set(value) {
        var newState;

        if (currentTransaction === value) {
            return _set(value);
        }

        newState = xtend(value);
        newState._diff = value;
        _set(newState);
    };

    obs(function (newState) {
        var key;

        if (currentTransaction === newState) {
            return;
        }

        for (key in newState) {
            if (!newState.hasOwnProperty(key) || key === '_diff') {
                continue;
            }

            if (isFn(struct[key]) && struct[key]() !== newState[key]) {
                nestedTransaction = newState[key];
                struct[key].set(newState[key]);
                nestedTransaction = NO_TRANSACTION;
            }
        }
    });

    return obs;
}


function isFn(x) {
  return typeof x === 'function';
}

function diff(key, value) {
    var obj = {};
    
    obj[key] = value && value._diff ? value._diff : value;
    
    return obj;
}