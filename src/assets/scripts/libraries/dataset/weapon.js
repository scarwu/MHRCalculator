/**
 * Dataset Weapon
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core
import Helper from 'core/helper'

// Load Dataset
import Weapons from 'datasets/weapons.json'

let dataset = Weapons.map((weapon) => {
    return {
        id: weapon[0],
        series: weapon[1],
        name: weapon[2],
        rare: weapon[3],
        type: weapon[4],
        attack: weapon[5],
        criticalRate: weapon[6],
        defense: weapon[7],
        element: {
            attack: {
                type: weapon[8][0][0],
                minValue: weapon[8][0][1],
                maxValue: weapon[8][0][2]
            },
            status: {
                type: weapon[8][1][0],
                minValue: weapon[8][1][1],
                maxValue: weapon[8][1][2]
            }
        },
        sharpness: {
            minValue: weapon[9][0],
            maxValue: weapon[9][1],
            steps: {
                red: weapon[9][2][0],
                orange: weapon[9][2][1],
                yellow: weapon[9][2][2],
                green: weapon[9][2][3],
                blue: weapon[9][2][4],
                white: weapon[9][2][5],
                purple: weapon[9][2][6]
            }
        },
        slots: weapon[10].map((size) => {
            return {
                size: size
            }
        }),
        enhance: {
            amount: weapon[11][0],
            list: weapon[11][1].map((name) => {
                return {
                    name: name
                }
            })
        }
    }
})

class WeaponDataset {

    constructor (list) {
        this.mapping = {}

        list.forEach((data) => {
            this.mapping[data.id] = data
        })

        // Filter Conditional
        this.resetFilter()
    }

    resetFilter = () => {
        this.filterType = null
        this.filterTypes = null
        this.filterRare = null
        this.filterSkillName = null
    }

    getIds = () => {
        return Object.keys(this.mapping)
    }

    getList = () => {
        let result = Object.values(this.mapping).filter((data) => {
            let isSkip = true

            // Type Is
            if (Helper.isNotEmpty(this.filterType)) {
                if (this.filterType !== data.type) {
                    return false
                }
            }

            // Types Is
            if (Helper.isNotEmpty(this.filterTypes)) {
                isSkip = false

                if (-1 === this.filterTypes.indexOf(data.type)) {
                    isSkip = true
                }

                if (isSkip) {
                    return false
                }
            }

            // Rare Is
            if (Helper.isNotEmpty(this.filterRare)) {
                if (this.filterRare !== data.rare) {
                    return false
                }
            }

            // Has Skill
            if (Helper.isNotEmpty(this.filterSkillName)) {
                for (let index in data.skills) {
                    if (this.filterSkillName !== data.skills[index].id) {
                        continue
                    }

                    isSkip = false
                }

                if (isSkip) {
                    return false
                }
            }

            return true
        })

        this.resetFilter()

        return result
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

    // Conditional Functions
    typeIs = (text) => {
        this.filterType = text

        return this
    }

    typesIs = (types) => {
        this.filterTypes = types

        return this
    }

    rareIs = (number) => {
        this.filterRare = number

        return this
    }

    hasSkill = (name) => {
        this.filterSkillName = name

        return this
    }
}

export default new WeaponDataset(dataset)
