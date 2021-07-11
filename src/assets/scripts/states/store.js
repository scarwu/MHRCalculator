/**
 * Common State - Store
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import { createStore, applyMiddleware } from 'redux'

// Load Constant
import Constant from 'constant'

// Load Core
import Status from 'core/status'
import Helper from 'core/helper'

// Load Libraries
import Misc from 'libraries/misc'
import WeaponDataset from 'libraries/dataset/weapon'
import ArmorDataset from 'libraries/dataset/armor'
import SetDataset from 'libraries/dataset/set'
import PetalaceDataset from 'libraries/dataset/petalace'
import JewelDataset from 'libraries/dataset/jewel'
import EnhanceDataset from 'libraries/dataset/enhance'
import SkillDataset from 'libraries/dataset/skill'

const statusMapping = {
    modalHub: 'state:modalHub',
    dataStore: 'state:dataStore',
    requiredConditions: 'state:requiredConditions',
    playerEquips: 'state:playerEquips',
    algorithmParams: 'state:algorithmParams',
    // computedResult: 'state:computedResult',
    // reservedPlayerEquip: 'state:reservedPlayerEquip',
    // customWeapon: 'state:customWeapon'
}

// Middleware
const diffLogger = store => next => action => {
    let prevState = store.getState()
    let result = next(action)
    let nextState = store.getState()
    let diffState = {}

    for (let key in prevState) {
        if (JSON.stringify(prevState[key]) === JSON.stringify(nextState[key])) {
            continue
        }

        diffState[key] = nextState[key]

        Status.set(statusMapping[key], nextState[key])
    }

    Helper.debug('State: Common -> action', action)
    Helper.debug('State: Common -> diffState', diffState)

    return result
}

// Initial State
const initialState = {
    modalHub: Status.get(statusMapping.modalHub) || {},
    dataStore: Status.get(statusMapping.dataStore) || {
        requiredConditions: {
            index: 0,
            list: [],
            emptyItem: Helper.deepCopy(Constant.defaultRequiredConditions)
        },
        playerEquips: {
            index: 0,
            list: [],
            emptyItem: Helper.deepCopy(Constant.defaultPlayerEquips)
        },
        candidateBundles: {
            index: 0,
            list: [],
            emptyItem: {}
        }
    },
    requiredConditions: Status.get(statusMapping.requiredConditions) || Helper.deepCopy(Constant.defaultRequiredConditions),
    playerEquips: Status.get(statusMapping.playerEquips) || Helper.deepCopy(Constant.defaultPlayerEquips),
    algorithmParams: Status.get(statusMapping.algorithmParams) || Helper.deepCopy(Constant.defaultAlgorithmParams),
    // computedResult: Status.get(statusMapping.computedResult) || null,
    // reservedPlayerEquip: Status.get(statusMapping.reservedPlayerEquip) || []
}

export default createStore((state = initialState, action) => {
    switch (action.type) {

        // Modal Hub
        case 'SHOW_MODAL':
            return (() => {
                let modalHub = Helper.deepCopy(state.modalHub)
                let target = action.payload.target
                let bypassData = action.payload.bypassData

                modalHub[target] = Helper.isNotEmpty(bypassData) ? bypassData : {}

                return Object.assign({}, state, {
                    modalHub: modalHub
                })
            })()
        case 'HIDE_MODAL':
            return (() => {
                let modalHub = Helper.deepCopy(state.modalHub)
                let target = action.payload.target

                modalHub[target] = null

                return Object.assign({}, state, {
                    modalHub: modalHub
                })
            })()

        // Data Store
        case 'SWITCH_DATA_STORE':
            return (() => {
                let dataStore = Helper.deepCopy(state.dataStore)
                let target = action.payload.target
                let index = action.payload.index

                if (Helper.isEmpty(dataStore[target])) {
                    return state
                }

                if (index === dataStore[target].index) {
                    return state
                }

                if (Helper.isEmpty(state[target])) {
                    return state
                }

                let newData = Helper.deepCopy(state[target])
                let oldData = Helper.isNotEmpty(dataStore[target].list[index])
                    ? Helper.deepCopy(dataStore[target].list[index])
                    : Helper.deepCopy(dataStore[target].emptyItem)

                dataStore[target].list[dataStore[target].index] = newData
                dataStore[target].index = index

                let newState = {}

                newState.dataStore = dataStore
                newState[target] = oldData

                return Object.assign({}, state, newState)
            })()

        // Player Equips
        case 'CLEAN_PLAYER_EQUIP':
            return (() => {
                return Object.assign({}, state, {
                    playerEquips: Helper.deepCopy(Constant.defaultPlayerEquips)
                })
            })()

        case 'REPLACE_PLAYER_EQUIP':
            return (() => {
                return Object.assign({}, state, {
                    playerEquips: Helper.deepCopy(action.payload.playerEquips)
                })
            })()

        case 'SET_PLAYER_EQUIP':
            return (() => {
                let playerEquips = Helper.deepCopy(state.playerEquips)
                let equipType = action.payload.equipType
                let equipId = action.payload.equipId

                if (Helper.isEmpty(playerEquips[equipType])) {
                    return state
                }

                playerEquips[equipType] = Helper.deepCopy(Constant.defaultPlayerEquips[equipType])
                playerEquips[equipType].id = equipId

                return Object.assign({}, state, {
                    playerEquips: playerEquips
                })
            })()

        case 'SET_PLAYER_EQUIP_JEWEL':
            return (() => {
                let playerEquips = Helper.deepCopy(state.playerEquips)
                let equipType = action.payload.equipType
                let idIndex = action.payload.idIndex
                let jewelId = action.payload.jewelId

                if (Helper.isEmpty(playerEquips[equipType])) {
                    return state
                }

                playerEquips[equipType].jewelIds[idIndex] = jewelId

                return Object.assign({}, state, {
                    playerEquips: playerEquips
                })
            })()

        case 'SET_PLAYER_EQUIP_ENHANCE':
            return (() => {
                let playerEquips = Helper.deepCopy(state.playerEquips)
                let equipType = action.payload.equipType
                let idIndex = action.payload.idIndex
                let enhanceId = action.payload.enhanceId

                if (Helper.isEmpty(playerEquips[equipType])) {
                    return state
                }

                playerEquips[equipType].enhanceIds[idIndex] = enhanceId

                return Object.assign({}, state, {
                    playerEquips: playerEquips
                })
            })()

        // Required Conditions
        case 'CLEAN_REQUIRED_CONDITIONS':
            return (() => {
                return Object.assign({}, state, {
                    requiredConditions: Helper.deepCopy(Constant.defaultRequiredConditions)
                })
            })()

        case 'SET_REQUIRED_CONDITIONS_EQUIP':
            return (() => {
                let requiredConditions = Helper.deepCopy(state.requiredConditions)
                let equipType = action.payload.equipType
                let equipId = action.payload.equipId

                if (Helper.isEmpty(requiredConditions.equips[equipType])) {
                    return state
                }

                requiredConditions.equips[equipType] = Helper.deepCopy(Constant.defaultPlayerEquips[equipType])
                requiredConditions.equips[equipType].id = equipId

                return Object.assign({}, state, {
                    requiredConditions: requiredConditions
                })
            })()

        case 'SET_REQUIRED_CONDITIONS_EQUIP_JEWEL':
            return (() => {
                let requiredConditions = Helper.deepCopy(state.requiredConditions)
                let equipType = action.payload.equipType
                let idIndex = action.payload.idIndex
                let jewelId = action.payload.jewelId

                if (Helper.isEmpty(requiredConditions.equips[equipType])) {
                    return state
                }

                requiredConditions.equips[equipType].jewelIds[idIndex] = jewelId

                return Object.assign({}, state, {
                    requiredConditions: requiredConditions
                })
            })()

        case 'ADD_REQUIRED_CONDITIONS_SET':
            return (() => {
                let requiredConditions = Helper.deepCopy(state.requiredConditions)
                let setId = action.payload.setId

                // Get Item
                let setItem = SetDataset.getItem(setId)

                if (Helper.isEmpty(setItem)) {
                    return state
                }

                if (3 > setItem.items.length) {
                    return state
                }

                for (let setData of requiredConditions.sets) {
                    if (setData.id === setId) {
                        return state
                    }
                }

                requiredConditions.sets = [] // Force Reset
                requiredConditions.sets.push({
                    id: setId,
                    count: 3
                })

                return Object.assign({}, state, {
                    requiredConditions: requiredConditions
                })
            })()

        case 'REMOVE_REQUIRED_CONDITIONS_SET':
            return (() => {
                let requiredConditions = Helper.deepCopy(state.requiredConditions)
                let setId = action.payload.setId

                // Get Item
                let setItem = SetDataset.getItem(setId)

                if (Helper.isEmpty(setItem)) {
                    return state
                }

                requiredConditions.sets = requiredConditions.sets.filter((setData) => {
                    return setData.id !== setId
                })

                return Object.assign({}, state, {
                    requiredConditions: requiredConditions
                })
            })()

        case 'INCREASE_REQUIRED_CONDITIONS_SET_COUNT':
            return (() => {
                let requiredConditions = Helper.deepCopy(state.requiredConditions)
                let setId = action.payload.setId

                // Get Item
                let setItem = SetDataset.getItem(setId)

                if (Helper.isEmpty(setItem)) {
                    return state
                }

                for (let setData of requiredConditions.sets) {
                    if (setData.id !== setId) {
                        continue
                    }

                    if ((setData.count + 1) > setItem.items.length) {
                        return state
                    }

                    setData.count++

                    break
                }

                return Object.assign({}, state, {
                    requiredConditions: requiredConditions
                })
            })()

        case 'DECREASE_REQUIRED_CONDITIONS_SET_COUNT':
            return (() => {
                let requiredConditions = Helper.deepCopy(state.requiredConditions)
                let setId = action.payload.setId

                // Get Item
                let setItem = SetDataset.getItem(setId)

                if (Helper.isEmpty(setItem)) {
                    return state
                }

                for (let setData of requiredConditions.sets) {
                    if (setData.id !== setId) {
                        continue
                    }

                    if ((setData.count - 1) < 3) {
                        return state
                    }

                    setData.count--

                    break
                }

                return Object.assign({}, state, {
                    requiredConditions: requiredConditions
                })
            })()

        case 'ADD_REQUIRED_CONDITIONS_SKILL':
            return (() => {
                let requiredConditions = Helper.deepCopy(state.requiredConditions)
                let skillId = action.payload.skillId

                // Get Item
                let skillItem = SkillDataset.getItem(skillId)

                if (Helper.isEmpty(skillItem)) {
                    return state
                }

                for (let skillData of requiredConditions.skills) {
                    if (skillData.id === skillId) {
                        return state
                    }
                }

                requiredConditions.skills.push({
                    id: skillId,
                    level: 1
                })

                return Object.assign({}, state, {
                    requiredConditions: requiredConditions
                })
            })()

        case 'REMOVE_REQUIRED_CONDITIONS_SKILL':
            return (() => {
                let requiredConditions = Helper.deepCopy(state.requiredConditions)
                let skillId = action.payload.skillId

                // Get Item
                let skillItem = SkillDataset.getItem(skillId)

                if (Helper.isEmpty(skillItem)) {
                    return state
                }

                requiredConditions.skills = requiredConditions.skills.filter((skillData) => {
                    return skillData.id !== skillId
                })

                return Object.assign({}, state, {
                    requiredConditions: requiredConditions
                })
            })()

        case 'INCREASE_REQUIRED_CONDITIONS_SKILL_LEVEL':
            return (() => {
                let requiredConditions = Helper.deepCopy(state.requiredConditions)
                let skillId = action.payload.skillId

                // Get Item
                let skillItem = SkillDataset.getItem(skillId)

                if (Helper.isEmpty(skillItem)) {
                    return state
                }

                for (let skillData of requiredConditions.skills) {
                    if (skillData.id !== skillId) {
                        continue
                    }

                    if ((skillData.level + 1) > skillItem.list.length) {
                        return state
                    }

                    skillData.level++

                    break
                }

                return Object.assign({}, state, {
                    requiredConditions: requiredConditions
                })
            })()

        case 'DECREASE_REQUIRED_CONDITIONS_SKILL_LEVEL':
            return (() => {
                let requiredConditions = Helper.deepCopy(state.requiredConditions)
                let skillId = action.payload.skillId

                // Get Item
                let skillItem = SkillDataset.getItem(skillId)

                if (Helper.isEmpty(skillItem)) {
                    return state
                }

                for (let skillData of requiredConditions.skills) {
                    if (skillData.id !== skillId) {
                        continue
                    }

                    if ((skillData.level - 1) < 0) {
                        return state
                    }

                    skillData.level--

                    break
                }

                return Object.assign({}, state, {
                    requiredConditions: requiredConditions
                })
            })()

        // Algorithm Params
        case 'SET_ALGORITHM_PARAMS_LIMIT':
            return (() => {
                let algorithmParams = Helper.deepCopy(state.algorithmParams)

                algorithmParams.limit = action.payload.limit

                return Object.assign({}, state, {
                    algorithmParams: algorithmParams
                })
            })()

        case 'SET_ALGORITHM_PARAMS_SORT':
            return (() => {
                let algorithmParams = Helper.deepCopy(state.algorithmParams)

                algorithmParams.sort = action.payload.sort

                return Object.assign({}, state, {
                    algorithmParams: algorithmParams
                })
            })()

        case 'SET_ALGORITHM_PARAMS_ORDER':
            return (() => {
                let algorithmParams = Helper.deepCopy(state.algorithmParams)

                algorithmParams.order = action.payload.order

                return Object.assign({}, state, {
                    algorithmParams: algorithmParams
                })
            })()

        case 'TOGGLE_ALGORITHM_PARAMS_FLAG':
            return (() => {
                let algorithmParams = Helper.deepCopy(state.algorithmParams)
                let target = action.payload.target

                if (Helper.isEmpty(algorithmParams.flag[target])) {
                    algorithmParams.flag[target] = false
                }

                algorithmParams.flag[target] = !algorithmParams.flag[target]

                return Object.assign({}, state, {
                    algorithmParams: algorithmParams
                })
            })()

        case 'SET_ALGORITHM_PARAMS_USING_FACTOR':
            return (() => {
                let algorithmParams = Helper.deepCopy(state.algorithmParams)
                let target = action.payload.target
                let flag = action.payload.flag
                let value = action.payload.value

                if (Helper.isEmpty(algorithmParams.usingFactor[target])) {
                    return algorithmParams.usingFactor[target] = {}
                }

                algorithmParams.usingFactor[target][flag] = value

                return Object.assign({}, state, {
                    algorithmParams: algorithmParams
                })
            })()

        // // Computed Bundles
        // case 'UPDATE_COMPUTED_RESULT':
        //     return Object.assign({}, state, {
        //         computedResult: action.payload.data
        //     })

        // // Reserved Bundles
        // case 'ADD_RESERVED_BUNDLE':
        //     return Object.assign({}, state, {
        //         reservedPlayerEquip: (() => {
        //             let reservedPlayerEquip = Helper.deepCopy(state.reservedPlayerEquip)

        //             reservedPlayerEquip.push(action.payload.data)

        //             return reservedPlayerEquip
        //         })()
        //     })
        // case 'UPDATE_RESERVED_BUNDLE_NAME':
        //     return Object.assign({}, state, {
        //         reservedPlayerEquip: (() => {
        //             let reservedPlayerEquip = Helper.deepCopy(state.reservedPlayerEquip)

        //             if (Helper.isEmpty(reservedPlayerEquip[action.payload.index])) {
        //                 return reservedPlayerEquip
        //             }

        //             reservedPlayerEquip[action.payload.index].name = action.payload.name

        //             return reservedPlayerEquip
        //         })()
        //     })
        // case 'REMOVE_RESERVED_BUNDLE':
        //     return Object.assign({}, state, {
        //         reservedPlayerEquip: (() => {
        //             let reservedPlayerEquip = Helper.deepCopy(state.reservedPlayerEquip)

        //             if (Helper.isEmpty(reservedPlayerEquip[action.payload.index])) {
        //                 return reservedPlayerEquip
        //             }

        //             reservedPlayerEquip = reservedPlayerEquip.filter((euqipBundle, index) => {
        //                 return index !== action.payload.index
        //             })

        //             return reservedPlayerEquip
        //         })()
        //     })

        // // Custom Weapon
        // case 'REPLACE_CUSTOM_WEAPON':
        //     return (() => {
        //         return Object.assign({}, state, {
        //             customWeapon: action.payload.data
        //         })
        //     })()
        // case 'SET_CUSTOM_WEAPON_VALUE':
        //     return (() => {
        //         let target = action.payload.target
        //         let value = action.payload.value
        //         let playerEquips = Helper.deepCopy(state.playerEquips)
        //         let customWeapon = Helper.deepCopy(state.customWeapon)

        //         customWeapon[target] = value

        //         if ('rare' === target) {
        //             playerEquips.weapon.enhances = []
        //         }

        //         if ('type' === target) {
        //             if (-1 !== ['lightBowgun', 'heavyBowgun', 'bow'].indexOf(value)) {
        //                 customWeapon.sharpness = null
        //             } else if (Helper.isEmpty(customWeapon.sharpness)) {
        //                 customWeapon.sharpness = {
        //                     value: 350,
        //                     steps: {
        //                         red: 0,
        //                         orange: 0,
        //                         yellow: 0,
        //                         green: 0,
        //                         blue: 0,
        //                         white: 0,
        //                         purple: 400
        //                     }
        //                 }
        //             }
        //         }

        //         return Object.assign({}, state, {
        //             playerEquips: playerEquips,
        //             customWeapon: customWeapon
        //         })
        //     })()
        // case 'SET_CUSTOM_WEAPON_ELDERSEAL':
        //     return (() => {
        //         let affinity = action.payload.affinity
        //         let customWeapon = Helper.deepCopy(state.customWeapon)

        //         customWeapon.elderseal = {
        //             affinity: affinity
        //         }

        //         return Object.assign({}, state, {
        //             customWeapon: customWeapon
        //         })
        //     })()
        // case 'SET_CUSTOM_WEAPON_SHARPNESS':
        //     return (() => {
        //         let step = action.payload.step
        //         let customWeapon = Helper.deepCopy(state.customWeapon)

        //         if (Helper.isEmpty(step)) {
        //             customWeapon.sharpness = null
        //         } else {
        //             customWeapon.sharpness = {
        //                 value: 350,
        //                 steps: {
        //                     red: 0,
        //                     orange: 0,
        //                     yellow: 0,
        //                     green: 0,
        //                     blue: 0,
        //                     white: 0,
        //                     purple: 0
        //                 }
        //             }

        //             customWeapon.sharpness.steps[step] = 400
        //         }

        //         return Object.assign({}, state, {
        //             customWeapon: customWeapon
        //         })
        //     })()
        // case 'SET_CUSTOM_WEAPON_ELEMENT_TYPE':
        //     return (() => {
        //         let target = action.payload.target
        //         let type = action.payload.type
        //         let customWeapon = Helper.deepCopy(state.customWeapon)

        //         if (Helper.isEmpty(type)) {
        //             customWeapon.element[target] = null

        //             if ('attack' === target) {
        //                 customWeapon.elderseal = null
        //             }
        //         } else {
        //             if (Helper.isEmpty(customWeapon.element[target])) {
        //                 customWeapon.element[target] = {
        //                     minValue: 100,
        //                     maxValue: null,
        //                     isHidden: false
        //                 }
        //             }

        //             customWeapon.element[target].type = type

        //             if ('attack' === target && 'dragon' === type) {
        //                 customWeapon.elderseal = {
        //                     affinity: 'low'
        //                 }
        //             }
        //         }

        //         return Object.assign({}, state, {
        //             customWeapon: customWeapon
        //         })
        //     })()

        // case 'SET_CUSTOM_WEAPON_ELEMENT_VALUE':
        //     return (() => {
        //         let target = action.payload.target
        //         let value = action.payload.value
        //         let customWeapon = Helper.deepCopy(state.customWeapon)

        //         customWeapon.element[target].minValue = value

        //         return Object.assign({}, state, {
        //             customWeapon: customWeapon
        //         })
        //     })()
        // case 'SET_CUSTOM_WEAPON_SLOT':
        //     return (() => {
        //         let index = action.payload.index
        //         let size = action.payload.size
        //         let playerEquips = Helper.deepCopy(state.playerEquips)
        //         let customWeapon = Helper.deepCopy(state.customWeapon)

        //         if (Helper.isEmpty(playerEquips.weapon.slotIds)) {
        //             playerEquips.weapon.slotIds = []
        //         }

        //         if (Helper.isEmpty(size)) {
        //             playerEquips.weapon.slotIds = playerEquips.weapon.slotIds.filter((id, slotIndex) => {
        //                 return index !== slotIndex
        //             })
        //             customWeapon.slots = customWeapon.slots.filter((id, slotIndex) => {
        //                 return index !== slotIndex
        //             })
        //         } else {
        //             playerEquips.weapon.slotIds[index] = undefined
        //             customWeapon.slots[index] = {
        //                 size: size
        //             }
        //         }

        //         return Object.assign({}, state, {
        //             playerEquips: playerEquips,
        //             customWeapon: customWeapon
        //         })
        //     })()
        // case 'SET_CUSTOM_WEAPON_SKILL':
        //     return (() => {
        //         let index = action.payload.index
        //         let id = action.payload.id
        //         let customWeapon = Helper.deepCopy(state.customWeapon)

        //         if (Helper.isEmpty(id)) {
        //             customWeapon.skills = customWeapon.skills.filter((id, skillIndex) => {
        //                 return index !== skillIndex
        //             })
        //         } else {
        //             customWeapon.skills[index] = {
        //                 id: id,
        //                 level: 1
        //             }
        //         }

        //         return Object.assign({}, state, {
        //             customWeapon: customWeapon
        //         })
        //     })()
        // case 'SET_CUSTOM_WEAPON_SET':
        //     return (() => {
        //         let id = action.payload.id
        //         let customWeapon = Helper.deepCopy(state.customWeapon)

        //         if (Helper.isEmpty(id)) {
        //             customWeapon.set = null
        //         } else {
        //             customWeapon.set = {
        //                 id: id
        //             }
        //         }

        //         return Object.assign({}, state, {
        //             customWeapon: customWeapon
        //         })
        //     })()

        // Default
        default:
            return state
    }
}, applyMiddleware(diffLogger))
