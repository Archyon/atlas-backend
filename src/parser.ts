import { APIError } from "./errors/api_error";
import { APIErrorCode } from "./errors/api_error_codes";

export type StateView = { [key: string]: any };

/**
 * Make a new JSON based on the given argument `data`. This is a JSON where each key is a string consisting of
 * keys separated by `/`.
 * For example: if a key-value pair of `data` equals to "key1/key2/key3": "value", this will be converted to
 *      "key1": {
 *          "key2": {
 *              "key3": "value
 *          }
 *      }
 * @param data  => a JSON of the form {[key: string]: any} that is not allowed to be empty
 * @param container => a string that will become the most outer key of the new JSON
 */
export function parse(data: StateView, container: string) {
    let states: StateView = {};

    if (Object.entries(data).length === 0) {
        throw new APIError(APIErrorCode.BAD_REQUEST);
    }

    Object.entries(data).forEach(([key, value]) => {
        const keys = key.split("/");
        let index = 0;
        let state = states;
        while (keys[index] in state) {
            state = state[keys[index]];
            index++;
        }
        if (index == keys.length - 1) {
            // only the last key doesn't exist in the current JSON (`states`)
            keys.reverse();
            states = addValue(states, keys, value);
        } else {
            // create a temporary JSON of the states that are not present in the current JSON (`states`)
            const newstates = makeStates(keys.slice(index), value);
            if (index > 0) {
                states[keys[index - 1]] = Object.assign(
                    {},
                    states[keys[index - 1]],
                    newstates,
                );
            } else {
                states = Object.assign({}, states, newstates);
            }
        }
    });
    const result: StateView = {};
    result[container] = states;
    return result;
}

/**
 * Add a new {key: value} to the current JSON (`states`)
 * @param states
 * @param keys  => a list of keys, only the first key is not present in `states` and should be added with its value
 * @param value => the value to be added with the first key of `keys`
 */
function addValue(states: StateView, keys: string[], value: any): StateView {
    const key = keys.pop();
    if (key !== undefined && key in states) {
        states[key] = addValue(states[key], keys, value);
    } else if (key !== undefined) {
        states[key] = value;
    }
    return states;
}

/**
 * Create a JSON with the keys and the final value.
 * For example, if `keys` equals to ["key1", "key2", "key3"] and `value` equals to "value",
 * then the corresponding JSON should be
 *      "key1": {
 *          "key2": {
 *              "key3": "value"
 *          }
 *      }
 * @param keys
 * @param value
 */
function makeStates(keys: string[], value: any): StateView {
    const key = keys.pop();
    if (key !== undefined) {
        const state: StateView = {};
        state[key] = value;
        return makeStates(keys, state);
    }
    return value;
}

/**
 * Changes values in a JSON object or add new values. Return the changed JSON and the values that were changed or added.
 * @param states   => the JSON object to be changed
 * @param data      => the keys that could be changed/added to the same or a new value
 */
export function changeValues(states: StateView, data: StateView) {
    const changed: StateView = {};
    Object.entries(data).forEach(([key, value]) => {
        const keys = key.split("/");
        let index = 0;
        let state = states;
        while (index < keys.length && keys[index] in state) {
            state = state[keys[index]];
            index++;
        }
        if (index === keys.length) {
            // the key already exists, so we have to check if the value changes
            index--;
            if (state != value) {
                changed[key] = value;
                keys.reverse();
                states = changeValue(states, keys, value);
            }
        } else {
            // the key does nog exist yet so a new one has to be made
            changed[key] = value;
            const newstates = makeStates(keys.slice(index), value);
            const temp = keys.slice(0, index + 1);
            temp.reverse();
            states = changeValue(states, temp, newstates[keys[index]]);
        }
    });
    return {
        states: states,
        changed: changed,
    };
}

/**
 * Change the value of a key in a JSON
 * @param states    => the JSON object
 * @param keys      => the path to the key of which the value needs to be changed
 * @param value     => the new value for the key
 */
function changeValue(states: StateView, keys: string[], value: any): StateView {
    const key = keys.pop();
    if (keys.length === 0 && key !== undefined) {
        states[key] = value;
        return states;
    } else if (key !== undefined) {
        states[key] = changeValue(states[key], keys, value);
    }
    return states;
}

/**
 * Retrieve only the given paths from a JSON object.
 * @param states    => the JSON object
 * @param paths     => a list of paths of keys that need to be retrieved, each path is of the format `key1/key2/key3...`
 */
export function retrievePaths(states: StateView, paths: string[]): StateView {
    let retrieved: StateView = {};
    for (const path of paths) {
        const keys = path.split("/");
        keys.reverse();
        retrieved = retrievePath(states, keys, retrieved);
    }
    return retrieved;
}

/**
 * Retrieve a specific path from a JSON object. This is a recursive function where the given JSON object (`states`)
 * reduces at every function call.
 * @param states    => the JSON object
 * @param keys      => the path of keys to store at `result`
 * @param result    => the result is given along as argument and changes in every function call
 */
function retrievePath(states: StateView, keys: string[], result: StateView) {
    const key = keys.pop();
    if (key !== undefined && keys.length === 0) {
        result[key] = states[key];
    } else if (key !== undefined) {
        if (key in result) {
            const value = retrievePath(states[key], keys, result[key]);
            result[key] = Object.assign({}, result[key], value);
        } else {
            result[key] = retrievePath(states[key], keys, {});
        }
    }
    return result;
}
