/**
 * Dataset Skill
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core
import Helper from 'core/helper'

// Load Dataset
import Skills from 'datasets/skills.json'

// [
//     0: id,
//     1: name,
//     2: description,
//     3: type,
//     5: list [
//         [
//             0: level,
//             1: description,
//             2: reaction { ... }
//         ],
//         [ ... ]
//     ]
// ]
const dataset = Skills.map((skillBundle) => {
    return {
        id: skillBundle[0],
        name: skillBundle[1],
        description: skillBundle[2],
        type: skillBundle[3],
        list: skillBundle[4].map((skillItem) => {
            return {
                level: skillItem[0],
                effect: skillItem[1],
                reaction: skillItem[2]
            }
        })
    }
})

class SkillDataset {

    constructor (list) {
        this.mapping = {}

        list.forEach((item) => {
            this.mapping[item.id] = item
        })
    }

    getIds = () => {
        return Object.keys(this.mapping)
    }

    getList = () => {
        return Object.values(this.mapping)
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
}

export default new SkillDataset(dataset)
