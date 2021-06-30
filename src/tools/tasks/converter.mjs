/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from '../liberaries/helper.mjs'

const weaponTypeList = [
    'greatSword', 'swordAndShield', 'dualBlades', 'longSword',
    'hammer', 'huntingHorn', 'lance', 'gunlance', 'switchAxe', 'chargeBlade',
    'insectGlaive', 'bow', 'heavyBowgun', 'lightBowgun'
]

const armorRareList = [
    'rare1', 'rare2', 'rare3', 'rare4', 'rare5', 'rare6', 'rare7'
]

const targetList = [
    'jewels', 'skills', 'petalaces', 'enhances'
]

const sourceList = [
    'gameqb', 'game8', 'kiranico'
]

function statistics() {
    let result = {
        weapons: {
            all: {},
            greatSword: {},
            swordAndShield: {},
            dualBlades: {},
            longSword: {},
            hammer: {},
            huntingHorn: {},
            lance: {},
            gunlance: {},
            switchAxe: {},
            chargeBlade: {},
            insectGlaive: {},
            bow: {},
            heavyBowgun: {},
            lightBowgun: {}
        },
        armors: {
            all: {},
            rare1: {},
            rare2: {},
            rare3: {},
            rare4: {},
            rare5: {},
            rare6: {},
            rare7: {}
        },
        charms: {},
        petalaces: {},
        jewels: {},
        enhances: {},
        skills: {}
    }

    for (let source of sourceList) {
        let allCount = null
        let list = null

        // Weapons
        allCount = 0
        list = Helper.loadCSVAsJSON(`temp/crawler/${source}/weapons.csv`)

        if (Helper.isNotEmpty(list)) {
            allCount += list.length
        }

        for (let weaponType of weaponTypeList) {
            list = Helper.loadCSVAsJSON(`temp/crawler/${source}/weapons/${weaponType}.csv`)

            if (Helper.isEmpty(list)) {
                continue
            }

            allCount += list.length
            result.weapons[weaponType][source] = list.length
        }

        result.weapons.all[source] = allCount

        // Armors
        allCount = 0
        list = Helper.loadCSVAsJSON(`temp/crawler/${source}/armors.csv`)

        if (Helper.isNotEmpty(list)) {
            allCount += list.length
        }

        for (let armorRare of armorRareList) {
            let list = Helper.loadCSVAsJSON(`temp/crawler/${source}/armors/${armorRare}.csv`)

            if (Helper.isEmpty(list)) {
                continue
            }

            allCount += list.length
            result.armors[armorRare][source] = list.length
        }

        result.armors.all[source] = allCount

        // Other target
        for (let target of targetList) {
            list = Helper.loadCSVAsJSON(`temp/crawler/${source}/${target}.csv`)

            if (Helper.isEmpty(list)) {
                continue
            }

            result[target][source] = list.length
        }
    }

    console.log(result)
}

export default {
    statistics
}
