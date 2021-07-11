/**
 * Common State - Getter
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core
import Helper from 'core/helper'

import store from './store'

export const getModalData = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().modalHub
    }

    if (Helper.isEmpty(store.getState().modalHub[target])) {
        return null
    }

    return store.getState().modalHub[target]
}

export const getDataStore = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().dataStore
    }

    if (Helper.isEmpty(store.getState().dataStore[target])) {
        return null
    }

    return store.getState().dataStore[target]
}

export const getPlayerEquips = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().playerEquips
    }

    if (Helper.isEmpty(store.getState().playerEquips[target])) {
        return null
    }

    return store.getState().playerEquips[target]
}

export const getRequiredConditions = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().requiredConditions
    }

    if (Helper.isEmpty(store.getState().requiredConditions[target])) {
        return null
    }

    return store.getState().requiredConditions[target]
}

export const getAlgorithmParams = () => {
    return store.getState().algorithmParams
}

export const getCandidateBundles = () => {
    return store.getState().candidateBundles
}

export default {
    getModalData,
    getDataStore,
    getPlayerEquips,
    getRequiredConditions,
    getAlgorithmParams,
    getCandidateBundles
}
