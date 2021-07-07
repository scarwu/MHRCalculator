/**
 * Dataset Enhance
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core Libraries
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
let dataset = Enhances.map((enhance) => {
    return {
        id: enhance[0],
        name: enhance[1],
        description: enhance[2],
        reaction: enhance[3]
    }
})

class EnhanceDataset {

    constructor (list) {
        this.mapping = {}

        list.forEach((data) => {
            this.mapping[data.id] = data
        })
    }

    getIds = () => {
        return Object.keys(this.mapping)
    }

    getItems = () => {
        let result = Object.values(this.mapping)

        return result
    }

    getInfo = (id) => {
        return (Helper.isNotEmpty(this.mapping[id]))
            ? Helper.deepCopy(this.mapping[id]) : null
    }

    setInfo = (id, info) => {
        if (Helper.isNotEmpty(info)) {
            this.mapping[id] = info
        } else {
            delete this.mapping[id]
        }
    }
}

export default new EnhanceDataset(dataset)
