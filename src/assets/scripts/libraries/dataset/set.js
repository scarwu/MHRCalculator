/**
 * Dataset Armor
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core
import Helper from 'core/helper'

// Load Dataset
import Armors from 'datasets/armors.json'

let dataset = Armors.map((armorBundle) => {
    return {
        id: armorBundle[0][0],
        name: armorBundle[0][1],
        rare: armorBundle[0][2],
        gender: armorBundle[0][3],
        items: armorBundle[1].map((armorItem) => {
            return {
                id: armorItem[0],
                name: armorItem[1],
                type: armorItem[2]
            }
        })
    }
})

class SetDataset {

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

export default new SetDataset(dataset)
