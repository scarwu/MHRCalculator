/**
 * Common State - Setter
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import store from './store'

// Modal Hub
export const showModal = (target, bypassData = null) => {
    store.dispatch({
        type: 'SHOW_MODAL',
        payload: {
            target: target,
            bypassData: bypassData
        }
    })
}

export const hideModal = (target) => {
    store.dispatch({
        type: 'HIDE_MODAL',
        payload: {
            target: target
        }
    })
}

// Data Store
export const switchDataStore = (target, index) => {
    store.dispatch({
        type: 'SWITCH_DATA_STORE',
        payload: {
            target: target,
            index: index
        }
    })
}

// Player Status
export const togglePlayerStatusUsingItem = (flag) => {
    store.dispatch({
        type: 'TOGGLE_PLAYER_STATUS_USING_ITEM',
        payload: {
            flag: flag
        }
    })
}

// Player Equips
export const cleanPlayerEquips = () => {
    store.dispatch({
        type: 'CLEAN_PLAYER_EQUIP'
    })
}

export const replacePlayerEquips = (playerEquips) => {
    store.dispatch({
        type: 'REPLACE_PLAYER_EQUIP',
        payload: {
            playerEquips: playerEquips
        }
    })
}

export const setPlayerEquip = (equipType, equipId) => {
    store.dispatch({
        type: 'SET_PLAYER_EQUIP',
        payload: {
            equipType: equipType,
            equipId: equipId
        }
    })
}

export const setPlayerEquipJewel = (equipType, idIndex, jewelId) => {
    store.dispatch({
        type: 'SET_PLAYER_EQUIP_JEWEL',
        payload: {
            equipType: equipType,
            idIndex: idIndex,
            jewelId: jewelId
        }
    })
}

export const setPlayerEquipEnhance = (equipType, idIndex, enhanceId) => {
    store.dispatch({
        type: 'SET_PLAYER_EQUIP_ENHANCE',
        payload: {
            equipType: equipType,
            idIndex: idIndex,
            enhanceId: enhanceId
        }
    })
}

export const setPlayerEquipCustomDataset = (equipType, customDataset) => {
    store.dispatch({
        type: 'SET_PLAYER_EQUIP_CUSTOM',
        payload: {
            equipType: equipType,
            customDataset: customDataset
        }
    })
}

// Required Conditions
export const cleanRequiredConditions = () => {
    store.dispatch({
        type: 'CLEAN_REQUIRED_CONDITIONS'
    })
}

export const replaceRequiredConditionsEquipData = (equipType, equipData) => {
    store.dispatch({
        type: 'REPLACE_REQUIRED_CONDITIONS_EQUIP',
        payload: {
            equipType: equipType,
            equipData: equipData
        }
    })
}

export const setRequiredConditionsEquip = (equipType, equipId) => {
    store.dispatch({
        type: 'SET_REQUIRED_CONDITIONS_EQUIP',
        payload: {
            equipType: equipType,
            equipId: equipId
        }
    })
}

export const setRequiredConditionsEquipCustomDataset = (equipType, customDataset) => {
    store.dispatch({
        type: 'SET_REQUIRED_CONDITIONS_EQUIP_CUSTOM',
        payload: {
            equipType: equipType,
            customDataset: customDataset
        }
    })
}

export const addRequiredConditionsSet = (setId) => {
    store.dispatch({
        type: 'ADD_REQUIRED_CONDITIONS_SET',
        payload: {
            setId: setId
        }
    })
}

export const removeRequiredConditionsSet = (setId) => {
    store.dispatch({
        type: 'REMOVE_REQUIRED_CONDITIONS_SET',
        payload: {
            setId: setId
        }
    })
}

export const increaseRequiredConditionsSetCount = (setId) => {
    store.dispatch({
        type: 'INCREASE_REQUIRED_CONDITIONS_SET_COUNT',
        payload: {
            setId: setId
        }
    })
}

export const decreaseRequiredConditionsSetCount = (setId) => {
    store.dispatch({
        type: 'DECREASE_REQUIRED_CONDITIONS_SET_COUNT',
        payload: {
            setId: setId
        }
    })
}

export const addRequiredConditionsSkill = (skillId) => {
    store.dispatch({
        type: 'ADD_REQUIRED_CONDITIONS_SKILL',
        payload: {
            skillId: skillId
        }
    })
}

export const removeRequiredConditionsSkill = (skillId) => {
    store.dispatch({
        type: 'REMOVE_REQUIRED_CONDITIONS_SKILL',
        payload: {
            skillId: skillId
        }
    })
}

export const increaseRequiredConditionsSkillLevel = (skillId) => {
    store.dispatch({
        type: 'INCREASE_REQUIRED_CONDITIONS_SKILL_LEVEL',
        payload: {
            skillId: skillId
        }
    })
}

export const decreaseRequiredConditionsSkillLevel = (skillId) => {
    store.dispatch({
        type: 'DECREASE_REQUIRED_CONDITIONS_SKILL_LEVEL',
        payload: {
            skillId: skillId
        }
    })
}


// Algorithm Params
export const setAlgorithmParamsLimit = (limit) => {
    store.dispatch({
        type: 'SET_ALGORITHM_PARAMS_LIMIT',
        payload: {
            limit: limit
        }
    })
}

export const setAlgorithmParamsSort = (sort) => {
    store.dispatch({
        type: 'SET_ALGORITHM_PARAMS_SORT',
        payload: {
            sort: sort
        }
    })
}

export const setAlgorithmParamsOrder = (order) => {
    store.dispatch({
        type: 'SET_ALGORITHM_PARAMS_ORDER',
        payload: {
            order: order
        }
    })
}

export const toggleAlgorithmParamsFlag = (target) => {
    store.dispatch({
        type: 'TOGGLE_ALGORITHM_PARAMS_FLAG',
        payload: {
            target: target
        }
    })
}

export const setAlgorithmParamsUsingFactor = (flag, value) => {
    store.dispatch({
        type: 'SET_ALGORITHM_PARAMS_USING_FACTOR',
        payload: {
            flag: flag,
            value: value
        }
    })
}

// Candidate Bundles
export const cleanCandidateBundles = () => {
    store.dispatch({
        type: 'CLEAN_CANDIDATE_BUNDLES'
    })
}

export const replaceCandidateBundles = (candidateBundles) => {
    store.dispatch({
        type: 'REPLACE_CANDIDATE_BUNDLES',
        payload: {
            candidateBundles: candidateBundles
        }
    })
}

export default {
    showModal,
    hideModal,

    switchDataStore,

    togglePlayerStatusUsingItem,

    cleanPlayerEquips,
    replacePlayerEquips,
    setPlayerEquip,
    setPlayerEquipJewel,
    setPlayerEquipEnhance,
    setPlayerEquipCustomDataset,

    cleanRequiredConditions,
    replaceRequiredConditionsEquipData,
    setRequiredConditionsEquip,
    setRequiredConditionsEquipCustomDataset,
    addRequiredConditionsSet,
    removeRequiredConditionsSet,
    increaseRequiredConditionsSetCount,
    decreaseRequiredConditionsSetCount,
    addRequiredConditionsSkill,
    removeRequiredConditionsSkill,
    increaseRequiredConditionsSkillLevel,
    decreaseRequiredConditionsSkillLevel,

    setAlgorithmParamsLimit,
    setAlgorithmParamsSort,
    setAlgorithmParamsOrder,
    toggleAlgorithmParamsFlag,
    setAlgorithmParamsUsingFactor,

    cleanCandidateBundles,
    replaceCandidateBundles
}
