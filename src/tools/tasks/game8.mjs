/**
 * Game8 Crawler
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
    // defaultPetalaceItem,
    defaultDecorationItem,
    defaultSkillItem,
    defaultRampageDecorationItem,
    defaultRampageSkillItem,
    autoExtendListQuantity,
    normalizeText,
    weaponTypeList,
    rareList,
    sizeList
} from '../liberaries/mh.mjs'

const tempRoot = 'temp/crawler/game8'

const urls = {
    weapons: {
        greatSword: 'https://game8.jp/mhrise/369823',
        swordAndShield: 'https://game8.jp/mhrise/369825',
        dualBlades: 'https://game8.jp/mhrise/369826',
        longSword: 'https://game8.jp/mhrise/369824',
        hammer: 'https://game8.jp/mhrise/369827',
        huntingHorn: 'https://game8.jp/mhrise/369828',
        lance: 'https://game8.jp/mhrise/369829',
        gunlance: 'https://game8.jp/mhrise/369830',
        switchAxe: 'https://game8.jp/mhrise/369831',
        chargeBlade: 'https://game8.jp/mhrise/369832',
        insectGlaive: 'https://game8.jp/mhrise/369833',
        bow: 'https://game8.jp/mhrise/369836',
        heavyBowgun: 'https://game8.jp/mhrise/369835',
        lightBowgun: 'https://game8.jp/mhrise/369834'
    },
    armors: 'https://game8.jp/mhrise/363845',
    // charms: null,
    // petalaces: 'https://game8.jp/mhrise/364037',
    decorations: 'https://game8.jp/mhrise/363846',
    rampageSkills: 'https://game8.jp/mhrise/382391',
    skills: 'https://game8.jp/mhrise/363848'
}

export const fetchWeaponsAction = async (targetWeaponType = null) => {
    const runner = async (weaponType) => {
        let mapping = {}
        let mappingKey = null

        // Fetch List Page
        let fetchPageUrl = urls.weapons[weaponType]
        let fetchPageName = `weapons:${weaponType}`

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(listDom)) {
            console.trace(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        // Get Exists Header Ids
        let mhIds = []

        listDom('h3.a-header--3').each((index, node) => {
            let mhId = listDom(node).attr('id')

            if (Helper.isNotEmpty(mhId) && '' !== mhId) {
                mhIds.push(mhId)
            }
        })

        for (let mdId of mhIds) {
            console.log(listDom(`#${mdId}`).text())

            for (let itemIndex = 0; itemIndex < listDom(`#${mdId} + table tbody tr`).find('.a-link').length; itemIndex++) {
                let itemNode = listDom(`#${mdId} + table tbody tr`).find('.a-link').eq(itemIndex)

                let name = normalizeText(itemNode.text().trim())

                // Fetch Detail Page
                fetchPageUrl = itemNode.attr('href')
                fetchPageName = `weapons:${weaponType}:${name}`

                // Fix Path Url
                if (/^\/mhrise\d+$/.test(fetchPageUrl)) {
                    fetchPageUrl = fetchPageUrl.replace('/mhrise', '/mhrise/')
                }

                if (/^\/mhrise\/\d+$/.test(fetchPageUrl)) {
                    fetchPageUrl = `https://game8.jp${fetchPageUrl}`
                }

                console.log(fetchPageUrl, fetchPageName)

                let weaponDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

                if (Helper.isEmpty(weaponDom)) {
                    console.trace(fetchPageUrl, fetchPageName, 'Err')

                    mappingKey = name

                    if (Helper.isEmpty(mapping[mappingKey])) {
                        mapping[mappingKey] = Helper.deepCopy(defaultWeaponItem)
                    }

                    mapping[mappingKey].name = {
                        jaJP: name
                    }
                    mapping[mappingKey].type = weaponType

                    continue
                }

                let series = normalizeText(weaponDom('h3#hm_1').text().replace('の性能まとめ', ''))

                for (let subIndex = 0; subIndex < weaponDom('.a-table').length; subIndex++) {
                    let subNode = weaponDom('.a-table').eq(subIndex)

                    if ('レア度' !== subNode.find('tbody tr').eq(0).find('th').eq(0).text()) {
                        continue
                    }

                    let subName = normalizeText(subNode.find('b.a-bold').text())

                    if (name !== subName) {
                        continue
                    }

                    mappingKey = `${series}:${name}`

                    if (Helper.isEmpty(mapping[mappingKey])) {
                        mapping[mappingKey] = Helper.deepCopy(defaultWeaponItem)
                    }

                    let rare = subNode.find('tbody tr').eq(1).find('td').eq(0).text()
                    let attack = subNode.find('tbody tr').eq(1).find('td').eq(1).text()
                    let criticalRate = subNode.find('tbody tr').eq(1).find('td').eq(2).text()
                    let element = subNode.find('tbody tr').eq(3).find('td').eq(0).text().replace('\n', '')
                    let defense = subNode.find('tbody tr').eq(3).find('td').eq(2).text()

                    // Element
                    if ('--' !== element) {
                        let elements = []
                        let match = null

                        match = element.match(/^(.+?)\/(.+?)(\d+)\/(\d+)/)

                        if (Helper.isNotEmpty(match)) {
                            elements.push({
                                type: match[1],
                                value: match[3],
                                match: match
                            })

                            elements.push({
                                type: match[2],
                                value: match[4],
                                match: match
                            })
                        } else {
                            match = element.match(/^(.+?)((?:\-|\+)?\d+)/)

                            if (Helper.isNotEmpty(match)) {
                                elements.push({
                                    type: match[1],
                                    value: match[2],
                                    match: match
                                })
                            }
                        }


                        elements.forEach((element) => {
                            switch (element.type) {
                            case '火':
                                mapping[mappingKey].element.attack.type = 'fire'
                                mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

                                break
                            case '水':
                                mapping[mappingKey].element.attack.type = 'water'
                                mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

                                break
                            case '雷':
                                mapping[mappingKey].element.attack.type = 'thunder'
                                mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

                                break
                            case '氷':
                                mapping[mappingKey].element.attack.type = 'ice'
                                mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

                                break
                            case '龍':
                                mapping[mappingKey].element.attack.type = 'dragon'
                                mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

                                break
                            case '睡眠':
                                mapping[mappingKey].element.status.type = 'sleep'
                                mapping[mappingKey].element.status.minValue = parseFloat(element.value)

                                break
                            case '麻痹':
                            case '麻痺':
                                mapping[mappingKey].element.status.type = 'paralysis'
                                mapping[mappingKey].element.status.minValue = parseFloat(element.value)

                                break
                            case '爆破':
                                mapping[mappingKey].element.status.type = 'blast'
                                mapping[mappingKey].element.status.minValue = parseFloat(element.value)

                                break
                            case '毒':
                                mapping[mappingKey].element.status.type = 'poison'
                                mapping[mappingKey].element.status.minValue = parseFloat(element.value)

                                break
                            default:
                                console.log('no match property', match)

                                break
                            }
                        })
                    }

                    // Slot
                    subNode.find('tbody tr').eq(3).find('td').eq(1).text().split('').forEach((slotSize) => {
                        if ('④' === slotSize) {
                            mapping[mappingKey].slots.push({
                                size: 4
                            })
                        } else if ('③' === slotSize) {
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

                    // RampageSkills & RampageDecoration
                    for (let trIndex = 4; trIndex < subNode.find('tbody tr').length; trIndex++) {
                        let text = subNode.find('tbody tr').eq(trIndex).find('th').eq(0).text().trim()

                        switch (text) {
                        case '百竜スキル':
                            subNode.find('tbody tr').eq(trIndex).find('td').eq(0).find('a').each((index, node) => {
                                mapping[mappingKey].rampageSkill.list.push({
                                    name: normalizeText(weaponDom(node).text())
                                })
                            })

                            break
                        case '百竜スロット':
                            let slotSize = subNode.find('tbody tr').eq(trIndex).find('td').eq(0).text()

                            if ('④' === slotSize) {
                                mapping[mappingKey].rampageSlot = {
                                    size: 4
                                }
                            } else if ('③' === slotSize) {
                                mapping[mappingKey].rampageSlot = {
                                    size: 3
                                }
                            } else if ('②' === slotSize) {
                                mapping[mappingKey].rampageSlot = {
                                    size: 2
                                }
                            } else if ('①' === slotSize) {
                                mapping[mappingKey].rampageSlot = {
                                    size: 1
                                }
                            }

                            break
                        }
                    }

                    mapping[mappingKey].series = {
                        jaJP: series
                    }
                    mapping[mappingKey].name = {
                        jaJP: name
                    }
                    mapping[mappingKey].type = weaponType
                    mapping[mappingKey].rare = parseFloat(rare)
                    mapping[mappingKey].attack = parseFloat(attack)
                    mapping[mappingKey].defense = (
                        '' !== defense && '-' !== defense
                        && '−' !== defense && 0 !== parseFloat(defense)
                    ) ? parseFloat(normalizeText(defense)) : null
                    mapping[mappingKey].criticalRate = (
                        '' !== criticalRate && '-' !== criticalRate
                        && '−' !== criticalRate && 0 !== parseFloat(criticalRate)
                    ) ? parseFloat(normalizeText(criticalRate)) : null
                }
            }
        }

        let list = autoExtendListQuantity(Object.values(mapping))

        Helper.saveJSONAsCSV(`${tempRoot}/weapons/${weaponType}.csv`, list)
    }

    let tasks = []

    for (let weaponType of Object.keys(urls.weapons)) {
        if (Helper.isNotEmpty(targetWeaponType) && targetWeaponType !== weaponType) {
            continue
        }

        tasks.push(runner(weaponType))
    }

    return Promise.all(tasks).then(() => {
        // pass
    })
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
        console.trace(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    const specialReplaceName = (text) => {
        let specialWordMapping = {
            'スカルダ/スパイオS': 'スカルダS/スパイオS',
            'スカルダ/スパイオSテスタ': 'スカルダSテスタ/スパイオSテスタ',
            'スカルダ/スパイオSペット': 'スカルダSペット/スパイオSペット',
            'スカルダ/スパイオSマーノ': 'スカルダSマーノ/スパイオSマーノ',
            'スカルダ/スパイオSアンカ': 'スカルダSアンカ/スパイオSアンカ',
            'スカルダ/スパイオSガンバ': 'スカルダSガンバ/スパイオSガンバ',
        }

        if (Helper.isNotEmpty(specialWordMapping[text])) {
            text = specialWordMapping[text]
        }

        return text
    }

    for (let tableIndex = 1; tableIndex <= 3; tableIndex++) {
        for (let rowIndex = 0; rowIndex < listDom(`#hm_${tableIndex} + table tbody td`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody td`).eq(rowIndex)

            // Get Data
            let seriesList = normalizeText(specialReplaceName(rowNode.eq(0).find('a').text().trim())).split('/')

            for (let entry of Object.entries(seriesList)) {
                let seriesIndex = parseFloat(entry[0])
                let series = normalizeText(entry[1])
                let gender = 'general'

                if (2 === seriesList.length) {
                    if (0 === seriesIndex) {
                        gender = 'male'
                    }

                    if (1 === seriesIndex) {
                        gender = 'female'
                    }
                }

                // Fetch Detail Page
                fetchPageUrl = rowNode.eq(0).find('a').attr('href')
                fetchPageName = `armors:${series}`

                console.log(fetchPageUrl, fetchPageName)

                let armorDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

                if (Helper.isEmpty(armorDom)) {
                    console.trace(fetchPageUrl, fetchPageName, 'Err')

                    return
                }

                if (0 < armorDom('h3.a-header--3').length) {
                    for (let h3Index = 0; h3Index < armorDom('h3.a-header--3').length; h3Index++) {
                        let header = armorDom('h3.a-header--3').eq(h3Index).text().trim()
                        let hmId = armorDom('h3.a-header--3').eq(h3Index).attr('id')

                        if ('スキル・スロット' === header) {
                            for (let armorIndex = 1; armorIndex < armorDom(`#${hmId} + table tbody tr`).length; armorIndex++) {
                                let armorNode = armorDom(`#${hmId} + table tbody tr`).eq(armorIndex)

                                // Get Data
                                let name = normalizeText(specialReplaceName(armorNode.find('td').eq(0).text().trim()))

                                if (2 === seriesList.length) {
                                    name = name.split('/')[seriesIndex]
                                }

                                mappingKey = `${series}:${name}`

                                if (Helper.isEmpty(mapping[mappingKey])) {
                                    mapping[mappingKey] = Helper.deepCopy(defaultArmorItem)
                                }

                                mapping[mappingKey].series = {
                                    jaJP: series
                                }
                                mapping[mappingKey].name = {
                                    jaJP: name
                                }
                                mapping[mappingKey].gender = gender

                                armorNode.find('td').eq(1).find('a').each((index, node) => {
                                    let skillName = normalizeText(armorDom(node).text())
                                    let skillLevel = armorDom(node)[0].next.data.replace('Lv.', '')

                                    mapping[mappingKey].skills.push({
                                        name: skillName,
                                        level: parseFloat(skillLevel)
                                    })
                                })

                                // Slots
                                armorNode.find('td').eq(2).text().trim().split('').forEach((slotSize) => {
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
                        }

                        if ('防御力' === header) {
                            for (let armorIndex = 1; armorIndex < armorDom(`#${hmId} + table tbody tr`).length - 1; armorIndex++) {
                                let armorNode = armorDom(`#${hmId} + table tbody tr`).eq(armorIndex)

                                // Get Data
                                let type = armorNode.find('td').eq(0).find('.align').text().trim()
                                let name = normalizeText(specialReplaceName(armorNode.find('td').eq(0).find('.align')[0].next.data.trim()))
                                let minDefense = armorNode.find('td').eq(1).text().trim()
                                let maxDefense = (3 === armorNode.find('td').length)
                                    ? armorNode.find('td').eq(2).text().trim() : null

                                if (2 === seriesList.length) {
                                    name = name.split('/')[seriesIndex]
                                }

                                switch (type) {
                                case '頭':
                                    type = 'helm'

                                    break
                                case '胴':
                                    type = 'chest'

                                    break
                                case '腕':
                                    type = 'arm'

                                    break
                                case '腰':
                                    type = 'waist'

                                    break
                                case '脚':
                                    type = 'leg'

                                    break
                                }

                                mappingKey = `${series}:${name}`

                                if (Helper.isEmpty(mapping[mappingKey])) {
                                    mapping[mappingKey] = Helper.deepCopy(defaultArmorItem)
                                }

                                mapping[mappingKey].type = type
                                mapping[mappingKey].minDefense = parseFloat(minDefense)
                                mapping[mappingKey].maxDefense = Helper.isNotEmpty(maxDefense)
                                    ? parseFloat(maxDefense) : null
                            }
                        }

                        if ('属性耐性' === header) {
                            for (let armorIndex = 1; armorIndex < armorDom(`#${hmId} + table tbody tr`).length - 1; armorIndex++) {
                                let armorNode = armorDom(`#${hmId} + table tbody tr`).eq(armorIndex)

                                // Get Data
                                let type = armorNode.find('td').eq(0).find('.align').text().trim()
                                let name = normalizeText(specialReplaceName(armorNode.find('td').eq(0).find('.align')[0].next.data.trim()))
                                let resistanceFire = armorNode.find('td').eq(1).text().trim()
                                let resistanceWater = armorNode.find('td').eq(2).text().trim()
                                let resistanceThunder = armorNode.find('td').eq(3).text().trim()
                                let resistanceIce = armorNode.find('td').eq(4).text().trim()
                                let resistanceDragon = armorNode.find('td').eq(5).text().trim()

                                if (2 === seriesList.length) {
                                    name = name.split('/')[seriesIndex]
                                }

                                switch (type) {
                                case '頭':
                                    type = 'helm'

                                    break
                                case '胴':
                                    type = 'chest'

                                    break
                                case '腕':
                                    type = 'arm'

                                    break
                                case '腰':
                                    type = 'waist'

                                    break
                                case '脚':
                                    type = 'leg'

                                    break
                                }

                                mappingKey = `${series}:${name}`

                                if (Helper.isEmpty(mapping[mappingKey])) {
                                    mapping[mappingKey] = Helper.deepCopy(defaultArmorItem)
                                }

                                mapping[mappingKey].type = type
                                mapping[mappingKey].resistance.fire = parseFloat(resistanceFire)
                                mapping[mappingKey].resistance.water = parseFloat(resistanceWater)
                                mapping[mappingKey].resistance.thunder = parseFloat(resistanceThunder)
                                mapping[mappingKey].resistance.ice = parseFloat(resistanceIce)
                                mapping[mappingKey].resistance.dragon = parseFloat(resistanceDragon)
                            }
                        }
                    }
                } else {
                    for (let h2Index = 0; h2Index < armorDom('h2.a-header--2').length; h2Index++) {
                        let text = armorDom('h2.a-header--2').eq(h2Index).text().trim()

                        if (-1 !== text.indexOf('スキルとスロット')) {
                            let hmId = armorDom('h2.a-header--2').eq(h2Index).attr('id')

                            for (let trIndex = 1; trIndex < armorDom(`#${hmId} + table tbody tr`).length; trIndex++) {

                            }
                        }

                        if (-1 !== text.indexOf('ステータスと耐性')) {
                            let hmId = armorDom('h2.a-header--2').eq(h2Index).attr('id')

                            for (let trIndex = 1; trIndex < armorDom(`#${hmId} + table tbody tr`).length; trIndex++) {

                            }
                        }
                    }
                }
            }
        }
    }

    let list = autoExtendListQuantity(Object.values(mapping))

    Helper.saveJSONAsCSV(`${tempRoot}/armors.csv`, list)
}

export const fetchDecorationsAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.decorations
    fetchPageName = 'decorations'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.trace(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let tableIndex = 1; tableIndex <= 4; tableIndex++) {
        for (let rowIndex = 1; rowIndex < listDom(`#hm_${tableIndex} + table tbody tr`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody tr`).eq(rowIndex)

            // Get Data
            let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim())
            let skillName = normalizeText(rowNode.find('td').eq(1).text().trim())

            // Fetch Detail Page
            fetchPageUrl = rowNode.find('td').eq(0).find('a').attr('href')
            fetchPageName = `decorations:${name}`

            console.log(fetchPageUrl, fetchPageName)

            let decorationDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(decorationDom)) {
                console.trace(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            // Get Data
            let rare = decorationDom(`#hm_1 + table tbody tr`).eq(1).find('td').eq(0).text().trim()
            let size = decorationDom(`#hm_1 + table tbody tr`).eq(1).find('td').eq(1).text().trim()

            mappingKey = name

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultDecorationItem)
            }

            mapping[mappingKey].name = {
                jaJP: name
            }
            mapping[mappingKey].rare = parseFloat(rare)
            mapping[mappingKey].size = parseFloat(size)
            mapping[mappingKey].skills.push({
                name: skillName,
                level: 1
            })
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/decorations.csv`, Object.values(mapping))
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
        console.trace(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let tableIndex = 1; tableIndex <= 10; tableIndex++) {
        for (let rowIndex = 1; rowIndex < listDom(`#hm_${tableIndex} + table tbody tr`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody tr`).eq(rowIndex)

            if (Helper.isEmpty(rowNode.find('td').eq(0).find('a').attr('href'))) {
                continue
            }

            // Get Data
            let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim())
            let description = normalizeText(rowNode.find('td').eq(1).text().trim())

            // Fetch Detail Page
            fetchPageUrl = rowNode.find('td').eq(0).find('a').attr('href')
            fetchPageName = `skills:${name}`

            console.log(fetchPageUrl, fetchPageName)

            let skillDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(skillDom)) {
                console.trace(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            for (let skillIndex = 3; skillIndex < skillDom(`#hm_1 + table tbody tr`).length; skillIndex++) {
                let skillNode = skillDom(`#hm_1 + table tbody tr`).eq(skillIndex)

                // Get Data
                let level = skillNode.find('td').eq(0).text().trim()
                let effect = normalizeText(skillNode.find('td').eq(1).text().trim())

                mappingKey = `${name}:${level}`

                if (Helper.isEmpty(mapping[mappingKey])) {
                    mapping[mappingKey] = Helper.deepCopy(defaultSkillItem)
                }

                mapping[mappingKey].name = {
                    jaJP: name
                }
                mapping[mappingKey].description = {
                    jaJP: description
                }
                mapping[mappingKey].level = parseFloat(level)
                mapping[mappingKey].effect = {
                    jaJP: effect
                }
            }
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/skills.csv`, Object.values(mapping))
}

export const fetchRampageDecorationsAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.decorations
    fetchPageName = 'rampageDecorations'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.trace(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let tableIndex = 5; tableIndex <= 5; tableIndex++) {
        for (let rowIndex = 1; rowIndex < listDom(`#hm_${tableIndex} + table tbody tr`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody tr`).eq(rowIndex)

            // Get Data
            let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim())
            let skillName = normalizeText(rowNode.find('td').eq(1).text().trim())

            // Fetch Detail Page
            fetchPageUrl = rowNode.find('td').eq(0).find('a').attr('href')
            fetchPageName = `rampageDecorations:${name}`

            console.log(fetchPageUrl, fetchPageName)

            let decorationDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(decorationDom)) {
                console.trace(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            // Get Data
            let rare = decorationDom(`#hm_1 + table tbody tr`).eq(1).find('td').eq(0).text().trim()
            let size = decorationDom(`#hm_1 + table tbody tr`).eq(1).find('td').eq(1).text().trim()
            let skill = normalizeText(rowNode.find('td').eq(2).text().trim())

            mappingKey = name

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultRampageDecorationItem)
            }

            mapping[mappingKey].name = {
                jaJP: name
            }
            mapping[mappingKey].rare = parseFloat(rare)
            mapping[mappingKey].size = parseFloat(size)
            mapping[mappingKey].skill = skill
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/rampageDecorations.csv`, Object.values(mapping))
}

export const fetchRampageSkillsAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.rampageSkills
    fetchPageName = 'rampageSkills'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.trace(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let tableIndex = 1; tableIndex <= 14; tableIndex++) {
        for (let rowIndex = 1; rowIndex < listDom(`#hm_${tableIndex} + table tbody tr`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody tr`).eq(rowIndex)

            // Get Data
            let name = normalizeText(rowNode.find('td').eq(0).text().trim())
            let description = normalizeText(rowNode.find('td').eq(1).text().trim())

            mappingKey = name

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultRampageSkillItem)
            }

            mapping[mappingKey].name = {
                jaJP: name
            }
            mapping[mappingKey].description = {
                jaJP: description
            }
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/rampageSkills.csv`, Object.values(mapping))
}

export const infoAction = () => {

    // Generate Result Format
    let result = {
        weapons: {},
        armors: {},
        decorations: {},
        skills: {},
        rampageDecorations: {},
        rampageSkills: {}
    }

    result.weapons.all = 0
    result.armors.all = 0
    result.decorations.all = 0
    result.rampageDecorations.all = 0

    for (let weaponType of weaponTypeList) {
        result.weapons[weaponType] = {}
        result.weapons[weaponType].all = 0

        for (let rare of rareList) {
            result.weapons[weaponType][rare] = 0
        }
    }

    for (let rare of rareList) {
        result.armors[rare] = 0
    }

    for (let size of sizeList) {
        result.decorations[size] = 0
        result.rampageDecorations[size] = 0
    }

    // Weapons
    for (let weaponType of weaponTypeList) {
        let weaponList = Helper.loadCSVAsJSON(`${tempRoot}/weapons/${weaponType}.csv`)

        if (Helper.isNotEmpty(weaponList)) {
            result.weapons.all += weaponList.length
            result.weapons[weaponType].all += weaponList.length

            for (let item of weaponList) {
                if (Helper.isNotEmpty(item.rare)) {
                    result.weapons[weaponType][`rare${item.rare}`] += 1
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
                result.armors[`rare${item.rare}`] += 1
            }
        }
    }

    // Decorations & RampageDecorations
    for (let target of ['decorations', 'rampageDecorations']) {
        let targetList = Helper.loadCSVAsJSON(`${tempRoot}/${target}.csv`)

        if (Helper.isNotEmpty(targetList)) {
            result[target].all = targetList.length

            for (let item of targetList) {
                if (Helper.isNotEmpty(item.size)) {
                    result[target][`size${item.size}`] += 1
                }
            }
        }
    }

    // Skills & RampageDecorations
    for (let target of ['skills', 'rampageSkills']) {
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
        fetchDecorationsAction(),
        fetchSkillsAction(),
        fetchRampageDecorationsAction(),
        fetchRampageSkillsAction(),
    ]).then(() => {
        infoAction()
    })
}

export default {
    fetchAllAction,
    fetchWeaponsAction,
    fetchArmorsAction,
    fetchDecorationsAction,
    fetchSkillsAction,
    fetchRampageDecorationsAction,
    fetchRampageSkillsAction,
    infoAction
}
