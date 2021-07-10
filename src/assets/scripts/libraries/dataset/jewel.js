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
let dataset = Jewels.map((jewelItem) => {
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

        list.forEach((data) => {
            this.mapping[data.id] = data
        })

        // Filter Conditional
        this.resetFilter()
    }

    resetFilter = () => {
        this.filterRare = null
        this.filterSkillName = null
        this.filterSize = null
        this.filterSizeCondition = null
        this.filterSkillNames = null
        this.filterSkillIsConsistent = null
    }

    getIds = () => {
        return Object.keys(this.mapping)
    }

    getList = () => {
        let result = Object.values(this.mapping).filter((data) => {
            let isSkip = true

            // Rare Is
            if (Helper.isNotEmpty(this.filterRare)) {
                if (this.filterRare !== data.rare) {
                    return false
                }
            }

            // Size Is
            if (Helper.isNotEmpty(this.filterSize)) {
                switch (this.filterSizeCondition) {
                case 'equal':
                    if (this.filterSize !== data.size) {
                        return false
                    }

                    break
                case 'greaterEqual':
                    if (this.filterSize > data.size) {
                        return false
                    }

                    break
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
    rareIs = (number) => {
        this.filterRare = number

        return this
    }

    sizeIs = (value, condition = 'equal') => {
        this.filterSize = value
        this.filterSizeCondition = condition

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

export default new JewelDataset(dataset)
