/**
 * Dataset Set
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core Libraries
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
let dataset = Petalaces.map((item) => {
    return {
        id: item[0],
        name: item[1],
        rare: item[2],
        health: {
            increment: item[3][0],
            obtain: item[3][1]
        },
        stamina: {
            increment: item[4][0],
            obtain: item[4][1]
        },
        attack: {
            increment: item[5][0],
            obtain: item[5][1]
        },
        defense: {
            increment: item[6][0],
            obtain: item[6][1]
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

    getItems = () => {
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

export default new PetalaceDataset(dataset)
