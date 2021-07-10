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

let dataset = Armors.map((armorBundle) => {
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

        list.forEach((data) => {
            this.mapping[data.id] = data
        })

        // Filter Conditional
        this.resetFilter()
    }

    resetFilter = () => {
        this.filterType = null
        this.filterTypes = null
        this.filterRare = null
        this.filterSet = null
        this.filterSets = null
        this.filterSkillName = null
        this.filterSkillNames = null
        this.filterSkillIsConsistent = null
    }

    getIds = () => {
        return Object.keys(this.mapping)
    }

    getList = () => {
        let result = Object.values(this.mapping).filter((data) => {
            let isSkip = true

            // Type Is
            if (Helper.isNotEmpty(this.filterType)) {
                if (this.filterType !== data.type) {
                    return false
                }
            }

            // Types Is
            if (Helper.isNotEmpty(this.filterTypes)) {
                isSkip = false

                if (-1 === this.filterTypes.indexOf(data.type)) {
                    isSkip = true
                }

                if (isSkip) {
                    return false
                }
            }

            // Rare Is
            if (Helper.isNotEmpty(this.filterRare)) {
                if (this.filterRare !== data.rare) {
                    return false
                }
            }

            // Set Is
            if (Helper.isNotEmpty(this.filterSet)) {
                if (Helper.isEmpty(data.set)
                    || this.filterSet !== data.set.id
                ) {
                    return false
                }
            }

            // Sets Is
            if (Helper.isNotEmpty(this.filterSets)) {
                isSkip = false

                if (Helper.isEmpty(data.set)
                    || -1 === this.filterSets.indexOf(data.set.id)
                ) {
                    isSkip = true
                }

                if (isSkip) {
                    return false
                }
            }

            // Has Skill
            if (Helper.isNotEmpty(this.filterSkillName)) {
                for (let index in data.skills) {
                    if (this.filterSkillName !== data.skills[index].id) {
                        continue
                    }

                    isSkip = false
                }

                if (isSkip) {
                    return false
                }
            }

            // Has Skills
            if (Helper.isNotEmpty(this.filterSkillNames)) {
                if (this.filterSkillIsConsistent) {
                    isSkip = false

                    data.skills.forEach((skillData) => {
                        if (-1 === this.filterSkillNames.indexOf(skillData.id)) {
                            isSkip = true
                        }
                    })
                } else {
                    isSkip = true

                    data.skills.forEach((skillData) => {
                        if (-1 !== this.filterSkillNames.indexOf(skillData.id)) {
                            isSkip = false
                        }
                    })
                }

                if (isSkip) {
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

    setItem = (id, info) => {
        if (Helper.isNotEmpty(info)) {
            this.mapping[id] = info
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

    rareIs = (number) => {
        this.filterRare = number

        return this
    }

    setIs = (text) => {
        this.filterSet = text

        return this
    }

    setsIs = (sets) => {
        this.filterSets = sets

        return this
    }

    hasSkill = (name) => {
        this.filterSkillName = name

        return this
    }

    hasSkills = (names, isConsistent = false) => {
        this.filterSkillNames = names
        this.filterSkillIsConsistent = isConsistent

        return this
    }
}

export default new ArmorDataset(dataset)
