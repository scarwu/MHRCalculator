/**
 * Misc Library
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Constant
import Constant from 'constant'

// Load Core
import Helper from 'core/helper'

// Load Libraries
import WeaponDataset from 'libraries/dataset/weapon'
import ArmorDataset from 'libraries/dataset/armor'
import SetDataset from 'libraries/dataset/set'
import PetalaceDataset from 'libraries/dataset/petalace'
import JewelDataset from 'libraries/dataset/jewel'
import EnhanceDataset from 'libraries/dataset/enhance'
import SkillDataset from 'libraries/dataset/skill'

export const getWeaponExtendItem = (equipData) => {
    if (Helper.isEmpty(equipData.id)) {
        return null
    }

    let weaponItem = null

    if ('customWeapon' === equipData.id) {
        weaponItem = Helper.deepCopy(equipData.custom)
    } else {
        weaponItem = WeaponDataset.getItem(equipData.id)
    }

    if (Helper.isEmpty(weaponItem)) {
        return null
    }

    // Set Extends
    weaponItem.extends = {
        jewelIds: Helper.deepCopy(equipData.jewelIds),
        enhanceIds: Helper.deepCopy(equipData.enhanceIds)
    }

    // Handle Skills
    let skillMapping = {}

    if (Helper.isNotEmpty(weaponItem.skills)) {
        weaponItem.skills.forEach((skillData) => {
            if (Helper.isEmpty(skillMapping[skillData.id])) {
                skillMapping[skillData.id] = skillData
            }
        })
    }

    weaponItem.extends.jewelIds.forEach((jewelId) => {
        let jewelItem = JewelDataset.getItem(jewelId)

        if (Helper.isEmpty(jewelItem)) {
            return
        }

        jewelItem.skills.forEach((skillData) => {
            let skillItem = SkillDataset.getItem(skillData.id)

            if (Helper.isEmpty(skillItem)) {
                return
            }

            if (Helper.isEmpty(skillMapping[skillItem.id])) {
                skillMapping[skillItem.id] = {
                    id: skillItem.id,
                    level: 0
                }
            }

            skillMapping[skillItem.id].level += skillData.level

            if (skillMapping[skillItem.id].level > skillItem.list.length) {
                skillMapping[skillItem.id].level = skillItem.list.length
            }
        })
    })

    // Replace Skills
    weaponItem.skills = Object.values(skillMapping)
    weaponItem.skills = weaponItem.skills.sort((skillDataA, skillDataB) => {
        return skillDataB.level - skillDataA.level
    })

    return weaponItem
}

export const getArmorExtendItem = (equipData) => {
    if (Helper.isEmpty(equipData.id)) {
        return null
    }

    let armorItem = ArmorDataset.getItem(equipData.id)

    if (Helper.isEmpty(armorItem)) {
        return null
    }

    // Set Extends
    armorItem.extends = {
        jewelIds: Helper.deepCopy(equipData.jewelIds)
    }

    // Handle Skills
    let skillMapping = {}

    if (Helper.isNotEmpty(armorItem.skills)) {
        armorItem.skills.forEach((skillData) => {
            if (Helper.isEmpty(skillMapping[skillData.id])) {
                skillMapping[skillData.id] = skillData
            }
        })
    }

    armorItem.extends.jewelIds.forEach((jewelId) => {
        let jewelItem = JewelDataset.getItem(jewelId)

        if (Helper.isEmpty(jewelItem)) {
            return
        }

        jewelItem.skills.forEach((skillData) => {
            let skillItem = SkillDataset.getItem(skillData.id)

            if (Helper.isEmpty(skillItem)) {
                return
            }

            if (Helper.isEmpty(skillMapping[skillItem.id])) {
                skillMapping[skillItem.id] = {
                    id: skillItem.id,
                    level: 0
                }
            }

            skillMapping[skillItem.id].level += skillData.level

            if (skillMapping[skillItem.id].level > skillItem.list.length) {
                skillMapping[skillItem.id].level = skillItem.list.length
            }
        })
    })

    // Replace Skills
    armorItem.skills = Object.values(skillMapping)
    armorItem.skills = armorItem.skills.sort((skillDataA, skillDataB) => {
        return skillDataB.level - skillDataA.level
    })

    return armorItem
}

export const getCharmExtendItem = (equipData) => {
    if (Helper.isEmpty(equipData.id)) {
        return null
    }

    if ('customCharm' !== equipData.id) {
        return null
    }

    let charmItem = Helper.deepCopy(equipData.custom)

    if (Helper.isEmpty(charmItem)) {
        return null
    }

    // Set Extends
    charmItem.extends = {
        jewelIds: Helper.deepCopy(equipData.jewelIds)
    }

    // Handle Skills
    let skillMapping = {}

    if (Helper.isNotEmpty(charmItem.skills)) {
        charmItem.skills.forEach((skillData) => {
            if (Helper.isEmpty(skillMapping[skillData.id])) {
                skillMapping[skillData.id] = skillData
            }
        })
    }

    charmItem.extends.jewelIds.forEach((jewelId) => {
        let jewelItem = JewelDataset.getItem(jewelId)

        if (Helper.isEmpty(jewelItem)) {
            return
        }

        jewelItem.skills.forEach((skillData) => {
            let skillItem = SkillDataset.getItem(skillData.id)

            if (Helper.isEmpty(skillItem)) {
                return
            }

            if (Helper.isEmpty(skillMapping[skillItem.id])) {
                skillMapping[skillItem.id] = {
                    id: skillItem.id,
                    level: 0
                }
            }

            skillMapping[skillItem.id].level += skillData.level

            if (skillMapping[skillItem.id].level > skillItem.list.length) {
                skillMapping[skillItem.id].level = skillItem.list.length
            }
        })
    })

    // Replace Skills
    charmItem.skills = Object.values(skillMapping)
    charmItem.skills = charmItem.skills.sort((skillDataA, skillDataB) => {
        return skillDataB.level - skillDataA.level
    })

    return charmItem
}

export const equipTypeToDatasetType = (equipType) => {
    switch (equipType) {
    case 'weapon':
    case 'petalace':
    case 'charm':
        return equipType
    case 'helm':
    case 'chest':
    case 'arm':
    case 'waist':
    case 'leg':
        return 'armor'
    default:
        return null
    }
}

export const getEquipExtendItem = (equipType, equipData) => {
    if (Helper.isEmpty(equipData.id)) {
        return null
    }

    switch (equipTypeToDatasetType(equipType)) {
        case 'weapon':
            return getWeaponExtendItem(equipData)
        case 'armor':
            return getArmorExtendItem(equipData)
        case 'petalace':
            return Helper.deepCopy(PetalaceDataset.getItem(equipData.id))
        case 'charm':
            return getCharmExtendItem(equipData)
        default:
            return null
    }
}

export const getEquipItem = (equipType, equipData) => {
    if (Helper.isEmpty(equipData.id)) {
        return null
    }

    switch (equipTypeToDatasetType(equipType)) {
    case 'weapon':
        return ('customWeapon' === equipData.id)
            ? Helper.deepCopy(equipData.custom)
            : Helper.deepCopy(WeaponDataset.getItem(equipData.id))
    case 'armor':
        return Helper.deepCopy(ArmorDataset.getItem(equipData.id))
    case 'petalace':
        return Helper.deepCopy(PetalaceDataset.getItem(equipData.id))
    case 'charm':
        return ('customCharm' === equipData.id)
            ? Helper.deepCopy(equipData.custom) : null
    default:
        return null
    }
}

export const getArmorListByRequiredConditions = (requiredConditions) => {
    let armorMapping = {}
    let skillLevelMapping = {}

    const equipTypes = Object.keys(requiredConditions.equips).filter((equipType) => {
        if ('weapon' === equipType || 'charm' === equipType || 'petalace' === equipType) {
            return false
        }

        if (Helper.isEmpty(requiredConditions.equips[equipType])) {
            return true
        }

        return Helper.isEmpty(requiredConditions.equips[equipType].id)
    })
    const setIds = requiredConditions.sets.map((setData) => {
        return setData.id
    })
    const skillIds = requiredConditions.skills.map((skillData) => {
        skillLevelMapping[skillData.id] = skillData.level

        return skillData.id
    })

    // Find Armor By Set Ids
    if (0 !== setIds.length) {
        SetDataset.getList().forEach((setItem) => {
            if (-1 === setIds.indexOf(setItem.id)) {
                return
            }

            setItem.items.forEach((armorData) => {
                if (-1 === equipTypes.indexOf(armorData.type)) {
                    return
                }

                let armorItem = ArmorDataset.getItem(armorData.id)

                if (Helper.isEmpty(armorItem)) {
                    return
                }

                if (Helper.isNotEmpty(armorItem.skills)) {
                    let isSkip = false

                    armorItem.skills.forEach((skillData) => {
                        if (true === isSkip) {
                            return
                        }

                        if (0 === skillLevelMapping[skillData.id]) {
                            isSkip = true

                            return
                        }
                    })

                    if (true === isSkip) {
                        return
                    }
                }

                // Set Mapping
                if (Helper.isEmpty(armorMapping[armorItem.id])) {
                    armorMapping[armorItem.id] = armorItem
                }
            })
        })
    }

    // Find Armors By Skill Ids
    let isConsistent = false

    ArmorDataset.typesIs(equipTypes).hasSkills(skillIds, isConsistent).getList().forEach((armorItem) => {
        if (Helper.isNotEmpty(armorItem.skills)) {
            let isSkip = false

            armorItem.skills.forEach((skillData) => {
                if (true === isSkip) {
                    return
                }

                if (0 === skillLevelMapping[skillData.id]) {
                    isSkip = true

                    return
                }
            })

            if (true === isSkip) {
                return
            }
        }

        // Set Mapping
        if (Helper.isEmpty(armorMapping[armorItem.id])) {
            armorMapping[armorItem.id] = armorItem
        }
    })

    return Object.values(armorMapping)
}

export const getJewelListByRequiredConditions = (requiredConditions) => {
    let jewelMapping = {}
    let skillLevelMapping = {}

    const skillIds = requiredConditions.skills.map((skillData) => {
        skillLevelMapping[skillData.id] = skillData.level

        return skillData.id
    })

    // Find Jewels By Skill Ids
    let isConsistent = true

    JewelDataset.hasSkills(skillIds, isConsistent).getList().forEach((jewelItem) => {
        let isSkip = false

        jewelItem.skills.forEach((skillData) => {
            if (true === isSkip) {
                return
            }

            if (0 === skillLevelMapping[skillData.id]) {
                isSkip = true

                return
            }
        })

        if (true === isSkip) {
            return
        }

        if (Helper.isEmpty(jewelMapping[jewelItem.id])) {
            jewelMapping[jewelItem.id] = jewelItem
        }
    })

    return Object.values(jewelMapping)
}

export default {
    getEquipExtendItem,
    getEquipItem,
    equipTypeToDatasetType,

    getArmorListByRequiredConditions,
    getJewelListByRequiredConditions
}
