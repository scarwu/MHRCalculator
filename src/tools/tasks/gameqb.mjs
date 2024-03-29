/**
 * GameQB Crawler
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from '../liberaries/helper.mjs'
import {
    defaultWeaponItem,
    defaultArmorItem,
    defaultPetalaceItem,
    defaultJewelItem,
    defaultEnhanceItem,
    defaultSkillItem,
    autoExtendListQuantity,
    normalizeText,
    guessArmorType,
    weaponTypeList,
    rareList,
    sizeList
} from '../liberaries/mh.mjs'

const tempRoot = 'temp/crawler/gameqb'

const urls = {
    weapons: { // 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/'
        greatSword: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e5%a4%a7%e5%8a%8d/',
        swordAndShield: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e5%96%ae%e6%89%8b%e5%8a%8d/',
        dualBlades: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e9%9b%99%e5%8a%8d/',
        longSword: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e5%a4%aa%e5%88%80/',
        hammer: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e5%a4%a7%e6%a7%8c/',
        huntingHorn: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e7%8b%a9%e7%8d%b5%e7%ac%9b/',
        lance: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e9%95%b7%e6%a7%8d/',
        gunlance: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e9%8a%83%e6%a7%8d/',
        switchAxe: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e6%96%ac%e6%93%8a%e6%96%a7/',
        chargeBlade: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e5%85%85%e8%83%bd%e6%96%a7/',
        insectGlaive: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e6%93%8d%e8%9f%b2%e6%a3%8d/',
        bow: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e5%bc%93/',
        heavyBowgun: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e9%87%8d%e5%bc%a9%e6%a7%8d/',
        lightBowgun: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e8%bc%95%e5%bc%a9/'
    },
    armors: 'https://mhr.gameqb.net/3748/',
    // charms: null,
    petalaces: 'https://mhr.gameqb.net/%e7%b5%90%e8%8a%b1%e7%92%b0/',
    jewels: 'https://mhr.gameqb.net/1839/',
    // enhances: null,
    skills: 'https://mhr.gameqb.net/1830/'
}

export const fetchWeaponsAction = async (targetWeaponType = null) => {
    let fetchPageUrl = null
    let fetchPageName = null

    for (let weaponType of Object.keys(urls.weapons)) {
        if (Helper.isNotEmpty(targetWeaponType) && targetWeaponType !== weaponType) {
            continue
        }

        let mapping = {}
        let mappingKey = null
        let enhanceMapping = {}
        let enhanceMappingKey = null

        // Fetch List Page
        fetchPageUrl = urls.weapons[weaponType]
        fetchPageName = `weapons:${weaponType}`

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(listDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let itemIndex = 0; itemIndex < listDom('.wp-block-table tbody tr').length; itemIndex++) {
            let itemNode = listDom('.wp-block-table tbody tr').eq(itemIndex)

            let series = normalizeText(itemNode.find('td').eq(0).text())
            let name = normalizeText(itemNode.find('td').eq(1).text())

            mappingKey = `${series}:${name}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultWeaponItem)
            }

            mapping[mappingKey].series = {
                zhTW: series
            }
            mapping[mappingKey].name = {
                zhTW: name
            }
            mapping[mappingKey].type = weaponType

            itemNode.find('td').eq(2).html().split('<br>').forEach((property) => {
                if ('' === property) {
                    return
                }

                property = property.replace(':', '').replace('%', '')

                let match = property.match(/^(.+?)((?:\-|\+)?\d+)/)

                if (Helper.isEmpty(match)) {
                    return
                }

                switch (match[1]) {
                case '攻擊力':
                    mapping[mappingKey].attack = parseFloat(match[2])

                    break
                case '防御':
                case '防禦力':
                    mapping[mappingKey].defense = parseFloat(match[2])

                    break
                case '會心':
                    mapping[mappingKey].criticalRate = parseFloat(match[2])

                    break
                case '火':
                    mapping[mappingKey].element.attack.type = 'fire'
                    mapping[mappingKey].element.attack.minValue = parseFloat(match[2])

                    break
                case '水':
                    mapping[mappingKey].element.attack.type = 'water'
                    mapping[mappingKey].element.attack.minValue = parseFloat(match[2])

                    break
                case '雷':
                    mapping[mappingKey].element.attack.type = 'thunder'
                    mapping[mappingKey].element.attack.minValue = parseFloat(match[2])

                    break
                case '冰':
                    mapping[mappingKey].element.attack.type = 'ice'
                    mapping[mappingKey].element.attack.minValue = parseFloat(match[2])

                    break
                case '龍':
                    mapping[mappingKey].element.attack.type = 'dragon'
                    mapping[mappingKey].element.attack.minValue = parseFloat(match[2])

                    break
                case '睡眠':
                    mapping[mappingKey].element.status.type = 'sleep'
                    mapping[mappingKey].element.status.minValue = parseFloat(match[2])

                    break
                case '麻痹':
                case '麻痺':
                    mapping[mappingKey].element.status.type = 'paralysis'
                    mapping[mappingKey].element.status.minValue = parseFloat(match[2])

                    break
                case '爆破':
                    mapping[mappingKey].element.status.type = 'blast'
                    mapping[mappingKey].element.status.minValue = parseFloat(match[2])

                    break
                case '毒':
                    mapping[mappingKey].element.status.type = 'poison'
                    mapping[mappingKey].element.status.minValue = parseFloat(match[2])

                    break
                default:
                    console.log('no match property', match)

                    break
                }
            })

            if ('—' !== itemNode.find('td').eq(3).text().trim()) {
                itemNode.find('td').eq(3).text().trim().split('').forEach((slotSize, slotIndex) => {
                    if ('③' === slotSize) {
                        mapping[mappingKey].slots.push({
                            size: 3
                        })
                    } else if ('②' === slotSize) {
                        mapping[mappingKey].slots.push({
                            size: 2
                        })
                    } else if ('①' === slotSize) {
                        mapping[mappingKey].slots.push({
                            size: 1
                        })
                    }
                })
            }

            // if ('bow' !== weaponType
            //     && 'lightBowgun' !== weaponType
            //     && 'heavyBowgun' !== weaponType
            // ) {
            //     let sharpnessMapping = {
            //         '.kr0': 'red',
            //         '.kr1': 'orange',
            //         '.kr2': 'yellow',
            //         '.kr3': 'green',
            //         '.kr4': 'blue',
            //         '.kr5': 'white',
            //         '.kr6': 'purple'
            //     }

            //     for (let kr of Object.keys(sharpnessMapping)) {
            //         if (0 === itemNode.find('td').eq(4).find(kr).length) {
            //             break
            //         }

            //         if (Helper.isEmpty(mapping[mappingKey].sharpness.value)) {
            //             mapping[mappingKey].sharpness.value = 0
            //         }

            //         if (Helper.isEmpty(mapping[mappingKey].sharpness.steps[sharpnessMapping[kr]])) {
            //             mapping[mappingKey].sharpness.steps[sharpnessMapping[kr]] = 0
            //         }

            //         let krIndex = itemNode.find('td').eq(4).find(kr).length - 1

            //         itemNode.find('td').eq(4).find(kr).eq(krIndex).text().split('').forEach((step) => {
            //             let value = 0

            //             if ('…' === step) {
            //                 value = 30
            //             }

            //             if ('.' === step) {
            //                 value = 10
            //             }

            //             mapping[mappingKey].sharpness.value += value
            //             mapping[mappingKey].sharpness.steps[sharpnessMapping[kr]] += value
            //         })
            //     }

            //     mapping[mappingKey].sharpness.value -= 50
            // }

            // Fetch Detail Page
            fetchPageUrl = itemNode.find('td').eq(1).find('a').attr('href')
            fetchPageName = `weapon:${weaponType}:${name}`

            if (Helper.isNotEmpty(fetchPageUrl)) {
                console.log(fetchPageUrl, fetchPageName)

                let itemDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

                if (Helper.isEmpty(itemDom)) {
                    console.log(fetchPageUrl, fetchPageName, 'Err')

                    continue
                }

                // Performace
                let performaceTableIndex = 0

                if ('chargeBlade' === weaponType
                    || 'switchAxe' === weaponType
                ) {
                    performaceTableIndex = 1
                }

                for (let itemIndex = 0; itemIndex < itemDom('.wp-block-table').eq(performaceTableIndex).find('tbody tr').length; itemIndex++) {
                    let rowNode = itemDom('.wp-block-table').eq(performaceTableIndex).find('tbody tr').eq(itemIndex)

                    let subName = normalizeText(rowNode.find('td').eq(0).text().trim())

                    if (name !== subName) {
                        continue
                    }

                    // Enhance
                    for (let enhanceIndex = 0; enhanceIndex < rowNode.find('td').eq(3).find('a').length; enhanceIndex++) {
                        let enhanceNode = rowNode.find('td').eq(3).find('a').eq(enhanceIndex)

                        let enhanceName = normalizeText(enhanceNode.text())

                        mapping[mappingKey].enhance.list.push({
                            name: enhanceName
                        })

                        if (Helper.isEmpty(targetWeaponType)) {
                            enhanceMappingKey = enhanceName

                            if (Helper.isEmpty(enhanceMapping[enhanceMappingKey])) {
                                enhanceMapping[enhanceMappingKey] = Helper.deepCopy(defaultEnhanceItem)
                            }

                            enhanceMapping[enhanceMappingKey].name = {
                                zhTW: enhanceName
                            }

                            // Fetch Enhance Page
                            fetchPageUrl = enhanceNode.attr('href')
                            fetchPageName = `enhances:${enhanceName}`

                            if (Helper.isNotEmpty(fetchPageUrl)) {
                                console.log(fetchPageUrl, fetchPageName)

                                let enhanceDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

                                if (Helper.isNotEmpty(enhanceDom)) {
                                    enhanceMapping[enhanceMappingKey].description = normalizeText(enhanceDom('p').eq(0).text())
                                } else {
                                    console.log(fetchPageUrl, fetchPageName, 'Err')
                                }
                            }
                        }
                    }

                    if ('bow' !== weaponType
                        && 'lightBowgun' !== weaponType
                        && 'heavyBowgun' !== weaponType
                    ) {
                        let sharpnessMapping = {
                            '.kr0': 'red',
                            '.kr1': 'orange',
                            '.kr2': 'yellow',
                            '.kr3': 'green',
                            '.kr4': 'blue',
                            '.kr5': 'white',
                            '.kr6': 'purple'
                        }

                        let sharpnessRows = rowNode.find('td').eq(4).html().replace(/\<br\>$/, '').split('<br>')
                        let sharpnessNode = null

                        // minimum
                        sharpnessNode = itemDom('<div>' + sharpnessRows[0] + '</div>')

                        for (let kr of Object.keys(sharpnessMapping)) {
                            if ('' === sharpnessNode.find(kr).text()) {
                                break
                            }

                            if (Helper.isEmpty(mapping[mappingKey].sharpness.minValue)) {
                                mapping[mappingKey].sharpness.minValue = 0
                            }

                            sharpnessNode.find(kr).text().split('').forEach((step) => {
                                let value = 0

                                if ('…' === step) {
                                    value = 30
                                }

                                if ('.' === step) {
                                    value = 10
                                }

                                mapping[mappingKey].sharpness.minValue += value
                            })
                        }

                        // maximum
                        sharpnessNode = itemDom('<div>' + sharpnessRows[sharpnessRows.length - 1] + '</div>')

                        for (let kr of Object.keys(sharpnessMapping)) {
                            if ('' === sharpnessNode.find(kr).text()) {
                                break
                            }

                            if (Helper.isEmpty(mapping[mappingKey].sharpness.maxValue)) {
                                mapping[mappingKey].sharpness.maxValue = 0
                            }

                            if (Helper.isEmpty(mapping[mappingKey].sharpness.steps[sharpnessMapping[kr]])) {
                                mapping[mappingKey].sharpness.steps[sharpnessMapping[kr]] = 0
                            }

                            sharpnessNode.find(kr).text().split('').forEach((step) => {
                                let value = 0

                                if ('…' === step) {
                                    value = 30
                                }

                                if ('.' === step) {
                                    value = 10
                                }

                                mapping[mappingKey].sharpness.maxValue += value
                                mapping[mappingKey].sharpness.steps[sharpnessMapping[kr]] += value
                            })
                        }
                    }
                }

                // Rare
                let rareTableIndex = 1

                if ('huntingHorn' === weaponType
                    || 'chargeBlade' === weaponType
                    || 'switchAxe' === weaponType
                ) {
                    rareTableIndex = 2
                }

                if ('lightBowgun' === weaponType
                    || 'heavyBowgun' === weaponType
                ) {
                    rareTableIndex = itemDom('.wp-block-table').eq(0).find('tbody tr').length + 1
                }

                itemDom('.wp-block-table').eq(rareTableIndex).find('tbody tr').each((index, node) => {
                    let subName = normalizeText(itemDom(node).find('td').eq(1).text().trim())

                    if (name !== subName) {
                        return
                    }

                    let rare = itemDom(node).find('td').eq(0).text()

                    mapping[mappingKey].rare = parseFloat(rare)
                })
            }
        }

        let list = autoExtendListQuantity(Object.values(mapping))

        Helper.saveJSONAsCSV(`${tempRoot}/weapons/${weaponType}.csv`, list)

        if (Helper.isEmpty(targetWeaponType)) {
            let enhanceList = autoExtendListQuantity(Object.values(enhanceMapping))

            Helper.saveJSONAsCSV(`${tempRoot}/enhances.csv`, enhanceList)
        }
    }
}

export const fetchArmorsAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.armors
    fetchPageName = 'armors'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.log(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let itemIndex = 0; itemIndex < listDom('.entry-content a').length; itemIndex++) {
        let itemNode = listDom('.entry-content a').eq(itemIndex)

        // Fetch Detail Page
        fetchPageUrl = itemNode.attr('href')
        fetchPageName = `armors:${itemNode.text()}`

        console.log(fetchPageUrl, fetchPageName)

        let itemDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(itemDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            continue
        }

        let tempNode = null

        // Title
        let series = normalizeText(itemDom('.post-title-single').text().trim())

        // Table 1
        tempNode = itemDom('.wp-block-table .has-fixed-layout').eq(0).find('tbody tr')

        let rare = tempNode.eq(0).find('td').eq(0).text().trim()
        let gender = tempNode.eq(0).find('td').eq(1).text().trim()

        if ('男女共用' === gender) {
            gender = 'general'
        } else if ('女性専用' === gender) {
            gender = 'female'
        } else if ('男性専用' === gender) {
            gender = 'male'
        } else {
            gender = null
        }

        // Table 2
        tempNode = itemDom('.wp-block-table .has-fixed-layout').eq(1).find('tbody tr')
        tempNode.each((index, node) => {
            let name = normalizeText(itemDom(node).find('td').eq(0).text().trim())

            if ('合計' === name) {
                return
            }

            mappingKey = `${series}:${name}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultArmorItem)
            }

            let defense = itemDom(node).find('td').eq(1).text().trim()
            let resistanceFire = itemDom(node).find('td').eq(2).text().trim()
            let resistanceWater = itemDom(node).find('td').eq(3).text().trim()
            let resistanceThunder = itemDom(node).find('td').eq(4).text().trim()
            let resistanceIce = itemDom(node).find('td').eq(5).text().trim()
            let resistanceDragon = itemDom(node).find('td').eq(6).text().trim()
            let type = guessArmorType(name)

            mapping[mappingKey].series = {
                zhTW: series
            }
            mapping[mappingKey].name = {
                zhTW: name
            }
            mapping[mappingKey].rare = parseFloat(rare)
            mapping[mappingKey].type = type
            mapping[mappingKey].gender = gender
            mapping[mappingKey].minDefense = parseFloat(defense)
            mapping[mappingKey].maxDefense = null
            mapping[mappingKey].resistance.fire = parseFloat(resistanceFire)
            mapping[mappingKey].resistance.water = parseFloat(resistanceWater)
            mapping[mappingKey].resistance.thunder = parseFloat(resistanceThunder)
            mapping[mappingKey].resistance.ice = parseFloat(resistanceIce)
            mapping[mappingKey].resistance.dragon = parseFloat(resistanceDragon)
        })

        // Table 3
        tempNode = itemDom('.wp-block-table .has-fixed-layout').eq(2).find('tbody tr')
        tempNode.each((index, node) => {
            let name = normalizeText(itemDom(node).find('td').eq(0).text().trim())

            if ('合計' === name) {
                return
            }

            mappingKey = `${series}:${name}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultArmorItem)
            }

            if ('-' !== itemDom(node).find('td').eq(1).text().trim()) {
                itemDom(node).find('td').eq(1).text().trim().split('').forEach((slotSize, slotIndex) => {
                    if ('③' === slotSize) {
                        mapping[mappingKey].slots.push({
                            size: 3
                        })
                    } else if ('②' === slotSize) {
                        mapping[mappingKey].slots.push({
                            size: 2
                        })
                    } else if ('①' === slotSize) {
                        mapping[mappingKey].slots.push({
                            size: 1
                        })
                    }
                })
            }

            itemDom(node).find('td').eq(2).find('a').each((index, node) => {
                let skillName = normalizeText(itemDom(node).text())
                let skillLevel = itemDom(node)[0].next.data.replace('+', '')

                mapping[mappingKey].skills.push({
                    name: skillName,
                    level: parseFloat(skillLevel)
                })
            })
        })
    }

    let list = autoExtendListQuantity(Object.values(mapping))

    Helper.saveJSONAsCSV(`${tempRoot}/armors.csv`, list)
}

export const fetchPetalacesAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.petalaces
    fetchPageName = 'petalaces'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.log(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let itemIndex = 0; itemIndex < listDom('.has-fixed-layout tbody tr').length; itemIndex++) {
        let itemNode = listDom('.has-fixed-layout tbody tr').eq(itemIndex).find('td').eq(0).find('a').eq(0)

        let name = null
        let rare = null
        let healthIncrement = null
        let healthObtain = null
        let staminaIncrement = null
        let staminaObtain = null
        let attackIncrement = null
        let attackObtain = null
        let defenseIncrement = null
        let defenseObtain = null

        // Fetch Detail Page
        let hasDetailPage = false

        fetchPageUrl = itemNode.attr('href')
        fetchPageName = `petalaces:${itemNode.text().trim()}`

        if (Helper.isNotEmpty(fetchPageUrl)) {
            console.log(fetchPageUrl, fetchPageName)

            let itemDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isNotEmpty(itemDom)) {

                name = normalizeText(itemDom('.post-title-single').text().trim())
                rare = itemDom('.wp-block-table tbody tr').eq(0).find('td').eq(1).text().trim()
                healthIncrement = itemDom('.wp-block-table tbody tr').eq(1).find('td').eq(1).text().trim()
                healthObtain = itemDom('.wp-block-table tbody tr').eq(2).find('td').eq(1).text().trim()
                staminaIncrement = itemDom('.wp-block-table tbody tr').eq(3).find('td').eq(1).text().trim()
                staminaObtain = itemDom('.wp-block-table tbody tr').eq(4).find('td').eq(1).text().trim()
                attackIncrement = itemDom('.wp-block-table tbody tr').eq(5).find('td').eq(1).text().trim()
                attackObtain = itemDom('.wp-block-table tbody tr').eq(6).find('td').eq(1).text().trim()
                defenseIncrement = itemDom('.wp-block-table tbody tr').eq(7).find('td').eq(1).text().trim()
                defenseObtain = itemDom('.wp-block-table tbody tr').eq(8).find('td').eq(1).text().trim()

                hasDetailPage = true
            } else {
                console.log(fetchPageUrl, fetchPageName, 'Err')
            }
        }

        if (false === hasDetailPage) {
            itemNode = listDom('.has-fixed-layout tbody tr').eq(itemIndex).find('td')

            name = normalizeText(itemNode.eq(0).text().trim())
            rare = null
            healthIncrement = itemNode.eq(2).text().trim().split('/')[0]
            healthObtain = itemNode.eq(2).text().trim().split('/')[1]
            staminaIncrement = itemNode.eq(3).text().trim().split('/')[0]
            staminaObtain = itemNode.eq(3).text().trim().split('/')[1]
            attackIncrement = itemNode.eq(4).text().trim().split('/')[0]
            attackObtain = itemNode.eq(4).text().trim().split('/')[1]
            defenseIncrement = itemNode.eq(5).text().trim().split('/')[0]
            defenseObtain = itemNode.eq(5).text().trim().split('/')[1]

            console.log('no page', name)
        }

        mappingKey = name

        if (Helper.isEmpty(mapping[mappingKey])) {
            mapping[mappingKey] = Helper.deepCopy(defaultPetalaceItem)
        }

        mapping[mappingKey].name = {
            zhTW: name
        }
        mapping[mappingKey].rare = Helper.isNotEmpty(rare) ? parseFloat(rare) : null
        mapping[mappingKey].health.increment = parseFloat(healthIncrement)
        mapping[mappingKey].health.obtain = parseFloat(healthObtain)
        mapping[mappingKey].stamina.increment = parseFloat(staminaIncrement)
        mapping[mappingKey].stamina.obtain = parseFloat(staminaObtain)
        mapping[mappingKey].attack.increment = parseFloat(attackIncrement)
        mapping[mappingKey].attack.obtain = parseFloat(attackObtain)
        mapping[mappingKey].defense.increment = parseFloat(defenseIncrement)
        mapping[mappingKey].defense.obtain = parseFloat(defenseObtain)
    }

    Helper.saveJSONAsCSV(`${tempRoot}/petalaces.csv`, Object.values(mapping))
}

export const fetchJewelsAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.jewels
    fetchPageName = 'jewels'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.log(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let itemIndex = 0; itemIndex < listDom('.has-fixed-layout tbody tr').length; itemIndex++) {
        let itemNode = listDom('.has-fixed-layout tbody tr').eq(itemIndex).find('td').eq(0).find('a').eq(0)

        let name = null
        let size = null
        let skillName = null

        // Fetch Detail Page
        let hasDetailPage = false

        fetchPageUrl = itemNode.attr('href')
        fetchPageName = `jewels:${itemNode.text().trim()}`

        if (Helper.isNotEmpty(fetchPageUrl)) {
            console.log(fetchPageUrl, fetchPageName)

            let itemDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isNotEmpty(itemDom)) {
                name = normalizeText(itemDom('.has-fixed-layout tbody tr').eq(0).find('td').eq(1).text().trim())
                size = itemDom('.has-fixed-layout tbody tr').eq(1).find('td').eq(1).text().trim()
                skillName = normalizeText(itemDom('.has-fixed-layout tbody tr').eq(2).find('td').eq(1).text().trim())

                hasDetailPage = true
            } else {
                console.log(fetchPageUrl, fetchPageName, 'Err')
            }
        }

        if (false === hasDetailPage) {
            itemNode = listDom('.has-fixed-layout tbody tr').eq(itemIndex).find('td')

            name = normalizeText(itemNode.eq(0).text().trim())
            size = itemNode.eq(1).text().trim()
            skillName = normalizeText(itemNode.eq(2).text().trim())

            console.log('no page', name)
        }

        mappingKey = name

        if (Helper.isEmpty(mapping[mappingKey])) {
            mapping[mappingKey] = Helper.deepCopy(defaultJewelItem)
        }

        mapping[mappingKey].name = {
            zhTW: name
        }
        mapping[mappingKey].rare = null
        mapping[mappingKey].size = parseFloat(size)
        mapping[mappingKey].skills.push({
            name: skillName,
            level: 1
        })
    }

    Helper.saveJSONAsCSV(`${tempRoot}/jewels.csv`, Object.values(mapping))
}

export const fetchSkillsAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.skills
    fetchPageName = 'skills'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.log(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let itemIndex = 0; itemIndex < listDom('.has-fixed-layout tbody tr').length; itemIndex++) {
        let itemNode = listDom('.has-fixed-layout tbody tr').eq(itemIndex).find('td').eq(0).find('a').eq(0)

        // Fetch Detail Page
        fetchPageUrl = itemNode.attr('href')
        fetchPageName = `skills:${itemNode.text().trim()}`

        console.log(fetchPageUrl, fetchPageName)

        let itemDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(itemDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            continue
        }

        let name = normalizeText(itemDom('.post-title-single').text().trim())
        let description = normalizeText(itemDom('.entry-content p').text().trim())

        // Table 1
        let tempNode = itemDom('.wp-block-table .has-fixed-layout').eq(0).find('tbody tr')

        tempNode.each((index, node) => {
            let level = itemDom(node).find('td').eq(0).text().trim()
            let effect = normalizeText(itemDom(node).find('td').eq(1).text().trim())

            mappingKey = `${name}:${level}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultSkillItem)
            }

            mapping[mappingKey].name = {
                zhTW: name
            }
            mapping[mappingKey].description = {
                zhTW: description
            }
            mapping[mappingKey].level = parseFloat(level)
            mapping[mappingKey].effect = {
                zhTW: effect
            }
        })
    }

    Helper.saveJSONAsCSV(`${tempRoot}/skills.csv`, Object.values(mapping))
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

    result.weapons.all = null
    result.armors.all = null
    result.jewels.all = null

    for (let weaponType of weaponTypeList) {
        result.weapons[weaponType] = {}
        result.weapons[weaponType].all = null

        for (let rare of rareList) {
            result.weapons[weaponType][rare] = null
        }
    }

    for (let rare of rareList) {
        result.armors[rare] = null
    }

    for (let size of sizeList) {
        result.jewels[size] = null
    }

    // Weapons
    for (let weaponType of weaponTypeList) {
        let weaponList = Helper.loadCSVAsJSON(`${tempRoot}/weapons/${weaponType}.csv`)

        if (Helper.isNotEmpty(weaponList)) {
            if (Helper.isEmpty(result.weapons.all)) {
                result.weapons.all = 0
            }

            if (Helper.isEmpty(result.weapons[weaponType].all)) {
                result.weapons[weaponType].all = 0
            }

            result.weapons.all += weaponList.length
            result.weapons[weaponType].all += weaponList.length

            for (let item of weaponList) {
                if (Helper.isNotEmpty(item.rare)) {
                    let rare = `rare${item.rare}`

                    if (Helper.isEmpty(result.weapons[weaponType][rare])) {
                        result.weapons[weaponType][rare] = 0
                    }

                    result.weapons[weaponType][rare] += 1
                }
            }
        }
    }

    // Armors
    let armorList = Helper.loadCSVAsJSON(`${tempRoot}/armors.csv`)

    if (Helper.isNotEmpty(armorList)) {
        result.armors.all = armorList.length

        for (let item of armorList) {
            if (Helper.isNotEmpty(item.rare)) {
                let rare = `rare${item.rare}`

                if (Helper.isEmpty(result.armors[rare])) {
                    result.armors[rare] = 0
                }

                result.armors[rare] += 1
            }
        }
    }

    // Jewels
    let jewelList = Helper.loadCSVAsJSON(`${tempRoot}/jewels.csv`)

    if (Helper.isNotEmpty(jewelList)) {
        result.jewels.all = jewelList.length

        for (let item of jewelList) {
            if (Helper.isNotEmpty(item.size)) {
                let size = `size${item.size}`

                if (Helper.isEmpty(result.jewels[size])) {
                    result.jewels[size] = 0
                }

                result.jewels[size] += 1
            }
        }
    }

    // Petalaces, Enhances & Skills
    for (let target of ['petalaces', 'enhances', 'skills']) {
        let targetList = Helper.loadCSVAsJSON(`${tempRoot}/${target}.csv`)

        if (Helper.isNotEmpty(targetList)) {
            result[target] = targetList.length
        }
    }

    // Result
    console.log(result)
}

export const fetchAllAction = () => {
    Promise.all([
        fetchWeaponsAction(),
        fetchArmorsAction(),
        fetchPetalacesAction(),
        fetchJewelsAction(),
        fetchSkillsAction()
    ]).then(() => {
        infoAction()
    })
}

export default {
    fetchAllAction,
    fetchWeaponsAction,
    fetchArmorsAction,
    fetchPetalacesAction,
    fetchJewelsAction,
    fetchSkillsAction,
    infoAction
}
