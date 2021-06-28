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

const crawlerRoot = 'temp/crawler/game8'

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
    enhances: 'https://game8.jp/mhrise/382391'
}

let fetchPageUrl = null
let fetchPageName = null

async function fetchArmors() {
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

    const replaceName = (text) => {
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

        return text.replace('デスタ', 'テスタ')
    }

    for (let tableIndex = 1; tableIndex <= 2; tableIndex++) {
        for (let rowIndex = 0; rowIndex < listDom(`#hm_${tableIndex} + table tbody td`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody td`).eq(rowIndex)

            // Get Data
            let serials = replaceName(rowNode.eq(0).find('a').text().trim()).split('/')

            for (let entry of Object.entries(serials)) {
                let serialIndex = parseInt(entry[0])
                let serial = entry[1]
                let gender = 'general'

                if (2 === serials.length) {
                    if (0 === serialIndex) {
                        gender = 'male'
                    }

                    if (1 === serialIndex) {
                        gender = 'female'
                    }
                }

                // Fetch Detail Page
                fetchPageUrl = rowNode.eq(0).find('a').attr('href')
                fetchPageName = serial

                console.log(fetchPageUrl, fetchPageName)

                let armorDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

                if (Helper.isEmpty(armorDom)) {
                    console.log(fetchPageUrl, fetchPageName, 'Err')

                    return
                }

                for (let h3Index = 0; h3Index < armorDom('h3.a-header--3').length; h3Index++) {
                    let header = armorDom('h3.a-header--3').eq(h3Index).text().trim()
                    let hmId = armorDom('h3.a-header--3').eq(h3Index).attr('id')

                    if ('スキル・スロット' === header) {
                        for (let armorIndex = 1; armorIndex < armorDom(`#${hmId} + table tbody tr`).length; armorIndex++) {
                            let armorNode = armorDom(`#${hmId} + table tbody tr`).eq(armorIndex)

                            // Get Data
                            let name = replaceName(armorNode.find('td').eq(0).text().trim())

                            if (2 === serials.length) {
                                name = name.split('/')[serialIndex]
                            }

                            mappingKey = `${serial}:${name}`

                            if (Helper.isEmpty(mapping[mappingKey])) {
                                mapping[mappingKey] = Helper.deepCopy(defaultArmor)
                            }

                            mapping[mappingKey].serial = serial
                            mapping[mappingKey].name = name
                            mapping[mappingKey].gender = gender

                            armorNode.find('td').eq(1).find('a').each((index, node) => {
                                let skillName = armorDom(node).text()
                                let skillLevel = armorDom(node)[0].next.data.replace('Lv.', '')

                                mapping[mappingKey].skills.push({
                                    name: skillName,
                                    level: parseInt(skillLevel, 10)
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
                            let name = replaceName(armorNode.find('td').eq(0).find('.align')[0].next.data.trim())
                            let minDefense = armorNode.find('td').eq(1).text().trim()
                            let maxDefense = (3 === armorNode.find('td').length)
                                ? armorNode.find('td').eq(2).text().trim() : null

                            if (2 === serials.length) {
                                name = name.split('/')[serialIndex]
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

                            mappingKey = `${serial}:${name}`

                            if (Helper.isEmpty(mapping[mappingKey])) {
                                mapping[mappingKey] = Helper.deepCopy(defaultArmor)
                            }

                            mapping[mappingKey].type = type
                            mapping[mappingKey].minDefense = parseInt(minDefense, 10)
                            mapping[mappingKey].maxDefense = Helper.isNotEmpty(maxDefense)
                                ? parseInt(maxDefense, 10) : null
                        }
                    }

                    if ('属性耐性' === header) {
                        for (let armorIndex = 1; armorIndex < armorDom(`#${hmId} + table tbody tr`).length - 1; armorIndex++) {
                            let armorNode = armorDom(`#${hmId} + table tbody tr`).eq(armorIndex)

                            // Get Data
                            let type = armorNode.find('td').eq(0).find('.align').text().trim()
                            let name = replaceName(armorNode.find('td').eq(0).find('.align')[0].next.data.trim())
                            let resistenceFire = armorNode.find('td').eq(1).text().trim()
                            let resistenceWater = armorNode.find('td').eq(2).text().trim()
                            let resistenceThunder = armorNode.find('td').eq(3).text().trim()
                            let resistenceIce = armorNode.find('td').eq(4).text().trim()
                            let resistenceDragon = armorNode.find('td').eq(5).text().trim()

                            if (2 === serials.length) {
                                name = name.split('/')[serialIndex]
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

                            mappingKey = `${serial}:${name}`

                            if (Helper.isEmpty(mapping[mappingKey])) {
                                mapping[mappingKey] = Helper.deepCopy(defaultArmor)
                            }

                            mapping[mappingKey].type = type
                            mapping[mappingKey].resistence.fire = parseInt(resistenceFire, 10)
                            mapping[mappingKey].resistence.water = parseInt(resistenceWater, 10)
                            mapping[mappingKey].resistence.thunder = parseInt(resistenceThunder, 10)
                            mapping[mappingKey].resistence.ice = parseInt(resistenceIce, 10)
                            mapping[mappingKey].resistence.dragon = parseInt(resistenceDragon, 10)
                        }
                    }
                }
            }
        }
    }

    Helper.saveJSONAsCSV(`${crawlerRoot}/armors.csv`, Object.values(mapping))
}

async function fetchJewels() {
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

    for (let tableIndex = 1; tableIndex <= 3; tableIndex++) {
        for (let rowIndex = 1; rowIndex < listDom(`#hm_${tableIndex} + table tbody tr`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody tr`).eq(rowIndex)

            // Get Data
            let name = rowNode.find('td').eq(0).find('a').text().trim()
            let skillName = rowNode.find('td').eq(1).text().trim()

            // Fetch Detail Page
            fetchPageUrl = rowNode.find('td').eq(0).find('a').attr('href')
            fetchPageName = rowNode.find('td').eq(0).find('a').text().trim()

            console.log(fetchPageUrl, fetchPageName)

            let jewelDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(jewelDom)) {
                console.log(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            // Get Data
            let rare = jewelDom(`#hm_1 + table tbody tr`).eq(1).find('td').eq(0).text().trim()
            let slotSize = jewelDom(`#hm_1 + table tbody tr`).eq(1).find('td').eq(1).text().trim()

            mappingKey = name

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultJewel)
            }

            mapping[mappingKey].name = name
            mapping[mappingKey].rare = rare
            mapping[mappingKey].slot.size = parseInt(slotSize, 10)
            mapping[mappingKey].skill.name = skillName
            mapping[mappingKey].skill.level = 1
        }
    }

    Helper.saveJSONAsCSV(`${crawlerRoot}/jewels.csv`, Object.values(mapping))
}

async function fetchSkills() {
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

    for (let tableIndex = 1; tableIndex <= 10; tableIndex++) {
        for (let rowIndex = 1; rowIndex < listDom(`#hm_${tableIndex} + table tbody tr`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody tr`).eq(rowIndex)

            // Get Data
            let name = rowNode.find('td').eq(0).find('a').text().trim()
            let description = rowNode.find('td').eq(1).text().trim()

            // Fetch Detail Page
            fetchPageUrl = rowNode.find('td').eq(0).find('a').attr('href')
            fetchPageName = rowNode.find('td').eq(0).find('a').text().trim()

            console.log(fetchPageUrl, fetchPageName)

            let skillDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(skillDom)) {
                console.log(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            for (let skillIndex = 3; skillIndex < skillDom(`#hm_1 + table tbody tr`).length; skillIndex++) {
                let skillNode = skillDom(`#hm_1 + table tbody tr`).eq(skillIndex)

                // Get Data
                let level = skillNode.find('td').eq(0).text().trim()
                let effect = skillNode.find('td').eq(1).text().trim()

                mappingKey = `${name}:${level}`

                if (Helper.isEmpty(mapping[mappingKey])) {
                    mapping[mappingKey] = Helper.deepCopy(defaultSkill)
                }

                mapping[mappingKey].name = name
                mapping[mappingKey].description = description
                mapping[mappingKey].level = parseInt(level, 10)
                mapping[mappingKey].effect = effect
            }
        }
    }

    Helper.saveJSONAsCSV(`${crawlerRoot}/skills.csv`, Object.values(mapping))
}

function fetchAll() {
    // fetchWeapons()
    fetchArmors()
    fetchJewels()
    fetchSkills()
    // fetchPetalaces()
}

export default {
    fetchAll,
    // fetchWeapons,
    fetchArmors,
    fetchJewels,
    fetchSkills,
    // fetchPetalaces
}
