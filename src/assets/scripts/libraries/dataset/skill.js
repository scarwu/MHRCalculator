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
//     3: from [
//         0: jewel,
//         1: armor
//     ],
//     4: type,
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
    let skillResult = {
        id: skillBundle[0],
        name: skillBundle[1],
        description: skillBundle[2],
        from: {
            jewel: skillBundle[3][0],
            armor: skillBundle[3][1],
            charm: skillBundle[3][2]
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

    skillResult.list = skillResult.list.map((skillItem) => {

        // Reaction Attack
        if (Helper.isEmpty(skillItem.reaction.attack.value)) {
            skillItem.reaction.attack = null
        }

        // Reaction AttackMultiple
        if (Helper.isEmpty(skillItem.reaction.attackMultiple.value)) {
            skillItem.reaction.attackMultiple = null
        }

        // Reaction Defense
        if (Helper.isEmpty(skillItem.reaction.defense.value)) {
            skillItem.reaction.defense = null
        }

        // Reaction DefenseMultiple
        if (Helper.isEmpty(skillItem.reaction.defenseMultiple.value)) {
            skillItem.reaction.defenseMultiple = null
        }

        // Reaction CriticalRate
        if (Helper.isEmpty(skillItem.reaction.criticalRate.value)) {
            skillItem.reaction.criticalRate = null
        }

        // Reaction CriticalMultiple
        if (Helper.isEmpty(skillItem.reaction.criticalMultiple.value)) {
            skillItem.reaction.criticalMultiple = null
        }

        // Reaction ElementAttackCriticalMultiple
        if (Helper.isEmpty(skillItem.reaction.elementAttackCriticalMultiple.value)) {
            skillItem.reaction.elementAttackCriticalMultiple = null
        }

        // Reaction ElementStatusCriticalMultiple
        if (Helper.isEmpty(skillItem.reaction.elementStatusCriticalMultiple.value)) {
            skillItem.reaction.elementStatusCriticalMultiple = null
        }

        // Reaction Sharpness
        if (Helper.isEmpty(skillItem.reaction.sharpness.value)) {
            skillItem.reaction.sharpness = null
        }

        // Reaction Resistance
        if (Helper.isEmpty(skillItem.reaction.resistance.type)
            || Helper.isEmpty(skillItem.reaction.resistance.value)
        ) {
            skillItem.reaction.resistance = null
        }

        // Reaction ResistanceMultiple
        if (Helper.isEmpty(skillItem.reaction.resistanceMultiple.type)
            || Helper.isEmpty(skillItem.reaction.resistanceMultiple.value)
        ) {
            skillItem.reaction.resistanceMultiple = null
        }

        // Reaction ElementAttack
        if (Helper.isEmpty(skillItem.reaction.elementAttack.type)
            || Helper.isEmpty(skillItem.reaction.elementAttack.value)
            || Helper.isEmpty(skillItem.reaction.elementAttack.multiple)
        ) {
            skillItem.reaction.elementAttack = null
        }

        // Reaction ElementStatus
        if (Helper.isEmpty(skillItem.reaction.elementStatus.type)
            || Helper.isEmpty(skillItem.reaction.elementStatus.value)
            || Helper.isEmpty(skillItem.reaction.elementStatus.multiple)
        ) {
            skillItem.reaction.elementStatus = null
        }

        // Reaction SkillLevelUp
        if (Helper.isEmpty(skillItem.reaction.skillLevelUp.value)) {
            skillItem.reaction.skillLevelUp = null
        }

        return skillItem
    })

    return skillResult
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
