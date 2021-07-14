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
        from: {
            jewel: skillBundle[3][0],
            armor: skillBundle[3][1],
        },
        type: skillBundle[4],
        list: skillBundle[5].map((skillItem) => {
            return {
                level: skillItem[0],
                effect: skillItem[1],
                reaction: {
                    attack: {
                        value: skillItem[2][0][0]
                    },
                    attackMultiple: {
                        value: skillItem[2][1][0]
                    },
                    defense: {
                        value: skillItem[2][2][0]
                    },
                    defenseMultiple: {
                        value: skillItem[2][3][0]
                    },
                    criticalRate: {
                        value: skillItem[2][4][0]
                    },
                    criticalMultiple: {
                        value: skillItem[2][5][0]
                    },
                    elementAttackCriticalMultiple: {
                        value: skillItem[2][6][0]
                    },
                    elementStatusCriticalMultiple: {
                        value: skillItem[2][7][0]
                    },
                    sharpness: {
                        value: skillItem[2][8][0]
                    },
                    resistance: {
                        type: skillItem[2][9][0],
                        value: skillItem[2][9][1]
                    },
                    resistanceMultiple: {
                        type: skillItem[2][10][0],
                        value: skillItem[2][10][1]
                    },
                    elementAttack: {
                        type: skillItem[2][11][0],
                        value: skillItem[2][11][1],
                        multiple: skillItem[2][11][2]
                    },
                    elementStatus: {
                        type: skillItem[2][12][0],
                        value: skillItem[2][12][1],
                        multiple: skillItem[2][12][2]
                    },
                    skillLevelUp: {
                        value: skillItem[2][13][0]
                    }
                }
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
}

export default new SkillDataset(dataset)
