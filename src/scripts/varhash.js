var xtend = require('xtend');
var ObservableValue = require('./value');

var blackList = {
    name: 'Clashes with `Function.prototype.name`.\n',
    _diff: '_diff is reserved key of ObservableVarhash.\n',
    _removeListeners: '_removeListeners is reserved key of ObservableVarhash method.\n',
    'delete': 'delete is reserved key of ObservableVarhash method.\n',
    get: 'get is reserved key of ObservableVarhash method.\n',
    put: 'get is reserved key of ObservableVarhash method.\n',
    set: 'set is reserved key of ObservableVarhash method.\n'
};

var NO_TRANSACTION = {};

module.exports = ObservableVarhash;

function identity(x) {
    return x;
}

function isFn(x) {
    return typeof x === 'function';
}

function diff(key, value) {
    var obj = {};
    
    obj[key] = value && value._diff ? value._diff : value;
    
    return obj;
}

function getter(obs) {
    return function get(key) {
        return obs[key];
    };
}

function putter(obs, createValue) {
    return function put(key, value) {
        var observ, state;

        throwIfBlacklisted(key);

        if (value === undefined) {
            throw new Error('Cannot ObservableVarhash.put(key, undefined).');
        }

        observ = isFn(value) ? value : createValue(value, key);
        state = xtend(obs());

        state[key] = isFn(observ) ? observ() : observ;

        if (isFn(obs._removeListeners[key])) {
            obs._removeListeners[key]();
        }

        obs._removeListeners[key] = isFn(observ) ? observ(watch(obs, key)) : null;

        state._diff = diff(key, state[key]);

        obs[key] = observ;
        obs.set(state);

        return obs;
    };
}

function deleter(obs) {
    return function del(key) {
        var state = xtend(obs());

        if (isFn(obs._removeListeners[key])) {
            obs._removeListeners[key]();
        }

        delete obs._removeListeners[key];
        delete state[key];
        delete obs[key];

        obs._diff = diff(key, undefined);

        obs.set(state);

        return obs;
    };
}

function watch(obs, key, currentTransaction) {
    return function listener(value) {
        var state = xtend(obs());

        state[key] = value;
        state._diff = diff(key, value);
        currentTransaction = state;
        obs.set(state);
        currentTransaction = NO_TRANSACTION;
    };
}

function isInBlacklist(key) {
    return blackList.hasOwnProperty(key);
}

function throwIfBlacklisted(key) {
    if (isInBlacklist(key)) {
        throw new Error('cannot create an ObservableVarhash ' +
            'with a key named \'' + key + '\'.\n' + blackList[key]);
    }
}

function ObservableVarhash(hash, createValue) {
    var key, currentTransaction, obs, newState, newValue;

    createValue = isFn(createValue) ? createValue : identity;

    currentTransaction = NO_TRANSACTION;

    obs = ObservableValue({});
    obs._removeListeners = {};
    obs.get = getter(obs);
    obs.put = putter(obs, createValue);
    obs['delete'] = deleter(obs);


    for (key in hash) {
        obs[key] = isFn(hash[key]) ? hash[key] : createValue(hash[key], key);

        if (isFn(hash[key])){
            hash[key](watch(obs, key, currentTransaction));
        }
    }

    newState = {};

    for (key in hash) {
        newValue = obs[key];
        throwIfBlacklisted(key);
        newState[key] = isFn(newValue) ? newValue() : newValue;
    }

    obs.set(newState);

    obs(function (newState) {
        var key;

        if (currentTransaction === newState) {
            return;
        }

        for (key in hash) {
            // if (!newState.hasOwnProperty(key) || key === '_diff') {
            //     continue;
            // }

            if (isFn(hash[key]) && hash[key]() !== newState[key]) {
                hash[key].set(newState[key]);
            }
        }
    });

    return obs;
}