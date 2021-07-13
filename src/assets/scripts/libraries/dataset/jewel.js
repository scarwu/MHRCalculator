/**
 * Dataset Jewel
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core
import Helper from 'core/helper'

// Load Dataset
import Jewels from 'datasets/jewels.json'

// [
//     0: id,
//     1: name,
//     2: rare,
//     3: size,
//     4: skills [
//         [
//             0: id,
//             1: level
//         ],
//         [ ... ]
//     ]
// ]
const dataset = Jewels.map((jewelItem) => {
    return {
        id: jewelItem[0],
        name: jewelItem[1],
        rare: jewelItem[2],
        size: jewelItem[3],
        skills: jewelItem[4].map((skillData) => {
            return {
                id: skillData[0],
                level: skillData[1]
            }
        })
    }
})

class JewelDataset {

    constructor (list) {
        this.mapping = {}

        list.forEach((item) => {
            this.mapping[item.id] = item
        })

        // Filter Conditional
        this.resetFilter()
    }

    resetFilter = () => {
        this.filterRare = null
        this.filterSkillId = null
        this.filterSize = null
        this.filterSizeCondition = null
        this.filterSkillIds = null
        this.filterSkillIsConsistent = null
    }

    getIds = () => {
        return Object.keys(this.mapping)
    }

    getList = () => {
        let result = Object.values(this.mapping).filter((item) => {
            let isSkip = true

            // Rare Is
            if (Helper.isNotEmpty(this.filterRare)) {
                if (this.filterRare !== item.rare) {
                    return false
                }
            }

            // Size Is
            if (Helper.isNotEmpty(this.filterSize)) {
                switch (this.filterSizeCondition) {
                case 'equal':
                    if (this.filterSize !== item.size) {
                        return false
                    }

                    break
                case 'greaterEqual':
                    if (this.filterSize > item.size) {
                        return false
                    }

                    break
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
    rareIs = (rare) => {
        this.filterRare = rare

        return this
    }

    sizeIs = (size, condition = 'equal') => {
        this.filterSize = size
        this.filterSizeCondition = condition

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

export default new JewelDataset(dataset)
