/**
 * Dataset Set
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core
import Helper from 'core/helper'

// Load Dataset
import Petalaces from 'datasets/petalaces.json'

// [
//     0: id,
//     1: name,
//     2: rare,
//     3: health [
//         0: increment,
//         1: obtain
//     ],
//     4: stamina [
//         0: increment,
//         1: obtain
//     ],
//     5: attack [
//         0: increment,
//         1: obtain
//     ],
//     6: defense [
//         0: increment,
//         1: obtain
//     ]
// ]
const dataset = Petalaces.map((petalaceItem) => {
    return {
        id: petalaceItem[0],
        name: petalaceItem[1],
        rare: petalaceItem[2],
        health: {
            increment: petalaceItem[3][0],
            obtain: petalaceItem[3][1]
        },
        stamina: {
            increment: petalaceItem[4][0],
            obtain: petalaceItem[4][1]
        },
        attack: {
            increment: petalaceItem[5][0],
            obtain: petalaceItem[5][1]
        },
        defense: {
            increment: petalaceItem[6][0],
            obtain: petalaceItem[6][1]
        }
    }
})

class PetalaceDataset {

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

export default new PetalaceDataset(dataset)
