/**
 * Common State - Getter
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from 'core/helper'
import Store from './store'

export const getModalData = (target) => {
    if (Helper.isEmpty(Store.getState().modalHub[target])) {
        return null
    }

    return Store.getState().modalHub[target]
}

export const getPlayerEquips = () => {
    return Store.getState().playerEquips
}

export const getRequiredConditions = () => {
    return Store.getState().requiredConditions
}

export default {
    getModalData,
    getPlayerEquips,
    getRequiredConditions,

    getTempData: () => {
        return Store.getState().tempData
    },
    getRequiredSets: () => {
        return Store.getState().requiredSets
    },
    getRequiredSkills: () => {
        return Store.getState().requiredSkills
    },
    getRequiredEquips: () => {
        return Store.getState().requiredEquips
    },
    getCurrentEquips: () => {
        return Store.getState().currentEquips
    },
    getAlgorithmParams: () => {
        return Store.getState().algorithmParams
    },
    getComputedResult: () => {
        return Store.getState().computedResult
    },
    getReservedBundles: () => {
        return Store.getState().reservedBundles
    },
    getCustomWeapon: () => {
        return Store.getState().customWeapon
    }
}
