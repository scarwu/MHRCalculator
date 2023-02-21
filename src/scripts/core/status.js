/**
 * Status Libray
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core
import Helper from 'core/helper'

let prefix = 'mhrc:2023:1'
let storage = window.localStorage

export const get = (key) => {
    let dataSet = (Helper.isNotEmpty(storage[`${prefix}:${key}`]))
        ? storage[`${prefix}:${key}`] : null

    try {
        dataSet = JSON.parse(dataSet)
    } catch (error) {
        dataSet = null
    }

    return dataSet
}

export const set = (key, value) => {
    if (Helper.isNotEmpty(value)) {
        storage[`${prefix}:${key}`] = JSON.stringify(value)
    } else {
        delete storage[`${prefix}:${key}`]
    }
}

export const has = (key) => {
    return Helper.isNotEmpty(get(key))
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
