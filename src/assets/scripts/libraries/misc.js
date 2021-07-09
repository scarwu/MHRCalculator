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

export const getWeaponExtendItem = (equipItem) => {
    if ('object' !== typeof equipItem
        || 'string' !== typeof equipItem.id
    ) {
        return null
    }

    let weaponItem = WeaponDataset.getItem(equipItem.id)

    if (Helper.isEmpty(weaponItem)) {
        return null
    }

    if (Helper.isNotEmpty(weaponItem.element)
        && Helper.isNotEmpty(weaponItem.element.attack)
    ) {
        weaponItem.element.attack.value = weaponItem.element.attack.minValue
    }

    if (Helper.isNotEmpty(weaponItem.element)
        && Helper.isNotEmpty(weaponItem.element.status)
    ) {
        weaponItem.element.status.value = weaponItem.element.status.minValue
    }

    // // Handle Enhance
    // let enhanceSize = 0

    // if (6 <= weaponItem.rare && weaponItem.rare <= 8) {
    //     enhanceSize = 9 - weaponItem.rare
    // }

    // if (10 <= weaponItem.rare && weaponItem.rare <= 12) {
    //     enhanceSize = (15 - weaponItem.rare) * 2
    // }

    // weaponItem.enhanceSize = enhanceSize
    // weaponItem.enhances = Helper.isNotEmpty(equipItem.enhances)
    //     ? equipItem.enhances : []

    // weaponItem.enhances.forEach((enhance) => {
    //     let enhanceLevel = enhance.level
    //     let enhanceItem = EnhanceDataset.getItem(enhance.id)

    //     if (Helper.isEmpty(enhanceItem.list[enhanceLevel - 1].reaction)) {
    //         return false
    //     }

    //     Object.keys(enhanceItem.list[enhanceLevel - 1].reaction).forEach((reactionType) => {
    //         let data = enhanceItem.list[enhanceLevel - 1].reaction[reactionType]

    //         switch (reactionType) {
    //         case 'attack':
    //             weaponItem.attack += data.value * Constant.weaponMultiple[weaponItem.type]
    //             weaponItem.attack = parseInt(Math.round(weaponItem.attack))

    //             break
    //         case 'criticalRate':
    //             weaponItem.criticalRate += data.value

    //             break
    //         case 'defense':
    //             weaponItem.defense = data.value

    //             break
    //         case 'addSlot':
    //             weaponItem.slots.push({
    //                 size: data.size
    //             })

    //             break
    //         }
    //     })
    // })

    // Handler Slot
    let skillLevelMapping = {}

    weaponItem.skills && weaponItem.skills.forEach((skillData) => {
        let skillId = skillData.id

        if (Helper.isEmpty(skillLevelMapping[skillId])) {
            skillLevelMapping[skillId] = 0
        }

        skillLevelMapping[skillId] += skillData.level
    })

    weaponItem.slots && weaponItem.slots.forEach((data, index) => {
        let jewelItem = null

        if (Helper.isNotEmpty(equipItem.jewelIds)
            && Helper.isNotEmpty(equipItem.jewelIds[index])
        ) {
            jewelItem = JewelDataset.getItem(equipItem.jewelIds[index])
        }

        if (Helper.isEmpty(jewelItem)) {
            weaponItem.slots[index].jewel = {}

            return false
        }

        // Update Item
        weaponItem.slots[index].jewel = {
            id: jewelItem.id,
            size: jewelItem.size
        }

        jewelItem.skills && jewelItem.skills.forEach((data, index) => {
            let skillId = data.id

            if (Helper.isEmpty(skillLevelMapping[skillId])) {
                skillLevelMapping[skillId] = 0
            }

            skillLevelMapping[skillId] += data.level
        })
    })

    // Reset Skill
    weaponItem.skills = []

    Object.keys(skillLevelMapping).forEach((skillId) => {
        let skillLevel = skillLevelMapping[skillId]
        let skillItem = SkillDataset.getItem(skillId)

        // Fix Skill Level Overflow
        if (skillLevel > skillItem.list.length) {
            skillLevel = skillItem.list.length
        }

        weaponItem.skills.push({
            id: skillId,
            level: skillLevel,
            description: skillItem.list[skillLevel - 1].description
        })
    })

    weaponItem.skills = weaponItem.skills.sort((skillDataA, skillDataB) => {
        return skillDataB.level - skillDataA.level
    })

    return Helper.deepCopy(weaponItem)
}

export const getArmorExtendItem = (equipItem) => {
    if ('object' !== typeof equipItem
        || 'string' !== typeof equipItem.id
    ) {
        return null
    }

    let armorItem = ArmorDataset.getItem(equipItem.id)

    if (Helper.isEmpty(armorItem)) {
        return null
    }

    // Handler Skill & Slot
    let skillLevelMapping = {}

    armorItem.skills && armorItem.skills.forEach((skillData) => {
        let skillId = skillData.id

        if (Helper.isEmpty(skillLevelMapping[skillId])) {
            skillLevelMapping[skillId] = 0
        }

        skillLevelMapping[skillId] += skillData.level
    })

    armorItem.slots && armorItem.slots.forEach((slotData, index) => {
        let jewelItem = null

        if (Helper.isNotEmpty(equipItem.jewelIds)
            && Helper.isNotEmpty(equipItem.jewelIds[index])
        ) {
            jewelItem = JewelDataset.getItem(equipItem.jewelIds[index])
        }

        if (Helper.isEmpty(jewelItem)) {
            armorItem.slots[index].jewel = {}

            return false
        }

        // Update Item
        armorItem.slots[index].jewel = {
            id: jewelItem.id,
            size: jewelItem.size
        }

        jewelItem.skills && jewelItem.skills.forEach((skillData, index) => {
            let skillId = skillData.id

            if (Helper.isEmpty(skillLevelMapping[skillId])) {
                skillLevelMapping[skillId] = 0
            }

            skillLevelMapping[skillId] += skillData.level
        })
    })

    // Reset Skill
    armorItem.skills = []

    Object.keys(skillLevelMapping).forEach((skillId) => {
        let skillLevel = skillLevelMapping[skillId]
        let skillItem = SkillDataset.getItem(skillId)

        armorItem.skills.push({
            id: skillId,
            level: skillLevel,
            description: skillItem.list[skillLevel - 1].description
        })
    })

    armorItem.skills = armorItem.skills.sort((skillA, skillB) => {
        return skillB.level - skillA.level
    })

    return Helper.deepCopy(armorItem)
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

export const getEquipExtendItem = (equipType, equipItem) => {
    switch (equipTypeToDatasetType(equipType)) {
        case 'weapon':
            return getWeaponExtendItem(equipItem)
        case 'armor':
            return getArmorExtendItem(equipItem)
        case 'petalace':
            return Helper.deepCopy(PetalaceDataset.getItem(equipItem.id))
        case 'charm':
            return null
        default:
            return null
    }
}

export default {
    getWeaponExtendItem,
    getArmorExtendItem,
    getEquipExtendItem,
    equipTypeToDatasetType
}
