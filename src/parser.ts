export type StateView = { [key: string]: any };

export function parse(data: StateView, container: string) {
    let states: StateView = {};

    Object.entries(data).forEach(([key, value]) => {
        const keys = key.split("/");
        let index = 0;
        let state = states;
        while (keys[index] in state) {
            state = state[keys[index]];
            index++;
        }
        if (index == keys.length - 1) {
            keys.reverse();
            states = addValue(states, keys, value);
        } else {
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

function addValue(states: StateView, keys: string[], value: any): StateView {
    const key = keys.pop();
    if (key !== undefined && key in states) {
        const substates = addValue(states[key], keys, value);
        states[key] = substates;
    } else if (key !== undefined) {
        states[key] = value;
    }
    return states;
}

function makeStates(keys: string[], value: any): StateView {
    const key = keys.pop();
    if (key !== undefined) {
        const state: StateView = {};
        state[key] = value;
        return makeStates(keys, state);
    }
    return value;
}
