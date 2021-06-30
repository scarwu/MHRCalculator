/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from '../liberaries/helper.mjs'
import {
    weaponTypeList,
    rareList,
    sizeList,
    crawlerNameList
} from '../liberaries/mh.mjs'

function statistics() {
    let result = {
        weapons: {},
        armors: {},
        // charms: {},
        petalaces: {},
        jewels: {},
        enhances: {},
        skills: {}
    }

    result.weapons.all = {}
    result.armors.all = {}
    result.jewels.all = {}

    for (let weaponType of weaponTypeList) {
        result.weapons[weaponType] = {}
        result.weapons[weaponType].all = {}

        for (let rare of rareList) {
            result.weapons[weaponType][rare] = {}
        }
    }

    for (let rare of rareList) {
        result.armors[rare] = {}
    }

    for (let size of sizeList) {
        result.jewels[size] = {}
    }

    for (let crawlerName of crawlerNameList) {

        // Weapons
        let weaponAllCount = 0
        let weaponList = Helper.loadCSVAsJSON(`temp/crawler/${crawlerName}/weapons.csv`)

        if (Helper.isNotEmpty(weaponList)) {
            result.weapons.all[crawlerName] = weaponList.length

            for (let item of weaponList) {
                let weaponType = item.type

                if (Helper.isEmpty(result.weapons[weaponType].all[crawlerName])) {
                    result.weapons[weaponType].all[crawlerName] = 0
                }

                result.weapons[weaponType].all[crawlerName] += 1

                if (Helper.isNotEmpty(item.rare)) {
                    let rare = `rare${item.rare}`

                    if (Helper.isEmpty(result.weapons[weaponType][rare][crawlerName])) {
                        result.weapons[weaponType][rare][crawlerName] = 0
                    }

                    result.weapons[weaponType][rare][crawlerName] += 1
                }
            }
        } else {
            for (let weaponType of weaponTypeList) {
                let weaponList = Helper.loadCSVAsJSON(`temp/crawler/${crawlerName}/weapons/${weaponType}.csv`)

                if (Helper.isNotEmpty(weaponList)) {
                    if (Helper.isEmpty(result.weapons.all[crawlerName])) {
                        result.weapons.all[crawlerName] = 0
                    }

                    if (Helper.isEmpty(result.weapons[weaponType].all[crawlerName])) {
                        result.weapons[weaponType].all[crawlerName] = 0
                    }

                    result.weapons.all[crawlerName] += weaponList.length
                    result.weapons[weaponType].all[crawlerName] += weaponList.length

                    for (let item of weaponList) {
                        if (Helper.isNotEmpty(item.rare)) {
                            let rare = `rare${item.rare}`

                            if (Helper.isEmpty(result.weapons[weaponType][rare][crawlerName])) {
                                result.weapons[weaponType][rare][crawlerName] = 0
                            }

                            result.weapons[weaponType][rare][crawlerName] += 1
                        }
                    }
                }
            }
        }

        // Armors
        let armorList = Helper.loadCSVAsJSON(`temp/crawler/${crawlerName}/armors.csv`)

        if (Helper.isNotEmpty(armorList)) {
            result.armors.all[crawlerName] = armorList.length

            for (let item of armorList) {
                if (Helper.isNotEmpty(item.rare)) {
                    let rare = `rare${item.rare}`

                    if (Helper.isEmpty(result.armors[rare][crawlerName])) {
                        result.armors[rare][crawlerName] = 0
                    }

                    result.armors[rare][crawlerName] += 1
                }
            }
        } else {
            for (let rare of rareList) {
                let armorList = Helper.loadCSVAsJSON(`temp/crawler/${crawlerName}/armors/${rare}.csv`)

                if (Helper.isNotEmpty(armorList)) {
                    if (Helper.isEmpty(result.armors.all[crawlerName])) {
                        result.armors.all[crawlerName] = 0
                    }

                    result.armors.all[crawlerName] += armorList.length
                    result.armors[rare][crawlerName] = armorList.length
                }
            }
        }

        // Jewels
        let jewelList = Helper.loadCSVAsJSON(`temp/crawler/${crawlerName}/jewels.csv`)

        if (Helper.isNotEmpty(jewelList)) {
            result.jewels.all[crawlerName] = jewelList.length

            for (let item of jewelList) {
                if (Helper.isNotEmpty(item.size)) {
                    let size = `size${item.size}`

                    if (Helper.isEmpty(result.jewels[size][crawlerName])) {
                        result.jewels[size][crawlerName] = 0
                    }

                    result.jewels[size][crawlerName] += 1
                }
            }
        }

        // Petalaces, Enhances & Skills
        for (let target of ['petalaces', 'enhances', 'skills']) {
            let targetList = Helper.loadCSVAsJSON(`temp/crawler/${crawlerName}/${target}.csv`)

            if (Helper.isNotEmpty(targetList)) {
                result[target][crawlerName] = targetList.length
            }
        }
    }

    // Result
    for (let target of Object.keys(result)) {
        console.log(target, '=', result[target], '\n')
    }
}

export default {
    statistics
}
