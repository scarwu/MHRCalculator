/**
 * Dataset Enhance
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core
import Helper from 'core/helper'

// Load Dataset
import Enhances from 'datasets/enhances.json'

// [
//     0: id,
//     1: name,
//     2: description,
//     3: reaction { ... }
// ]
const dataset = Enhances.map((enhanceItem) => {
    return {
        id: enhanceItem[0],
        name: enhanceItem[1],
        description: enhanceItem[2],
        // reaction: {
        //     attack: {
        //         value: enhanceItem[3][0][0]
        //     },
        //     attackMultiple: {
        //         value: enhanceItem[3][1][0]
        //     },
        //     defense: {
        //         value: enhanceItem[3][2][0]
        //     },
        //     defenseMultiple: {
        //         value: enhanceItem[3][3][0]
        //     },
        //     criticalRate: {
        //         value: enhanceItem[3][4][0]
        //     },
        //     criticalMultiple: {
        //         value: enhanceItem[3][5][0]
        //     },
        //     elementAttackCriticalMultiple: {
        //         value: enhanceItem[3][6][0]
        //     },
        //     elementStatusCriticalMultiple: {
        //         value: enhanceItem[3][7][0]
        //     },
        //     sharpness: {
        //         value: enhanceItem[3][8][0]
        //     },
        //     resistance: {
        //         type: enhanceItem[3][9][0],
        //         value: enhanceItem[3][9][1]
        //     },
        //     resistanceMultiple: {
        //         type: enhanceItem[3][10][0],
        //         value: enhanceItem[3][10][1]
        //     },
        //     elementAttack: {
        //         type: enhanceItem[3][11][0],
        //         value: enhanceItem[3][11][1],
        //         multiple: enhanceItem[3][11][2]
        //     },
        //     elementStatus: {
        //         type: enhanceItem[3][12][0],
        //         value: enhanceItem[3][12][1],
        //         multiple: enhanceItem[3][12][2]
        //     },
        //     skillLevelUp: {
        //         value: enhanceItem[3][13][0]
        //     }
        // }
    }
})

class EnhanceDataset {

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

export default new EnhanceDataset(dataset)
