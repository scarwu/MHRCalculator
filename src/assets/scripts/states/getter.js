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

export const getModalData = (target) => {
    if (Helper.isEmpty(store.getState().modalHub[target])) {
        return null
    }

    return store.getState().modalHub[target]
}

export const getDataStore = () => {
    return store.getState().dataStore
}

export const getPlayerEquips = () => {
    return store.getState().playerEquips
}

export const getRequiredConditions = () => {
    return store.getState().requiredConditions
}

export default {
    getModalData,
    getDataStore,
    getPlayerEquips,
    getRequiredConditions,

    getRequiredSets: () => {
        return store.getState().requiredSets
    },
    getRequiredSkills: () => {
        return store.getState().requiredSkills
    },
    getRequiredEquips: () => {
        return store.getState().requiredEquips
    },
    getCurrentEquips: () => {
        return store.getState().currentEquips
    },
    getAlgorithmParams: () => {
        return store.getState().algorithmParams
    },
    getComputedResult: () => {
        return store.getState().computedResult
    },
    getReservedBundles: () => {
        return store.getState().reservedBundles
    },
    getCustomWeapon: () => {
        return store.getState().customWeapon
    }
}
