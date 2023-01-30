/**
 * Status Libray
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

let prefix = 'mhrc:2023:1'
let storage = window.localStorage

export const get = (key) => {
    if (undefined === storage[`${prefix}:${key}`]) {
        return undefined
    }

    let dataSet = JSON.parse(storage[`${prefix}:${key}`])

    return dataSet
}

export const set = (key, value) => {
    let dataSet = (undefined !== storage[`${prefix}:${key}`])
        ? JSON.parse(storage[`${prefix}:${key}`]) : {}

    dataSet = value

    storage[`${prefix}:${key}`] = JSON.stringify(dataSet)
}

export const has = (key) => {
    if (undefined === storage[`${prefix}:${key}`]) {
        return undefined
    }

    let dataSet = JSON.parse(storage[`${prefix}:${key}`])

    return undefined !== dataSet
}

export const reset = () => {
    for (let key of storage) {
        delete storage[key]
    }
}

export default {
    get,
    set,
    has,
    reset
}
