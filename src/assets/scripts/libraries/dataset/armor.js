/**
 * Dataset Armor
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core
import Helper from 'core/helper'

// Load Dataset
import Armors from 'datasets/armors.json'

const dataset = Armors.map((armorBundle) => {
    return armorBundle[1].map((armorItem) => {
        let armorResult = {
            seriesId: armorBundle[0][0],
            series: armorBundle[0][1],
            rare: armorBundle[0][2],
            gender: armorBundle[0][3],
            minDefense: armorBundle[0][4],
            maxDefense: armorBundle[0][5],
            defense: null,
            resistance: {
                fire: armorBundle[0][6][0],
                water: armorBundle[0][6][1],
                thunder: armorBundle[0][6][2],
                ice: armorBundle[0][6][3],
                dragon: armorBundle[0][6][4]
            },
            id: armorItem[0],
            name: armorItem[1],
            type: armorItem[2],
            slots: armorItem[3].map((slotData) => {
                return {
                    size: slotData[0]
                }
            }),
            skills: armorItem[4].map((skillData) => {
                return {
                    id: skillData[0],
                    level: skillData[1]
                }
            })
        }

        // Set Defense
        armorResult.defense = Helper.isNotEmpty(armorResult.maxDefense)
            ? armorResult.maxDefense : armorResult.minDefense

        // Filter Slots
        armorResult.slots = armorResult.slots.filter((slotData) => {
            return Helper.isNotEmpty(slotData.size)
        })

        if (0 === armorResult.slots.length) {
            armorResult.slots = null
        }

        // Filter Skills
        armorResult.skills = armorResult.skills.filter((skillData) => {
            return Helper.isNotEmpty(skillData.id)
                && Helper.isNotEmpty(skillData.level)
        })

        if (0 === armorResult.skills.length) {
            armorResult.skills = null
        }

        return armorResult
    })
}).reduce((armorsA, armorsB) => {
    return armorsA.concat(armorsB)
})

class ArmorDataset {

    constructor (list) {
        this.mapping = {}

        list.forEach((item) => {
            this.mapping[item.id] = item
        })

        // Filter Conditional
        this.resetFilter()
    }

    resetFilter = () => {
        this.filterType = null
        this.filterTypes = null
        this.filterRare = null
        this.filterSkillId = null
        this.filterSkillIds = null
        this.filterSkillIsConsistent = null
    }

    getIds = () => {
        return Object.keys(this.mapping)
    }

    getList = () => {
        let result = Object.values(this.mapping).filter((item) => {
            let isSkip = true

            // Type Is
            if (Helper.isNotEmpty(this.filterType)) {
                if (this.filterType !== item.type) {
                    return false
                }
            }

            // Types Is
            if (Helper.isNotEmpty(this.filterTypes)) {
                isSkip = false

                if (-1 === this.filterTypes.indexOf(item.type)) {
                    isSkip = true
                }

                if (true === isSkip) {
                    return false
                }
            }

            // Rare Is
            if (Helper.isNotEmpty(this.filterRare)) {
                if (this.filterRare !== item.rare) {
                    return false
                }
            }

            // Has Skill
            if (Helper.isNotEmpty(this.filterSkillId)) {
                if (Helper.isEmpty(item.skills)) {
                    return false
                }

                for (let index in item.skills) {
                    if (this.filterSkillId !== item.skills[index].id) {
                        continue
                    }

                    isSkip = false
                }

                if (true === isSkip) {
                    return false
                }
            }

            // Has Skills
            if (Helper.isNotEmpty(this.filterSkillIds)) {
                if (Helper.isEmpty(item.skills)) {
                    return false
                }

                if (this.filterSkillIsConsistent) {
                    isSkip = false

                    item.skills.forEach((skillData) => {
                        if (-1 === this.filterSkillIds.indexOf(skillData.id)) {
                            isSkip = true
                        }
                    })
                } else {
                    isSkip = true

                    item.skills.forEach((skillData) => {
                        if (-1 !== this.filterSkillIds.indexOf(skillData.id)) {
                            isSkip = false
                        }
                    })
                }

                if (true === isSkip) {
                    return false
                }
            }

            return true
        })

        this.resetFilter()

        return result
    }

    getItem = (id) => {
        return (Helper.isNotEmpty(this.mapping[id]))
            ? Helper.deepCopy(this.mapping[id]) : null
    }

    setItem = (id, item) => {
        if (Helper.isNotEmpty(item)) {
            this.mapping[id] = item
        } else {
            delete this.mapping[id]
        }
    }

    // Conditional Functions
    typeIs = (text) => {
        this.filterType = text

        return this
    }

    typesIs = (types) => {
        this.filterTypes = types

        return this
    }

    rareIs = (rare) => {
        this.filterRare = rare

        return this
    }

    hasSkill = (skillId) => {
        this.filterSkillId = skillId

        return this
    }

    hasSkills = (skillIds, isConsistent = false) => {
        this.filterSkillIds = skillIds
        this.filterSkillIsConsistent = isConsistent

        return this
    }
}

export default new ArmorDataset(dataset)
