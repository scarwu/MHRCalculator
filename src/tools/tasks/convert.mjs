/**
 * Convert Handler
 *
 * @package     Monster Hunter Rise - Calculator
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

const datasetRoot = '../assets/scripts/datasets'
const langRoot = '../assets/scripts/langs'

const targetList = [
    'weapons',
    'armors',
    'petalaces',
    'jewels',
    'enhances',
    'skills'
]

const langList = [
    'zhTW',
    'jaJP',
    'enUS'
]

const charPools = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
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

    // Load Unique Id Mapping
    let hashCodeMapping = Helper.loadJSON(`${convertRoot}/hashCodeMapping.json`)

    if (Helper.isEmpty(hashCodeMapping)) {
        hashCodeMapping = {}
    }

    // Init Used Code Maping By Unique Id Mapping
    let usedCodeMapping = {}

    Object.values(hashCodeMapping).forEach((code) => {
        usedCodeMapping[code] = true
    })

    const createCode = (text) => {
        if (Helper.isEmpty(text)) {
            return null
        }

        let hash = md5(text)

        if (Helper.isNotEmpty(hashCodeMapping[hash])) {
            return hashCodeMapping[hash]
        }

        let code = null

        while (true) {
            code = '_'

            for (let i = 0; i < charPools.length; i++) {
                code += charPools[rand() % charPools.length]
            }

            if (Helper.isEmpty(usedCodeMapping[code])) {
                hashCodeMapping[hash] = code
                usedCodeMapping[code] = true

                break
            }
        }

        return code
    }

    let datasetMapping = {}
    let datasetLangMapping = {}

    // Handle Skills
    let bundleSkills = []

    rawDataMapping.skills.forEach((skillItem) => {

    })

    // Handle Enhances
    rawDataMapping.enhances.forEach((enhanceItem) => {

    })

    // Handle Petalaces
    rawDataMapping.petalaces.forEach((petalaceItem) => {

    })

    // Handle Jewels
    rawDataMapping.jewels.forEach((jewelItem) => {

    })

    // Handle Armors
    let bundleArmors = []

    rawDataMapping.armors.forEach((armorItem) => {

    })

    // Handle Weapons
    rawDataMapping.weapons.forEach((skillItem) => {

    })

    // Save Datasets
    Object.keys(datasetMapping).forEach((target) => {
        Helper.saveJSON(`${datasetRoot}/${target}.json`, datasetMapping[target])
    })

    // Save Dataset Langs
    Object.keys(datasetLangMapping).forEach((lang) => {
        Helper.saveJSON(`${langRoot}/${lang}/dataset.json`, datasetLangMapping[lang])
    })

    // Save Unique Id Mapping
    Helper.saveJSON(`${convertRoot}/hashCodeMapping.json`, hashCodeMapping)
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

            if (Helper.isNotEmpty(weaponList)) {
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
    const crawlerList = [
        'gameqb', 'game8', 'kiranico', 'fextralife'
    ]

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
