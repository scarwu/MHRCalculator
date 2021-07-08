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

// Player Equips
export const cleanPlayerEquips = () => {
    store.dispatch({
        type: 'CLEAN_PLAYER_EQUIP'
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

// Required Conditions
export const cleanRequiredConditions = () => {
    store.dispatch({
        type: 'CLEAN_REQUIRED_CONDITIONS'
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

export const setRequiredConditionsEquipJewel = (equipType, jewelId, idIndex) => {
    store.dispatch({
        type: 'SET_REQUIRED_CONDITIONS_EQUIP_JEWEL',
        payload: {
            equipType: equipType,
            jewelId: jewelId,
            idIndex: idIndex
        }
    })
}

export const addRequiredConditionsSet = () => {

}

export const removeRequiredConditionsSet = () => {

}

export const increaseRequiredConditionsSetCount = () => {

}

export const decreaseRequiredConditionsSetCount = () => {

}

export const addRequiredConditionsSkill = () => {

}

export const removeRequiredConditionsSkill = () => {

}

export const increaseRequiredConditionsSkillLevel = () => {

}

export const decreaseRequiredConditionsSkillLevel = () => {

}

export default {
    showModal,
    hideModal,

    switchDataStore,

    cleanPlayerEquips,
    setPlayerEquip,
    setPlayerEquipJewel,
    setPlayerEquipEnhance,

    cleanRequiredConditions,
    setRequiredConditionsEquip,
    setRequiredConditionsEquipJewel,

    addRequiredConditionsSet,
    removeRequiredConditionsSet,
    increaseRequiredConditionsSetCount,
    decreaseRequiredConditionsSetCount,

    addRequiredConditionsSkill,
    removeRequiredConditionsSkill,
    increaseRequiredConditionsSkillLevel,
    decreaseRequiredConditionsSkillLevel,

    // Required Sets
    addRequiredSet: (setId) => {
        store.dispatch({
            type: 'ADD_REQUIRED_SET',
            payload: {
                setId: setId
            }
        })
    },
    removeRequiredSet: (setId) => {
        store.dispatch({
            type: 'REMOVE_REQUIRED_SET',
            payload: {
                setId: setId
            }
        })
    },
    increaseRequiredSetStep: (setId) => {
        store.dispatch({
            type: 'INCREASE_REQUIRED_SET_STEP',
            payload: {
                setId: setId
            }
        })
    },
    decreaseRequiredSetStep: (setId) => {
        store.dispatch({
            type: 'DECREASE_REQUIRED_SET_STEP',
            payload: {
                setId: setId
            }
        })
    },
    cleanRequiredSets: () => {
        store.dispatch({
            type: 'CLEAN_REQUIRED_SETS'
        })
    },

    // Required Skills
    addRequiredSkill: (skillId) => {
        store.dispatch({
            type: 'ADD_REQUIRED_SKILL',
            payload: {
                skillId: skillId
            }
        })
    },
    removeRequiredSkill: (skillId) => {
        store.dispatch({
            type: 'REMOVE_REQUIRED_SKILL',
            payload: {
                skillId: skillId
            }
        })
    },
    increaseRequiredSkillLevel: (skillId) => {
        store.dispatch({
            type: 'INCREASE_REQUIRED_SKILL_LEVEL',
            payload: {
                skillId: skillId
            }
        })
    },
    decreaseRequiredSkillLevel: (skillId) => {
        store.dispatch({
            type: 'DECREASE_REQUIRED_SKILL_LEVEL',
            payload: {
                skillId: skillId
            }
        })
    },
    cleanRequiredSkills: () => {
        store.dispatch({
            type: 'CLEAN_REQUIRED_SKILLS'
        })
    },

    // Required Equips
    setRequiredEquips: (equipType, currentEquip) => {
        store.dispatch({
            type: 'SET_REQUIRED_EQUIPS',
            payload: {
                equipType: equipType,
                currentEquip: currentEquip
            }
        })
    },
    cleanRequiredEquips: () => {
        store.dispatch({
            type: 'CLEAN_REQUIRED_EQUIPS'
        })
    },

    // CurrentEquips
    setCurrentEquip: (data) => {
        store.dispatch({
            type: 'SET_CURRENT_EQUIP',
            payload: {
                data: data
            }
        })
    },
    replaceCurrentEquips: (data) => {
        store.dispatch({
            type: 'REPLACE_CURRENT_EQUIPS',
            payload: {
                data: data
            }
        })
    },
    cleanCurrentEquips: () => {
        store.dispatch({
            type: 'CLEAN_CURRENT_EQUIPS'
        })
    },

    // Algorithm Params
    setAlgorithmParamsLimit: (limit) => {
        store.dispatch({
            type: 'SET_ALGORITHM_PARAMS_LIMIT',
            payload: {
                limit: limit
            }
        })
    },
    setAlgorithmParamsSort: (sort) => {
        store.dispatch({
            type: 'SET_ALGORITHM_PARAMS_SORT',
            payload: {
                sort: sort
            }
        })
    },
    setAlgorithmParamsOrder: (order) => {
        store.dispatch({
            type: 'SET_ALGORITHM_PARAMS_ORDER',
            payload: {
                order: order
            }
        })
    },
    toggleAlgorithmParamsFlag: (target) => {
        store.dispatch({
            type: 'TOGGLE_ALGORITHM_PARAMS_FLAG',
            payload: {
                target: target
            }
        })
    },
    setAlgorithmParamsUsingFactor: (target, flag, value) => {
        store.dispatch({
            type: 'SET_ALGORITHM_PARAMS_USING_FACTOR',
            payload: {
                target: target,
                flag: flag,
                value: value
            }
        })
    },

    // Computed Result
    saveComputedResult: (data) => {
        store.dispatch({
            type: 'UPDATE_COMPUTED_RESULT',
            payload: {
                data: data
            }
        })
    },
    cleanComputedResult: () => {
        store.dispatch({
            type: 'UPDATE_COMPUTED_RESULT',
            payload: {
                data: null
            }
        })
    },

    // Reserved Bundles
    addReservedBundle: (data) => {
        store.dispatch({
            type: 'ADD_RESERVED_BUNDLE',
            payload: {
                data: data
            }
        })
    },
    updateReservedBundleName: (index, name) => {
        store.dispatch({
            type: 'UPDATE_RESERVED_BUNDLE_NAME',
            payload: {
                index: index,
                name: name
            }
        })
    },
    removeReservedBundle: (index) => {
        store.dispatch({
            type: 'REMOVE_RESERVED_BUNDLE',
            payload: {
                index: index
            }
        })
    },

    // Custom Weapon
    replaceCustomWeapon: (data) => {
        store.dispatch({
            type: 'REPLACE_CUSTOM_WEAPON',
            payload: {
                data: data
            }
        })
    },
    setCustomWeaponValue: (target, value) => {
        store.dispatch({
            type: 'SET_CUSTOM_WEAPON_VALUE',
            payload: {
                target: target,
                value: value
            }
        })
    },
    setCustomWeaponElderseal: (affinity) => {
        store.dispatch({
            type: 'SET_CUSTOM_WEAPON_ELDERSEAL',
            payload: {
                affinity: affinity
            }
        })
    },
    setCustomWeaponSharpness: (step) => {
        store.dispatch({
            type: 'SET_CUSTOM_WEAPON_SHARPNESS',
            payload: {
                step: step
            }
        })
    },
    setCustomWeaponElementType: (target, type) => {
        store.dispatch({
            type: 'SET_CUSTOM_WEAPON_ELEMENT_TYPE',
            payload: {
                target: target,
                type: type
            }
        })
    },
    setCustomWeaponElementValue: (target, value) => {
        store.dispatch({
            type: 'SET_CUSTOM_WEAPON_ELEMENT_VALUE',
            payload: {
                target: target,
                value: value
            }
        })
    },
    setCustomWeaponSlot: (index, size) => {
        store.dispatch({
            type: 'SET_CUSTOM_WEAPON_SLOT',
            payload: {
                index: index,
                size: size
            }
        })
    },
    setCustomWeaponSkill: (index, id) => {
        store.dispatch({
            type: 'SET_CUSTOM_WEAPON_SKILL',
            payload: {
                index: index,
                id: id
            }
        })
    },
    setCustomWeaponSet: (id) => {
        store.dispatch({
            type: 'SET_CUSTOM_WEAPON_SET',
            payload: {
                id: id
            }
        })
    }
}
