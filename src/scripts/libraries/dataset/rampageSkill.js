/**
 * Dataset RampageSkill
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core
import Helper from '@/scripts/core/helper'

// Load Dataset
import RampageSkills from '@/scripts/datasets/rampageSkills.json'

// [
//     0: id,
//     1: name,
//     2: description,
//     3: reaction { ... }
// ]
const dataset = RampageSkills.map((rampageSkillItem) => {
    return {
        id: rampageSkillItem[0],
        name: rampageSkillItem[1],
        description: rampageSkillItem[2],
        // reaction: {
        //     attack: {
        //         value: rampageSkillItem[3][0][0]
        //     },
        //     attackMultiple: {
        //         value: rampageSkillItem[3][1][0]
        //     },
        //     defense: {
        //         value: rampageSkillItem[3][2][0]
        //     },
        //     defenseMultiple: {
        //         value: rampageSkillItem[3][3][0]
        //     },
        //     criticalRate: {
        //         value: rampageSkillItem[3][4][0]
        //     },
        //     criticalMultiple: {
        //         value: rampageSkillItem[3][5][0]
        //     },
        //     elementAttackCriticalMultiple: {
        //         value: rampageSkillItem[3][6][0]
        //     },
        //     elementStatusCriticalMultiple: {
        //         value: rampageSkillItem[3][7][0]
        //     },
        //     sharpness: {
        //         value: rampageSkillItem[3][8][0]
        //     },
        //     resistance: {
        //         type: rampageSkillItem[3][9][0],
        //         value: rampageSkillItem[3][9][1]
        //     },
        //     resistanceMultiple: {
        //         type: rampageSkillItem[3][10][0],
        //         value: rampageSkillItem[3][10][1]
        //     },
        //     elementAttack: {
        //         type: rampageSkillItem[3][11][0],
        //         value: rampageSkillItem[3][11][1],
        //         multiple: rampageSkillItem[3][11][2]
        //     },
        //     elementStatus: {
        //         type: rampageSkillItem[3][12][0],
        //         value: rampageSkillItem[3][12][1],
        //         multiple: rampageSkillItem[3][12][2]
        //     },
        //     skillLevelUp: {
        //         value: rampageSkillItem[3][13][0]
        //     }
        // }
    }
})

class RampageSkillDataset {

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
        let result = Object.values(this.mapping)

        return result
    }

    getItem = (id) => {
        return (Helper.isNotEmpty(this.mapping[id]))
            ? Helper.deepCopy(this.mapping[id]) : null
    }
}

export default new RampageSkillDataset(dataset)
