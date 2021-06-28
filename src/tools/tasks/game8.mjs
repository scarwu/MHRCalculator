/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from '../helper.mjs'
import {
    defaultWeapon,
    defaultArmor,
    defaultJewel,
    defaultPetalace,
    defaultEnhance,
    defaultSkill,
    weaponTypeList
} from '../constant.mjs'

const urls = {
    weapons: {
        bow: null,
        chargeBlade: null,
        dualBlades: null,
        greatSword: null,
        gunlance: null,
        hammer: null,
        heavyBowgun: null,
        huntingHorn: null,
        insectGlaive: null,
        lance: null,
        lightBowgun: null,
        longSword: null,
        switchAxe: null,
        swordAndShield: null
    },
    armors: 'https://game8.jp/mhrise/363845',
    skills: 'https://game8.jp/mhrise/363848',
    sets: null,
    jewels: 'https://game8.jp/mhrise/363846',
    charms: null,
    petalaces: null,
    enhances: null
}

async function fetchSkills() {
    let $ = await Helper.fetchHtmlAsDom(urls.skills)

    $('.a-table').each((index, table) => {
        $(table).find('tr').each((index, tr) => {
            if (0 === index) {
                return
            }
            if (1 !== index) {
                return
            }

            console.log(
                tr.find('td').eq(0).text()
            )
        })
    })
}

export default {
    fetchSkills
}
