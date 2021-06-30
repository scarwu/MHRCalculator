/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import md5 from 'md5'

import Helper from '../liberaries/helper.mjs'
import {
    weaponTypeList,
    rareList,
    sizeList,
    crawlerNameList
} from '../liberaries/mh.mjs'

const crawlerRoot = 'temp/crawler'
const combineRoot = 'temp/combine'

const mergeItem = (target, major, minot) => {
    switch (target) {
    case 'weapons':
        // Format: {
        //     series: null,
        //     name: null,
        //     rare: null,
        //     type: null,
        //     attack: null,
        //     criticalRate: null,
        //     defense: null,
        //     element: {
        //         attack: {
        //             type: null,
        //             minValue: null,
        //             maxValue: null
        //         },
        //         status: {
        //             type: null,
        //             minValue: null,
        //             maxValue: null
        //         }
        //     },
        //     sharpness: {
        //         red: null,
        //         orange: null,
        //         yellow: null,
        //         green: null,
        //         blue: null,
        //         white: null,
        //         purple: null
        //     },
        //     slots: [
        //         // {
        //         //     size: null
        //         // }
        //     ],
        //     enhances: [
        //         // {
        //         //     name: null
        //         // }
        //     ]
        // }

        return major
    case 'armors':
        // Format: {
        //     series: null,
        //     name: null,
        //     rare: null,
        //     type: null,
        //     gender: null,
        //     minDefense: null,
        //     maxDefense: null,
        //     resistence: {
        //         fire: null,
        //         water: null,
        //         thunder: null,
        //         ice: null,
        //         dragon: null
        //     },
        //     slots: [
        //         // {
        //         //     size: null
        //         // }
        //     ],
        //     skills: [
        //         // {
        //         //     name: null,
        //         //     level: null
        //         // }
        //     ]
        // }

        return major
    case 'jewels':
        // Format: {
        //     name: null,
        //     rare: null,
        //     size: null,
        //     skills: [
        //         // {
        //         //     name: null,
        //         //     level: null
        //         // }
        //     ]
        // }

        return major
    case 'petalaces':
        // Format: {
        //     name: null,
        //     rare: null,
        //     health: {
        //         increment: null,
        //         obtain: null
        //     },
        //     stamina: {
        //         increment: null,
        //         obtain: null
        //     },
        //     attack: {
        //         increment: null,
        //         obtain: null
        //     },
        //     defense: {
        //         increment: null,
        //         obtain: null
        //     }
        // }

        return major
    case 'enhances':
        // Format: {
        //     name: null,
        //     description: null
        // }

        return major
    case 'skills':
        // Format: {
        //     name: null,
        //     description: null,
        //     level: null,
        //     effect: null
        // }

        return major
    default:
        throw 'wrong target'
    }
}

function arrange() {
    let crawlerData = {
        weapons: {},
        armors: {},
        petalaces: {},
        jewels: {},
        enhances: {},
        skills: {}
    }

    Object.keys(crawlerData).forEach((target) => {
        crawlerNameList.forEach((crawlerName) => {
            crawlerData[target][crawlerName] = []
        })
    })

    // Load All Crawler Data
    for (let crawlerName of crawlerNameList) {
        console.log(`concat:${crawlerName}`)

        // Weapons
        console.log(`concat:${crawlerName}:weapons`)

        let weaponList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/weapons.csv`)

        if (Helper.isNotEmpty(weaponList)) {
            crawlerData.weapons[crawlerName] = weaponList
        } else {
            for (let weaponType of weaponTypeList) {
                let weaponList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/weapons/${weaponType}.csv`)

                if (Helper.isNotEmpty(weaponList)) {
                    crawlerData.weapons[crawlerName] = crawlerData.weapons[crawlerName].concat(weaponList)
                }
            }
        }

        // Armors
        console.log(`concat:${crawlerName}:armors`)

        let armorList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/armors.csv`)

        if (Helper.isNotEmpty(armorList)) {
            crawlerData.armors[crawlerName] = armorList
        } else {
            for (let rare of rareList) {
                let armorList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/armors/${rare}.csv`)

                if (Helper.isNotEmpty(armorList)) {
                    crawlerData.armors[crawlerName] = crawlerData.armors[crawlerName].concat(armorList)
                }
            }
        }

        // Others
        for (let target of ['petalaces', 'jewels', 'enhances', 'skills']) {
            console.log(`concat:${crawlerName}:${target}`)

            let targetList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/${target}.csv`)

            if (Helper.isNotEmpty(targetList)) {
                crawlerData[target][crawlerName] = targetList
            }
        }
    }

    // Combine Data
    let majorCrawler = 'kiranico'
    let minorCrawlers = ['gameqb', 'game8']
    let supportLang = {
        kiranico: ['zhTW', 'jaJP', 'enUS'],
        gameqb: ['zhTW'],
        game8: ['jaJP']
    }

    let hashIdMapping = {}
    let idMapping = {
        weapons: {},
        armors: {},
        petalaces: {},
        jewels: {},
        enhances: {},
        skills: {}
    }
    let noMacthDataMapping = {
        weapons: {},
        armors: {},
        petalaces: {},
        jewels: {},
        enhances: {},
        skills: {}
    }

    for (let target of Object.keys(idMapping)) {

        // Major Crawler Data Init
        console.log(`majorCrawler:${target}`)

        crawlerData[target][majorCrawler].forEach((item) => {
            let itemId = `${target}:id:${md5(item.name.zhTW)}` // Using zhTW as ID

            supportLang[majorCrawler].forEach((lang) => {
                hashIdMapping[`${target}:name:${lang}:${md5(item.name[lang])}`] = itemId
            })

            idMapping[target][itemId] = item
        })

        // Minor Crawler Data Merge
        minorCrawlers.forEach((minorCrawler) => {
            console.log(`majorCrawler:${target}:${minorCrawler}`)

            crawlerData[target][minorCrawler].forEach((item) => {

                // Create Self Hash
                item.hash = Helper.jsonHash(item)

                supportLang[minorCrawler].forEach((lang) => {
                    if (Helper.isEmpty(item.name[lang])) {
                        if (Helper.isEmpty(noMacthDataMapping[target][minorCrawler])) {
                            noMacthDataMapping[target][minorCrawler] = []
                        }

                        item.reason = `name is empty: ${lang}`

                        noMacthDataMapping[target][minorCrawler].push(item)

                        return
                    }

                    let hash = `${target}:name:${lang}:${md5(item.name[lang])}`

                    if (Helper.isEmpty(hashIdMapping[hash])) {
                        if (Helper.isEmpty(noMacthDataMapping[target][minorCrawler])) {
                            noMacthDataMapping[target][minorCrawler] = []
                        }

                        item.reason = `hash no match: ${hash}`

                        noMacthDataMapping[target][minorCrawler].push(item)

                        return
                    }

                    let itemId = hashIdMapping[hash]

                    let newItem = mergeItem(target, idMapping[target][itemId], item)

                    if (Helper.isEmpty(newItem)) {
                        if (Helper.isEmpty(noMacthDataMapping[target][minorCrawler])) {
                            noMacthDataMapping[target][minorCrawler] = []
                        }

                        item.reason = 'merge is fail'

                        noMacthDataMapping[target][minorCrawler].push(item)

                        return
                    }

                    idMapping[target][itemId] = newItem
                })
            })
        })
    }

    Object.keys(idMapping).forEach((target) => {
        Helper.saveJSONAsCSV(`${combineRoot}/result/${target}.csv`, Object.values(idMapping[target]))
    })

    Object.keys(noMacthDataMapping).forEach((target) => {
        Object.keys(noMacthDataMapping[target]).forEach((crawlerName) => {
            Helper.saveJSONAsCSV(`${combineRoot}/noMatch/${crawlerName}/${target}.csv`, Object.values(noMacthDataMapping[target][crawlerName]))
        })
    })
}

function statistics() {

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

    // Load All Crawler Data
    for (let crawlerName of crawlerNameList) {
        console.log(`count:${crawlerName}`)

        // Weapons
        console.log(`count:${crawlerName}:weapons`)

        let weaponList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/weapons.csv`)

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
                let weaponList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/weapons/${weaponType}.csv`)

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
        console.log(`count:${crawlerName}:armors`)

        let armorList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/armors.csv`)

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
                let armorList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/armors/${rare}.csv`)

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
        console.log(`count:${crawlerName}:jewels`)

        let jewelList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/jewels.csv`)

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
            console.log(`count:${crawlerName}:${target}`)

            let targetList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/${target}.csv`)

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
    arrange,
    statistics
}
