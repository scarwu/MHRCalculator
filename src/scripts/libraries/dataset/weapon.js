/**
 * Dataset Weapon
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core
import Helper from '@/scripts/core/helper'

// Load Dataset
import Weapons from '@/scripts/datasets/weapons.json'

const dataset = Weapons.map((weaponItem) => {
    let weaponResult = {
        id: weaponItem[0],
        series: weaponItem[1],
        name: weaponItem[2],
        rare: weaponItem[3],
        type: weaponItem[4],
        attack: weaponItem[5],
        criticalRate: weaponItem[6],
        defense: weaponItem[7],
        element: {
            attack: {
                type: weaponItem[8][0][0],
                minValue: weaponItem[8][0][1],
                maxValue: weaponItem[8][0][2],
                value: null
            },
            status: {
                type: weaponItem[8][1][0],
                minValue: weaponItem[8][1][1],
                maxValue: weaponItem[8][1][2],
                value: null
            }
        },
        sharpness: {
            minValue: weaponItem[9][0],
            maxValue: weaponItem[9][1],
            value: null,
            steps: {
                red: weaponItem[9][2][0],
                orange: weaponItem[9][2][1],
                yellow: weaponItem[9][2][2],
                green: weaponItem[9][2][3],
                blue: weaponItem[9][2][4],
                white: weaponItem[9][2][5],
                purple: weaponItem[9][2][6]
            }
        },
        slots: weaponItem[10].map((slotData) => {
            return {
                size: slotData[0]
            }
        }),
        rampageSkill: {
            amount: weaponItem[11][0],
            // list: weaponItem[11][1].map((rampageSkillData) => {
            //     return {
            //         name: rampageSkillData[0]
            //     }
            // })
        }
    }

    // Set Values
    if (Helper.isEmpty(weaponResult.attack)) {
        weaponResult.attack = 0
    }

    if (Helper.isEmpty(weaponResult.criticalRate)) {
        weaponResult.criticalRate = 0
    }

    if (Helper.isEmpty(weaponResult.defense)) {
        weaponResult.defense = 0
    }

    // Filter Element Attack & Set Value
    if (Helper.isNotEmpty(weaponResult.element.attack)
        && Helper.isNotEmpty(weaponResult.element.attack.type)
        && Helper.isNotEmpty(weaponResult.element.attack.minValue)
    ) {
        weaponResult.element.attack.value = Helper.isNotEmpty(weaponResult.element.attack.maxValue)
            ? weaponResult.element.attack.maxValue
            : weaponResult.element.attack.minValue
    } else {
        weaponResult.element.attack = null
    }

    // Filter Element Status & Set Value
    if (Helper.isNotEmpty(weaponResult.element.status)
        && Helper.isNotEmpty(weaponResult.element.status.type)
        && Helper.isNotEmpty(weaponResult.element.status.minValue)
    ) {
        weaponResult.element.status.value = Helper.isNotEmpty(weaponResult.element.status.maxValue)
            ? weaponResult.element.status.maxValue
            : weaponResult.element.status.minValue
    } else {
        weaponResult.element.status = null
    }

    // Filter Sharpness
    if (Helper.isNotEmpty(weaponResult.sharpness.minValue)
        && Helper.isNotEmpty(weaponResult.sharpness.steps)
        && (Helper.isNotEmpty(weaponResult.sharpness.steps.red)
            || Helper.isNotEmpty(weaponResult.sharpness.steps.orange)
            || Helper.isNotEmpty(weaponResult.sharpness.steps.yellow)
            || Helper.isNotEmpty(weaponResult.sharpness.steps.green)
            || Helper.isNotEmpty(weaponResult.sharpness.steps.blue)
            || Helper.isNotEmpty(weaponResult.sharpness.steps.white)
            || Helper.isNotEmpty(weaponResult.sharpness.steps.purple)
        )
    ) {
        weaponResult.sharpness.value = weaponResult.sharpness.minValue
    } else {
        weaponResult.sharpness = null
    }

    // Filter Slots
    weaponResult.slots = weaponResult.slots.filter((slotData) => {
        return Helper.isNotEmpty(slotData.size)
    })

    if (0 === weaponResult.slots.length) {
        weaponResult.slots = null
    }

    return weaponResult
})

class WeaponDataset {

    constructor (list) {
        this.mapping = {}

        list.forEach((item) => {
            this.mapping[item.id] = item
        })

        // Filter Conditional
        this.resetFilter()
    }

    resetFilter = () => {
        this.filterType = null
        this.filterTypes = null
        this.filterRare = null
        // this.filterSkillId = null
    }

    getIds = () => {
        return Object.keys(this.mapping)
    }

    getList = () => {
        let result = Object.values(this.mapping).filter((item) => {
            let isSkip = true

            // Type Is
            if (Helper.isNotEmpty(this.filterType)) {
                if (this.filterType !== item.type) {
                    return false
                }
            }

            // Types Is
            if (Helper.isNotEmpty(this.filterTypes)) {
                isSkip = false

                if (-1 === this.filterTypes.indexOf(item.type)) {
                    isSkip = true
                }

                if (true === isSkip) {
                    return false
                }
            }

            // Rare Is
            if (Helper.isNotEmpty(this.filterRare)) {
                if (this.filterRare !== item.rare) {
                    return false
                }
            }

            // Has Skill
            // if (Helper.isNotEmpty(this.filterSkillId)) {
            //     if (Helper.isEmpty(item.skills)) {
            //         return false
            //     }

            //     for (let index in item.skills) {
            //         if (this.filterSkillId !== item.skills[index].id) {
            //             continue
            //         }

            //         isSkip = false
            //     }

            //     if (true === isSkip) {
            //         return false
            //     }
            // }

            return true
        })

        this.resetFilter()

        return result
    }

    getItem = (id) => {
        return (Helper.isNotEmpty(this.mapping[id]))
            ? Helper.deepCopy(this.mapping[id]) : null
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

    rareIs = (rare) => {
        this.filterRare = rare

        return this
    }

    // hasSkill = (skillId) => {
    //     this.filterSkillId = skillId

    //     return this
    // }
}

export default new WeaponDataset(dataset)
