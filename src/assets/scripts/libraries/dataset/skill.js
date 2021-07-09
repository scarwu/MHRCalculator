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
let dataset = Skills.map((skill) => {
    return {
        id: skill[0],
        name: skill[1],
        description: skill[2],
        type: skill[3],
        list: skill[4].map((item) => {
            return {
                level: item[0],
                effect: item[1],
                reaction: item[2]
            }
        })
    }
})

class SkillDataset {

    constructor (list) {
        this.mapping = {}

        list.forEach((data) => {
            this.mapping[data.id] = data
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

    setItem = (id, info) => {
        if (Helper.isNotEmpty(info)) {
            this.mapping[id] = info
        } else {
            delete this.mapping[id]
        }
    }
}

export default new SkillDataset(dataset)
