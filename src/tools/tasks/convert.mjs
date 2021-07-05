/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import md5 from 'md5'

import Helper from '../liberaries/helper.mjs'
import {
    defaultWeaponItem,
    defaultArmorItem,
    defaultPetalaceItem,
    defaultJewelItem,
    defaultEnhanceItem,
    defaultSkillItem,
    autoExtendListQuantity,
    weaponTypeList,
    rareList,
    sizeList
} from '../liberaries/mh.mjs'

const crawlerRoot = 'temp/crawler'
const convertRoot = 'files'

export const crawlerList = [
    'gameqb', 'game8', 'kiranico', 'fextralife'
]

export const targetList = [
    'weapons',
    'armors',
    'petalaces',
    'jewels',
    'enhances',
    'skills'
]

export const langList = [
    'zhTW',
    'jaJP',
    'enUS'
]

export const runAction = () => {
    let rawDataMapping = {}

    // Load Raw Data
    Object.values(targetList).forEach((target) => {
        console.log(`load:${target}`)

        let list = Helper.loadCSVAsJSON(`${convertRoot}/${target}.csv`)

        if (Helper.isNotEmpty(list)) {
            rawDataMapping[target] = list
        }
    })


}

export const infoAction = () => {

    // Generate Result Format
    let result = {
        weapons: {},
        armors: {},
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

    console.log(`count:final`)

    for (let target of targetList) {
        console.log(`count:final:${target}`)

        if ('weapons' === target) {
            let weaponList = Helper.loadCSVAsJSON(`${convertRoot}/weapons.csv`)

            if (Helper.isEmpty(weaponList)) {
                result.weapons.all.final = weaponList.length

                for (let item of weaponList) {
                    let weaponType = item.type

                    if (Helper.isEmpty(result.weapons[weaponType].all.final)) {
                        result.weapons[weaponType].all.final = 0
                    }

                    result.weapons[weaponType].all.final += 1

                    if (Helper.isNotEmpty(item.rare)) {
                        let rare = `rare${item.rare}`

                        if (Helper.isEmpty(result.weapons[weaponType][rare].final)) {
                            result.weapons[weaponType][rare].final = 0
                        }

                        result.weapons[weaponType][rare].final += 1
                    }
                }
            }

            continue
        }

        if ('armors' === target) {
            let armorList = Helper.loadCSVAsJSON(`${convertRoot}/armors.csv`)

            if (Helper.isNotEmpty(armorList)) {
                result.armors.all.final = armorList.length

                for (let item of armorList) {
                    if (Helper.isNotEmpty(item.rare)) {
                        let rare = `rare${item.rare}`

                        if (Helper.isEmpty(result.armors[rare])) {
                            console.log(item)
                        }

                        if (Helper.isEmpty(result.armors[rare].final)) {
                            result.armors[rare].final = 0
                        }

                        result.armors[rare].final += 1
                    }
                }
            }

            continue
        }

        if ('jewels' === target) {
            let jewelList = Helper.loadCSVAsJSON(`${convertRoot}/jewels.csv`)

            if (Helper.isNotEmpty(jewelList)) {
                result.jewels.all.final = jewelList.length

                for (let item of jewelList) {
                    if (Helper.isNotEmpty(item.size)) {
                        let size = `size${item.size}`

                        if (Helper.isEmpty(result.jewels[size].final)) {
                            result.jewels[size].final = 0
                        }

                        result.jewels[size].final += 1
                    }
                }
            }

            continue
        }

        let targetList = Helper.loadCSVAsJSON(`${convertRoot}/${target}.csv`)

        if (Helper.isNotEmpty(targetList)) {
            result[target].final = targetList.length
        }
    }

    // Load All Crawler Data
    for (let crawler of crawlerList) {
        console.log(`count:${crawler}`)

        for (let target of targetList) {
            console.log(`count:${crawler}:${target}`)

            if ('weapons' === target) {
                let weaponList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawler}/weapons.csv`)

                if (Helper.isNotEmpty(weaponList)) {
                    result.weapons.all[crawler] = weaponList.length

                    for (let item of weaponList) {
                        let weaponType = item.type

                        if (Helper.isEmpty(result.weapons[weaponType].all[crawler])) {
                            result.weapons[weaponType].all[crawler] = 0
                        }

                        result.weapons[weaponType].all[crawler] += 1

                        if (Helper.isNotEmpty(item.rare)) {
                            let rare = `rare${item.rare}`

                            if (Helper.isEmpty(result.weapons[weaponType][rare][crawler])) {
                                result.weapons[weaponType][rare][crawler] = 0
                            }

                            result.weapons[weaponType][rare][crawler] += 1
                        }
                    }

                    continue
                }

                for (let weaponType of weaponTypeList) {
                    let weaponList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawler}/weapons/${weaponType}.csv`)

                    if (Helper.isNotEmpty(weaponList)) {
                        if (Helper.isEmpty(result.weapons.all[crawler])) {
                            result.weapons.all[crawler] = 0
                        }

                        if (Helper.isEmpty(result.weapons[weaponType].all[crawler])) {
                            result.weapons[weaponType].all[crawler] = 0
                        }

                        result.weapons.all[crawler] += weaponList.length
                        result.weapons[weaponType].all[crawler] += weaponList.length

                        for (let item of weaponList) {
                            if (Helper.isNotEmpty(item.rare)) {
                                let rare = `rare${item.rare}`

                                if (Helper.isEmpty(result.weapons[weaponType][rare])) {
                                    console.log(item)
                                }

                                if (Helper.isEmpty(result.weapons[weaponType][rare][crawler])) {
                                    result.weapons[weaponType][rare][crawler] = 0
                                }

                                result.weapons[weaponType][rare][crawler] += 1
                            }
                        }
                    }
                }

                continue
            }

            if ('armors' === target) {
                let armorList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawler}/armors.csv`)

                if (Helper.isNotEmpty(armorList)) {
                    result.armors.all[crawler] = armorList.length

                    for (let item of armorList) {
                        if (Helper.isNotEmpty(item.rare)) {
                            let rare = `rare${item.rare}`

                            if (Helper.isEmpty(result.armors[rare])) {
                                console.log(item)
                            }

                            if (Helper.isEmpty(result.armors[rare][crawler])) {
                                result.armors[rare][crawler] = 0
                            }

                            result.armors[rare][crawler] += 1
                        }
                    }

                    continue
                }

                for (let rare of rareList) {
                    let armorList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawler}/armors/${rare}.csv`)

                    if (Helper.isNotEmpty(armorList)) {
                        if (Helper.isEmpty(result.armors.all[crawler])) {
                            result.armors.all[crawler] = 0
                        }

                        result.armors.all[crawler] += armorList.length
                        result.armors[rare][crawler] = armorList.length
                    }
                }

                continue
            }

            if ('jewels' === target) {
                let jewelList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawler}/jewels.csv`)

                if (Helper.isNotEmpty(jewelList)) {
                    result.jewels.all[crawler] = jewelList.length

                    for (let item of jewelList) {
                        if (Helper.isNotEmpty(item.size)) {
                            let size = `size${item.size}`

                            if (Helper.isEmpty(result.jewels[size][crawler])) {
                                result.jewels[size][crawler] = 0
                            }

                            result.jewels[size][crawler] += 1
                        }
                    }
                }

                continue
            }

            let targetList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawler}/${target}.csv`)

            if (Helper.isNotEmpty(targetList)) {
                result[target][crawler] = targetList.length
            }
        }
    }

    // Result
    for (let target of Object.keys(result)) {
        console.log(target, '=', result[target])
    }
}

export default {
    runAction,
    infoAction
}
