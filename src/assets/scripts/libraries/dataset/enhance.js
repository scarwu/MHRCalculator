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
//     2: allowRares,
//     4: list [
//         [
//             0: level,
//             1: description,
//             2: allowRares,
//             3: size,
//             4: reaction { ... }
//         ],
//         [ ... ]
//     ]
// ]
const dataset = Enhances.map((enhanceItem) => {
    return {
        id: enhanceItem[0],
        name: enhanceItem[1],
        description: enhanceItem[2],
        reaction: enhanceItem[3]
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

    setItem = (id, item) => {
        if (Helper.isNotEmpty(item)) {
            this.mapping[id] = item
        } else {
            delete this.mapping[id]
        }
    }
}

export default new EnhanceDataset(dataset)
