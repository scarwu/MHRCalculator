/**
 * Event Libray
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

let eventList = {}

export const on = (name, key, callback) => {
    if (undefined === eventList[name]) {
        eventList[name] = {}
    }

    eventList[name][key] = callback
}

export const off = (name, key) => {
    if (undefined === eventList[name]) {
        return false
    }

    delete eventList[name][key]
}

export const trigger = (name, arg) => {
    if (undefined === eventList[name]) {
        return false
    }

    for (let key in eventList[name]) {
        eventList[name][key](arg)
    }
}

export default {
    off,
    on,
    trigger
}
