/**
 * Common State - Store
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Libraries
import { createStore, applyMiddleware } from 'redux'

// Load Core Libraries
import Status from 'core/status'
import Helper from 'core/helper'

// Load Custom Libraries
// import SetDataset from 'libraries/dataset/set'
import SkillDataset from 'libraries/dataset/skill'

// Load Constant
import Constant from 'constant'

// Load Json
// import TestData from 'files/json/testData.json'

const defaultData = {
    "equips": {
        "weapon": {
            "id": null,
            "slotIds": [],
            "enhances": []
        },
        "helm": {
            "id": null,
            "slotIds": []
        },
        "chest": {
            "id": null,
            "slotIds": []
        },
        "arm": {
            "id": null,
            "slotIds": []
        },
        "waist": {
            "id": null,
            "slotIds": []
        },
        "leg": {
            "id": null,
            "slotIds": []
        },
        "petalace": {
            "id": null
        },
        "charm": {
            "id": null,
            "slotIds": []
        }
    },
    "requireEquips": {
        "weapon": null,
        "helm": null,
        "chest": null,
        "arm": null,
        "waist": null,
        "leg": null,
        "charm": null
    },
    "requireSets": [],
    "requireSkills": [
        {
            "id": "攻擊",
            "level": 7
        },
        {
            "id": "看破",
            "level": 7
        },
        {
            "id": "弱點特效",
            "level": 3
        },
        {
            "id": "減輕膽怯",
            "level": 3
        },
        {
            "id": "超會心",
            "level": 3
        },
        {
            "id": "無屬性強化",
            "level": 1
        }
    ]
}


const statusMapping = {
    tempData:           'state:common:tempData',
    requiredEquipment:     'state:common:requiredEquipment',
    // requiredSets:       'state:common:requiredSets',
    requiredSkills:     'state:common:requiredSkills',
    playerEquipment:      'state:common:playerEquipment',
    algorithmParams:    'state:common:algorithmParams',
    computedResult:     'state:common:computedResult',
    reservedPlayerEquipment:    'state:common:reservedPlayerEquipment',
    customWeapon:       'state:common:customWeapon'
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
    tempData: Status.get(statusMapping.tempData) || {
        conditionOptions: {
            index: 0,
            list: []
        },
        candidateBundles: {
            index: 0,
            list: []
        },
        equipsDisplayer: {
            index: 0,
            list: []
        }
    },

    requiredEquips: Status.get(statusMapping.requiredEquips) || {},
    // requiredSets: Status.get(statusMapping.requiredSets) || [],
    requiredSkills: Status.get(statusMapping.requiredSkills) || [],

    requiredConditions: Status.get(statusMapping.requiredConditions) || Helper.deepCopy(Constant.defaultRequiredConditions),
    algorithmParams: Status.get(statusMapping.algorithmParams) || Helper.deepCopy(Constant.defaultAlgorithmParams),
    computedResult: Status.get(statusMapping.computedResult) || null,
    playerEquipment: Status.get(statusMapping.playerEquipment) || Helper.deepCopy(Constant.defaultPlayerEquipment),
    reservedPlayerEquipment: Status.get(statusMapping.reservedPlayerEquipment) || []
}

export default createStore((state = initialState, action) => {
    switch (action.type) {

    // Switch Temp Data
    case 'SWITCH_TEMP_DATA':
        return (() => {
            let target = action.payload.target
            let index = action.payload.index
            let tempData = Helper.deepCopy(state.tempData)
            let bundle = undefined

            if (Helper.isEmpty(tempData[target])) {
                tempData[target] = {
                    index: 0,
                    list: []
                }
            }

            if (index === tempData[target].index) {
                return state
            }

            switch (target) {
            case 'conditionOptions':
                if (Helper.isEmpty(tempData[target].list[index])) {
                    tempData[target].list[index] = {
                        requiredEquipment: {
                            weapon: null,
                            helm: null,
                            chest: null,
                            arm: null,
                            waist: null,
                            leg: null,
                            petalace: null,
                            charm: null
                        },
                        // requiredSets: [],
                        requiredSkills: []
                    }
                }

                bundle = Helper.deepCopy(tempData[target].list[index])

                tempData[target].list[tempData[target].index] = Helper.deepCopy({
                    requiredEquipment: state.requiredEquipment,
                    // requiredSets: state.requiredSets,
                    requiredSkills: state.requiredSkills
                })
                tempData[target].index = index

                return Object.assign({}, state, {
                    tempData: tempData,
                    requiredEquipment: bundle.requiredEquipment,
                    // requiredSets: bundle.requiredSets,
                    requiredSkills: bundle.requiredSkills
                })
            case 'candidateBundles':
                if (Helper.isEmpty(tempData[target].list[index])) {
                    tempData[target].list[index] = {
                        computedResult: null
                    }
                }

                bundle = Helper.deepCopy(tempData[target].list[index])

                tempData[target].list[tempData[target].index] = Helper.deepCopy({
                    computedResult: state.computedResult
                })
                tempData[target].index = index

                return Object.assign({}, state, {
                    tempData: tempData,
                    computedResult: bundle.computedResult
                })
            case 'equipsDisplayer':
                if (Helper.isEmpty(tempData[target].list[index])) {
                    tempData[target].list[index] = {
                        playerEquipment: {},
                        customWeapon: Helper.deepCopy(Constant.default.customWeapon)
                    }
                }

                bundle = Helper.deepCopy(tempData[target].list[index])

                tempData[target].list[tempData[target].index] = Helper.deepCopy({
                    playerEquipment: state.playerEquipment,
                    customWeapon: state.customWeapon
                })
                tempData[target].index = index

                return Object.assign({}, state, {
                    tempData: tempData,
                    playerEquipment: bundle.playerEquipment,
                    customWeapon: bundle.customWeapon
                })
            }
        })()

    // // Required Sets
    // case 'ADD_REQUIRED_SET':
    //     return (() => {
    //         let setInfo = SetDataset.getInfo(action.payload.setId)

    //         if (Helper.isEmpty(setInfo)) {
    //             return state
    //         }

    //         let requiredSets = Helper.deepCopy(state.requiredSets)

    //         for (let index in requiredSets) {
    //             if (action.payload.setId !== requiredSets[index].id) {
    //                 continue
    //             }

    //             return state
    //         }

    //         requiredSets.push({
    //             id: action.payload.setId,
    //             step: 1
    //         })

    //         return Object.assign({}, state, {
    //             requiredSets: requiredSets
    //         })
    //     })()
    // case 'REMOVE_REQUIRED_SET':
    //     return (() => {
    //         let setInfo = SetDataset.getInfo(action.payload.setId)

    //         if (Helper.isEmpty(setInfo)) {
    //             return state
    //         }

    //         let requiredSets = Helper.deepCopy(state.requiredSets)
    //         let requiredSkills = Helper.deepCopy(state.requiredSkills)

    //         let enableSkillIdList = []

    //         setInfo.skills.forEach((skill) => {
    //             let skillInfo = SkillDataset.getInfo(skill.id)

    //             if (Helper.isEmpty(skillInfo)) {
    //                 return
    //             }

    //             skillInfo.list.forEach((item) => {
    //                 if (Helper.isEmpty(item.reaction)
    //                     || Helper.isEmpty(item.reaction.enableSkillLevel)
    //                 ) {
    //                     return
    //                 }

    //                 if (Helper.isNotEmpty(item.reaction.enableSkillLevel.id)) {
    //                     enableSkillIdList.push(item.reaction.enableSkillLevel.id)
    //                 }

    //                 if (Helper.isNotEmpty(item.reaction.enableSkillLevel.ids)) {
    //                     item.reaction.enableSkillLevel.ids.forEach((skillId) => {
    //                         enableSkillIdList.push(skillId)
    //                     })
    //                 }
    //             })
    //         })

    //         requiredSkills.map((skill) => {
    //             let skillInfo = SkillDataset.getInfo(skill.id)

    //             if (Helper.isEmpty(skillInfo)) {
    //                 return skill
    //             }

    //             if (-1 !== enableSkillIdList.indexOf(skill.id)) {
    //                 let currentSkillLevel = 0
    //                 let totalSkillLevel = 0

    //                 skillInfo.list.forEach((item) => {
    //                     if (false === item.isHidden) {
    //                         currentSkillLevel++
    //                     }

    //                     totalSkillLevel++
    //                 })

    //                 skill.level = (skill.level > currentSkillLevel)
    //                     ? currentSkillLevel : skill.level
    //             }

    //             return skill
    //         })

    //         for (let index in requiredSets) {
    //             if (action.payload.setId !== requiredSets[index].id) {
    //                 continue
    //             }

    //             requiredSets = requiredSets.filter((set) => {
    //                 return set.id !== action.payload.setId
    //             })

    //             return Object.assign({}, state, {
    //                 requiredSets: requiredSets,
    //                 requiredSkills: requiredSkills,
    //             })
    //         }

    //         return state
    //     })()
    // case 'INCREASE_REQUIRED_SET_STEP':
    //     return (() => {
    //         let setInfo = SetDataset.getInfo(action.payload.setId)

    //         if (Helper.isEmpty(setInfo)) {
    //             return state
    //         }

    //         let requiredSets = Helper.deepCopy(state.requiredSets)

    //         for (let index in requiredSets) {
    //             if (action.payload.setId !== requiredSets[index].id) {
    //                 continue
    //             }

    //             if (setInfo.skills.length === requiredSets[index].step) {
    //                 return state
    //             }

    //             requiredSets[index].step += 1

    //             return Object.assign({}, state, {
    //                 requiredSets: requiredSets
    //             })
    //         }

    //         return state
    //     })()
    // case 'DECREASE_REQUIRED_SET_STEP':
    //     return (() => {
    //         let setInfo = SetDataset.getInfo(action.payload.setId)

    //         if (Helper.isEmpty(setInfo)) {
    //             return state
    //         }

    //         let requiredSets = Helper.deepCopy(state.requiredSets)

    //         for (let index in requiredSets) {
    //             if (action.payload.setId !== requiredSets[index].id) {
    //                 continue
    //             }

    //             if (1 === requiredSets[index].step) {
    //                 return state
    //             }

    //             requiredSets[index].step -= 1

    //             return Object.assign({}, state, {
    //                 requiredSets: requiredSets
    //             })
    //         }

    //         return state
    //     })()
    // case 'CLEAN_REQUIRED_SETS':
    //     return Object.assign({}, state, {
    //         requiredSets: []
    //     })

    // Required Skills
    case 'ADD_REQUIRED_SKILL':
        return (() => {
            let skillInfo = SkillDataset.getInfo(action.payload.skillId)

            if (Helper.isEmpty(skillInfo)) {
                return state
            }

            let requiredSkills = Helper.deepCopy(state.requiredSkills)

            for (let index in requiredSkills) {
                if (action.payload.skillId !== requiredSkills[index].id) {
                    continue
                }

                return state
            }

            requiredSkills.push({
                id: action.payload.skillId,
                level: 1
            })

            return Object.assign({}, state, {
                requiredSkills: requiredSkills
            })
        })()
    case 'REMOVE_REQUIRED_SKILL':
        return (() => {
            let skillInfo = SkillDataset.getInfo(action.payload.skillId)

            if (Helper.isEmpty(skillInfo)) {
                return state
            }

            let requiredSkills = Helper.deepCopy(state.requiredSkills)

            for (let index in requiredSkills) {
                if (action.payload.skillId !== requiredSkills[index].id) {
                    continue
                }

                requiredSkills = requiredSkills.filter((skill) => {
                    return skill.id !== action.payload.skillId
                })

                return Object.assign({}, state, {
                    requiredSkills: requiredSkills
                })
            }

            return state
        })()
    case 'INCREASE_REQUIRED_SKILL_LEVEL':
        return (() => {
            let skillInfo = SkillDataset.getInfo(action.payload.skillId)

            if (Helper.isEmpty(skillInfo)) {
                return state
            }

            // let requiredSets = Helper.deepCopy(state.requiredSets)
            let requiredSkills = Helper.deepCopy(state.requiredSkills)

            let enableSkillIdList = []

            // requiredSets.forEach((set) => {
            //     let setInfo = SetDataset.getInfo(set.id)

            //     if (Helper.isEmpty(setInfo)) {
            //         return
            //     }

            //     setInfo.skills.forEach((skill) => {
            //         let skillInfo = SkillDataset.getInfo(skill.id)

            //         if (Helper.isEmpty(skillInfo)) {
            //             return
            //         }

            //         skillInfo.list.forEach((item) => {
            //             if (Helper.isEmpty(item.reaction)
            //                 || Helper.isEmpty(item.reaction.enableSkillLevel)
            //             ) {
            //                 return
            //             }

            //             enableSkillIdList.push(item.reaction.enableSkillLevel.id)
            //         })
            //     })
            // })

            for (let index in requiredSkills) {
                if (action.payload.skillId !== requiredSkills[index].id) {
                    continue
                }

                if (skillInfo.list.length === requiredSkills[index].level) {
                    return state
                }

                requiredSkills[index].level += 1

                if (true === skillInfo.list[requiredSkills[index].level - 1].isHidden
                    && -1 === enableSkillIdList.indexOf(requiredSkills[index].id)
                ) {
                    return state
                }

                return Object.assign({}, state, {
                    requiredSkills: requiredSkills
                })
            }

            return state
        })()
    case 'DECREASE_REQUIRED_SKILL_LEVEL':
        return (() => {
            let skillInfo = SkillDataset.getInfo(action.payload.skillId)

            if (Helper.isEmpty(skillInfo)) {
                return state
            }

            let requiredSkills = Helper.deepCopy(state.requiredSkills)

            for (let index in requiredSkills) {
                if (action.payload.skillId !== requiredSkills[index].id) {
                    continue
                }

                if (0 === requiredSkills[index].level) {
                    return state
                }

                requiredSkills[index].level -= 1

                return Object.assign({}, state, {
                    requiredSkills: requiredSkills
                })
            }

            return state
        })()
    case 'CLEAN_REQUIRED_SKILLS':
        return Object.assign({}, state, {
            requiredSkills: []
        })

    // Required Equips
    case 'SET_REQUIRED_EQUIPS':
        return Object.assign({}, state, {
            requiredEquipment: (() => {
                let requiredEquipment = Helper.deepCopy(state.requiredEquipment)

                if (Helper.isEmpty(action.payload.currentEquip)) {
                    requiredEquipment[action.payload.equipType] = null
                } else {
                    requiredEquipment[action.payload.equipType] = {
                        id: action.payload.currentEquip.id
                    }

                    if (Helper.isNotEmpty(action.payload.currentEquip.enhances)) {
                        requiredEquipment[action.payload.equipType].enhances = action.payload.currentEquip.enhances
                    } else {
                        requiredEquipment[action.payload.equipType].enhances = []
                    }

                    if ('customWeapon' === action.payload.currentEquip.id) {
                        requiredEquipment[action.payload.equipType].customWeapon = action.payload.currentEquip
                    }
                }

                return requiredEquipment
            })()
        })
    case 'CLEAN_REQUIRED_EQUIPS':
        return Object.assign({}, state, {
            requiredEquipment: {
                weapon: null,
                helm: null,
                chest: null,
                arm: null,
                waist: null,
                leg: null,
                charm: null
            }
        })

    // Current Equips
    case 'SET_CURRENT_EQUIP':
        return (() => {
            let data = action.payload.data
            let playerEquipment = Helper.deepCopy(state.playerEquipment)

            if (Helper.isNotEmpty(data.enhanceIndex)) {
                if (Helper.isEmpty(playerEquipment.weapon.enhances)) {
                    playerEquipment.weapon.enhances = []
                }

                if (Helper.isNotEmpty(data.enhanceId)) {
                    playerEquipment.weapon.enhances[data.enhanceIndex] = {
                        id: data.enhanceId,
                        level: Helper.isNotEmpty(data.enhanceLevel) ? data.enhanceLevel : 1
                    }
                } else {
                    playerEquipment.weapon.enhances = playerEquipment.weapon.enhances.filter((enhance, index) => {
                        return index !== data.enhanceIndex
                    })
                }
            } else if (Helper.isNotEmpty(data.slotIndex)) {
                if (Helper.isEmpty(playerEquipment.weapon.slotIds)) {
                    playerEquipment[data.equipType].slotIds = []
                }

                playerEquipment[data.equipType].slotIds[data.slotIndex] = data.jewelId
            } else if ('weapon' === data.equipType) {
                playerEquipment.weapon = {
                    id: data.equipId,
                    enhances: [],
                    slotIds: []
                }
            } else if ('helm' === data.equipType
                || 'chest' === data.equipType
                || 'arm' === data.equipType
                || 'waist' === data.equipType
                || 'leg' === data.equipType
            ) {
                playerEquipment[data.equipType] = {
                    id: data.equipId,
                    slotIds: []
                }
            } else if ('charm' === data.equipType) {
                playerEquipment.charm = {
                    id: data.equipId
                }
            }

            return Object.assign({}, state, {
                playerEquipment: playerEquipment
            })
        })()
    case 'REPLACE_CURRENT_EQUIPS':
        return Object.assign({}, state, {
            playerEquipment: action.payload.data
        })
    case 'CLEAN_CURRENT_EQUIPS':
        return Object.assign({}, state, {
            playerEquipment: Helper.deepCopy(Constant.default.equips)
        })

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
            let target = action.payload.target
            let algorithmParams = Helper.deepCopy(state.algorithmParams)

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
            let target = action.payload.target
            let flag = action.payload.flag
            let value = action.payload.value
            let algorithmParams = Helper.deepCopy(state.algorithmParams)

            if (Helper.isEmpty(algorithmParams.usingFactor[target])) {
                return algorithmParams.usingFactor[target] = {}
            }

            algorithmParams.usingFactor[target][flag] = value

            return Object.assign({}, state, {
                algorithmParams: algorithmParams
            })
        })()

    // Computed Bundles
    case 'UPDATE_COMPUTED_RESULT':
        return Object.assign({}, state, {
            computedResult: action.payload.data
        })

    // Reserved Bundles
    case 'ADD_RESERVED_BUNDLE':
        return Object.assign({}, state, {
            reservedPlayerEquipment: (() => {
                let reservedPlayerEquipment = Helper.deepCopy(state.reservedPlayerEquipment)

                reservedPlayerEquipment.push(action.payload.data)

                return reservedPlayerEquipment
            })()
        })
    case 'UPDATE_RESERVED_BUNDLE_NAME':
        return Object.assign({}, state, {
            reservedPlayerEquipment: (() => {
                let reservedPlayerEquipment = Helper.deepCopy(state.reservedPlayerEquipment)

                if (Helper.isEmpty(reservedPlayerEquipment[action.payload.index])) {
                    return reservedPlayerEquipment
                }

                reservedPlayerEquipment[action.payload.index].name = action.payload.name

                return reservedPlayerEquipment
            })()
        })
    case 'REMOVE_RESERVED_BUNDLE':
        return Object.assign({}, state, {
            reservedPlayerEquipment: (() => {
                let reservedPlayerEquipment = Helper.deepCopy(state.reservedPlayerEquipment)

                if (Helper.isEmpty(reservedPlayerEquipment[action.payload.index])) {
                    return reservedPlayerEquipment
                }

                reservedPlayerEquipment = reservedPlayerEquipment.filter((euqipBundle, index) => {
                    return index !== action.payload.index
                })

                return reservedPlayerEquipment
            })()
        })

    // Custom Weapon
    case 'REPLACE_CUSTOM_WEAPON':
        return (() => {
            return Object.assign({}, state, {
                customWeapon: action.payload.data
            })
        })()
    case 'SET_CUSTOM_WEAPON_VALUE':
        return (() => {
            let target = action.payload.target
            let value = action.payload.value
            let playerEquipment = Helper.deepCopy(state.playerEquipment)
            let customWeapon = Helper.deepCopy(state.customWeapon)

            customWeapon[target] = value

            if ('rare' === target) {
                playerEquipment.weapon.enhances = []
            }

            if ('type' === target) {
                if (-1 !== ['lightBowgun', 'heavyBowgun', 'bow'].indexOf(value)) {
                    customWeapon.sharpness = null
                } else if (Helper.isEmpty(customWeapon.sharpness)) {
                    customWeapon.sharpness = {
                        value: 350,
                        steps: {
                            red: 0,
                            orange: 0,
                            yellow: 0,
                            green: 0,
                            blue: 0,
                            white: 0,
                            purple: 400
                        }
                    }
                }
            }

            return Object.assign({}, state, {
                playerEquipment: playerEquipment,
                customWeapon: customWeapon
            })
        })()
    case 'SET_CUSTOM_WEAPON_ELDERSEAL':
        return (() => {
            let affinity = action.payload.affinity
            let customWeapon = Helper.deepCopy(state.customWeapon)

            customWeapon.elderseal = {
                affinity: affinity
            }

            return Object.assign({}, state, {
                customWeapon: customWeapon
            })
        })()
    case 'SET_CUSTOM_WEAPON_SHARPNESS':
        return (() => {
            let step = action.payload.step
            let customWeapon = Helper.deepCopy(state.customWeapon)

            if (Helper.isEmpty(step)) {
                customWeapon.sharpness = null
            } else {
                customWeapon.sharpness = {
                    value: 350,
                    steps: {
                        red: 0,
                        orange: 0,
                        yellow: 0,
                        green: 0,
                        blue: 0,
                        white: 0,
                        purple: 0
                    }
                }

                customWeapon.sharpness.steps[step] = 400
            }

            return Object.assign({}, state, {
                customWeapon: customWeapon
            })
        })()
    case 'SET_CUSTOM_WEAPON_ELEMENT_TYPE':
        return (() => {
            let target = action.payload.target
            let type = action.payload.type
            let customWeapon = Helper.deepCopy(state.customWeapon)

            if (Helper.isEmpty(type)) {
                customWeapon.element[target] = null

                if ('attack' === target) {
                    customWeapon.elderseal = null
                }
            } else {
                if (Helper.isEmpty(customWeapon.element[target])) {
                    customWeapon.element[target] = {
                        minValue: 100,
                        maxValue: null,
                        isHidden: false
                    }
                }

                customWeapon.element[target].type = type

                if ('attack' === target && 'dragon' === type) {
                    customWeapon.elderseal = {
                        affinity: 'low'
                    }
                }
            }

            return Object.assign({}, state, {
                customWeapon: customWeapon
            })
        })()

    case 'SET_CUSTOM_WEAPON_ELEMENT_VALUE':
        return (() => {
            let target = action.payload.target
            let value = action.payload.value
            let customWeapon = Helper.deepCopy(state.customWeapon)

            customWeapon.element[target].minValue = value

            return Object.assign({}, state, {
                customWeapon: customWeapon
            })
        })()
    case 'SET_CUSTOM_WEAPON_SLOT':
        return (() => {
            let index = action.payload.index
            let size = action.payload.size
            let playerEquipment = Helper.deepCopy(state.playerEquipment)
            let customWeapon = Helper.deepCopy(state.customWeapon)

            if (Helper.isEmpty(playerEquipment.weapon.slotIds)) {
                playerEquipment.weapon.slotIds = []
            }

            if (Helper.isEmpty(size)) {
                playerEquipment.weapon.slotIds = playerEquipment.weapon.slotIds.filter((id, slotIndex) => {
                    return index !== slotIndex
                })
                customWeapon.slots = customWeapon.slots.filter((id, slotIndex) => {
                    return index !== slotIndex
                })
            } else {
                playerEquipment.weapon.slotIds[index] = undefined
                customWeapon.slots[index] = {
                    size: size
                }
            }

            return Object.assign({}, state, {
                playerEquipment: playerEquipment,
                customWeapon: customWeapon
            })
        })()
    case 'SET_CUSTOM_WEAPON_SKILL':
        return (() => {
            let index = action.payload.index
            let id = action.payload.id
            let customWeapon = Helper.deepCopy(state.customWeapon)

            if (Helper.isEmpty(id)) {
                customWeapon.skills = customWeapon.skills.filter((id, skillIndex) => {
                    return index !== skillIndex
                })
            } else {
                customWeapon.skills[index] = {
                    id: id,
                    level: 1
                }
            }

            return Object.assign({}, state, {
                customWeapon: customWeapon
            })
        })()
    case 'SET_CUSTOM_WEAPON_SET':
        return (() => {
            let id = action.payload.id
            let customWeapon = Helper.deepCopy(state.customWeapon)

            if (Helper.isEmpty(id)) {
                customWeapon.set = null
            } else {
                customWeapon.set = {
                    id: id
                }
            }

            return Object.assign({}, state, {
                customWeapon: customWeapon
            })
        })()

    // Default
    default:
        return state
    }
}, applyMiddleware(diffLogger))
