/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from '../helper.mjs'

const urls = {
    weapons: { // 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/'
        bow: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e5%bc%93/',
        chargeBlade: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e5%85%85%e8%83%bd%e6%96%a7/',
        dualBlades: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e9%9b%99%e5%8a%8d/',
        greatSword: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e5%a4%a7%e5%8a%8d/',
        gunlance: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e9%8a%83%e6%a7%8d/',
        hammer: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e5%a4%a7%e6%a7%8c/',
        heavyBowgun: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e9%87%8d%e5%bc%a9%e6%a7%8d/',
        huntingHorn: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e7%8b%a9%e7%8d%b5%e7%ac%9b/',
        insectGlaive: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e6%93%8d%e8%9f%b2%e6%a3%8d/',
        lance: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e9%95%b7%e6%a7%8d/',
        lightBowgun: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e8%bc%95%e5%bc%a9/',
        longSword: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e5%a4%aa%e5%88%80/',
        switchAxe: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e6%96%ac%e6%93%8a%e6%96%a7/',
        swordAndShield: 'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/%e5%96%ae%e6%89%8b%e5%8a%8d/',
    },
    armors: 'https://mhr.gameqb.net/3748/',
    skills: 'https://mhr.gameqb.net/1830/',
    sets: null,
    jewels: 'https://mhr.gameqb.net/1839/',
    charms: null,
    petalaces: 'https://mhr.gameqb.net/%e7%b5%90%e8%8a%b1%e7%92%b0/',
    enhances: null,
}

const defaultWeapon = {
    serial: null,
    rare: null,
    name: null,
    type: null,
    attack: null,
    criticalRate: null,
    defense: null,
    element: {
        attack: {
            type: null,
            minValue: null,
            maxValue: null
        },
        status: {
            type: null,
            minValue: null,
            maxValue: null
        }
    },
    sharpness: {
        red: null,
        orange: null,
        yellow: null,
        green: null,
        blue: null,
        white: null,
        purple: null
    },
    slots: [
        // {
        //     size: null
        // }
    ],
    enhances: [
        // {
        //     name: null
        // }
    ]
}

const defaultArmor = {
    serial: null,
    rare: null,
    gender: null,
    name: null,
    defense: null,
    resistence: {
        fire: null,
        water: null,
        tunder: null,
        ice: null,
        dragon: null
    },
    slots: [
        // {
        //     size: null
        // }
    ],
    skills: [
        // {
        //     name: null,
        //     level: null
        // }
    ]
}

const defaultJewel = {
    name: null,
    slot: {
        size: null
    },
    skill: {
        name: null,
        level: null
    }
}

const defaultSkill = {
    name: null,
    description: null,
    list: [
        // {
        //     level: null,
        //     description: null
        // }
    ]
}

const defaultPetalace = {
    name: null,
    rare: null,
    health: {
        increment: null,
        obtain: null
    },
    stamina: {
        increment: null,
        obtain: null
    },
    attack: {
        increment: null,
            obtain: null
    },
    defense: {
        increment: null,
        obtain: null
    }
}

const fetchWeapons = async () => {
    for (let target of [
        'greatSword', 'longSword', 'swordAndShield', 'dualBlades',
        'hammer', 'huntingHorn', 'lance', 'gunlance',
        'chargeBlade', 'switchAxe', 'insectGlaive',
        'bow', 'lightBowgun', 'heavyBowgun'
    ]) {
        console.log(urls.weapons[target], `weapons:${target}`)

        let mapping = {}

        // Fetch List Page
        let listDom = await Helper.fetchHtmlAsDom(urls.weapons[target])

        for (let itemIndex = 0; itemIndex < listDom('.wp-block-table tbody tr').length; itemIndex++) {
            let itemNode = listDom('.wp-block-table tbody tr').eq(itemIndex)

            let serial = itemNode.find('td').eq(0).text()
            let name = itemNode.find('td').eq(1).text()
                .replace(/(│|├|└)*/g, '')
                .replace('Ⅰ', 'I').replace('Ⅱ', 'II').replace('Ⅲ', 'III').replace('Ⅳ', 'IV').replace('Ⅴ', 'V')

            if (Helper.isEmpty(mapping[name])) {
                mapping[name] = Helper.deepCopy(defaultWeapon)
            }

            mapping[name].type = target
            mapping[name].serial = serial
            mapping[name].name = name

            itemNode.find('td').eq(2).html().split('<br>').forEach((property) => {
                if ('' === property) {
                    return
                }

                property = property.replace(':', '').replace('%', '')

                let match = property.match(/^(.+?)((?:\-|\+)?\d+)/)

                switch (match[1]) {
                case '攻擊力':
                    mapping[name].attack = parseInt(match[2], 10)

                    break
                case '防御':
                case '防禦力':
                    mapping[name].defense = parseInt(match[2], 10)

                    break
                case '會心':
                    mapping[name].criticalRate = parseInt(match[2], 10)

                    break
                case '火':
                    mapping[name].element.attack.type = 'fire'
                    mapping[name].element.attack.minValue = parseInt(match[2], 10)

                    break
                case '水':
                    mapping[name].element.attack.type = 'water'
                    mapping[name].element.attack.minValue = parseInt(match[2], 10)

                    break
                case '雷':
                    mapping[name].element.attack.type = 'thunder'
                    mapping[name].element.attack.minValue = parseInt(match[2], 10)

                    break
                case '冰':
                    mapping[name].element.attack.type = 'ice'
                    mapping[name].element.attack.minValue = parseInt(match[2], 10)

                    break
                case '龍':
                    mapping[name].element.attack.type = 'dragon'
                    mapping[name].element.attack.minValue = parseInt(match[2], 10)

                    break
                case '睡眠':
                    mapping[name].element.status.type = 'sleep'
                    mapping[name].element.status.minValue = parseInt(match[2], 10)

                    break
                case '麻痺':
                    mapping[name].element.status.type = 'paralysis'
                    mapping[name].element.status.minValue = parseInt(match[2], 10)

                    break
                case '爆破':
                    mapping[name].element.status.type = 'blast'
                    mapping[name].element.status.minValue = parseInt(match[2], 10)

                    break
                case '毒':
                    mapping[name].element.status.type = 'poison'
                    mapping[name].element.status.minValue = parseInt(match[2], 10)

                    break
                default:
                    console.log('no match property', match)

                    break
                }
            })

            if ('—' !== itemNode.find('td').eq(3).text().trim()) {
                itemNode.find('td').eq(3).text().trim().split('').forEach((slotSize, slotIndex) => {
                    if ('③' === slotSize) {
                        mapping[name].slots.push({
                            size: 3
                        })
                    } else if ('②' === slotSize) {
                        mapping[name].slots.push({
                            size: 2
                        })
                    } else if ('①' === slotSize) {
                        mapping[name].slots.push({
                            size: 1
                        })
                    }
                })
            }

            if ('bow' !== target && 'lightBowgun' !== target && 'heavyBowgun' !== target) {
                let sharpnessMapping = {
                    '.kr0': 'red',
                    '.kr1': 'orange',
                    '.kr2': 'yellow',
                    '.kr3': 'green',
                    '.kr4': 'blue',
                    '.kr5': 'white',
                    '.kr6': 'purple'
                }

                for (let kr of Object.keys(sharpnessMapping)) {
                    if (0 === itemNode.find('td').eq(4).find(kr).length) {
                        break
                    }

                    if (Helper.isEmpty(mapping[name].sharpness[sharpnessMapping[kr]])) {
                        mapping[name].sharpness[sharpnessMapping[kr]] = 0
                    }

                    let krIndex = itemNode.find('td').eq(4).find(kr).length - 1

                    itemNode.find('td').eq(4).find(kr).eq(krIndex).text().split('').forEach((step) => {
                        if ('…' === step) {
                            mapping[name].sharpness[sharpnessMapping[kr]] += 30
                        }

                        if ('.' === step) {
                            mapping[name].sharpness[sharpnessMapping[kr]] += 10
                        }
                    })
                }
            }

            console.log(itemNode.find('td').eq(1).find('a').attr('href'), itemNode.find('td').eq(1).text())

            // Fetch Detail Page
            let itemDom = await Helper.fetchHtmlAsDom(itemNode.find('td').eq(1).find('a').attr('href'))

            itemDom('.wp-block-table').eq(0).find('tbody tr').each((index, node) => {
                let subName = itemDom(node).find('td').eq(0).text().trim()
                    .replace('Ⅰ', 'I').replace('Ⅱ', 'II').replace('Ⅲ', 'III').replace('Ⅳ', 'IV').replace('Ⅴ', 'V')

                if (name !== subName) {
                    return
                }

                itemDom(node).find('td').eq(3).find('a').each((index, node) => {
                    let enhanceName = itemDom(node).text()
                        .replace('Ⅰ', 'I').replace('Ⅱ', 'II').replace('Ⅲ', 'III').replace('Ⅳ', 'IV').replace('Ⅴ', 'V')

                    mapping[name].enhances.push({
                        name: enhanceName
                    })
                })
            })

            let rareTableIndex = ('lightBowgun' === target || 'heavyBowgun' === target) ? 2 : 1

            itemDom('.wp-block-table').eq(rareTableIndex).find('tbody tr').each((index, node) => {
                let subName = itemDom(node).find('td').eq(rareTableIndex).text().trim()
                    .replace('Ⅰ', 'I').replace('Ⅱ', 'II').replace('Ⅲ', 'III').replace('Ⅳ', 'IV').replace('Ⅴ', 'V')

                if (name !== subName) {
                    return
                }

                let rare = itemDom(node).find('td').eq(0).text()

                mapping[name].rare = parseInt(rare, 10)
            })
        }

        Helper.saveJSONAsCSV(`temp/crawler/gameqb/weapons/${target}.csv`, Object.values(mapping))
    }
}

const fetchArmors = async () => {
    console.log(urls.armors, 'armors')

    let mapping = {}

    // Fetch List Page
    let listDom = await Helper.fetchHtmlAsDom(urls.armors)

    for (let itemIndex = 0; itemIndex < listDom('.entry-content a').length; itemIndex++) {
        let itemNode = listDom('.entry-content a').eq(itemIndex)

        console.log(itemNode.attr('href'), itemNode.text())

        // Fetch Detail Page
        let itemDom = await Helper.fetchHtmlAsDom(itemNode.attr('href'))

        let tempNode = null

        // Title
        let serial = itemDom('.post-title-single').text().trim()

        // Table 1
        tempNode = itemDom('.wp-block-table .has-fixed-layout').eq(0).find('tbody tr')

        let rare = parseInt(tempNode.eq(0).find('td').eq(0).text().trim())
        let gender = tempNode.eq(0).find('td').eq(1).text().trim()

        // Table 2
        tempNode = itemDom('.wp-block-table .has-fixed-layout').eq(1).find('tbody tr')
        tempNode.each((index, node) => {
            let name = itemDom(node).find('td').eq(0).text().trim()

            if ('合計' === name) {
                return
            }

            if (Helper.isEmpty(mapping[name])) {
                mapping[name] = Helper.deepCopy(defaultArmor)
            }

            let defense = itemDom(node).find('td').eq(1).text().trim()
            let resistenceFire = itemDom(node).find('td').eq(2).text().trim()
            let resistenceWater = itemDom(node).find('td').eq(3).text().trim()
            let resistenceTunder = itemDom(node).find('td').eq(4).text().trim()
            let resistenceIce = itemDom(node).find('td').eq(5).text().trim()
            let resistenceDragon = itemDom(node).find('td').eq(6).text().trim()

            mapping[name].serial = serial
            mapping[name].rare = rare
            mapping[name].gender = gender
            mapping[name].name = name
            mapping[name].defense = parseInt(defense, 10)
            mapping[name].resistence.fire = parseInt(resistenceFire, 10)
            mapping[name].resistence.water = parseInt(resistenceWater, 10)
            mapping[name].resistence.tunder = parseInt(resistenceTunder, 10)
            mapping[name].resistence.ice = parseInt(resistenceIce, 10)
            mapping[name].resistence.dragon = parseInt(resistenceDragon, 10)
        })

        // Table 3
        tempNode = itemDom('.wp-block-table .has-fixed-layout').eq(2).find('tbody tr')
        tempNode.each((index, node) => {
            let name = itemDom(node).find('td').eq(0).text().trim()

            if ('合計' === name) {
                return
            }

            let slots = []
            let skills = []

            if ('-' !== itemDom(node).find('td').eq(1).text().trim()) {
                itemDom(node).find('td').eq(1).text().trim().split('').forEach((slotSize, slotIndex) => {
                    if ('③' === slotSize) {
                        mapping[name].slots.push({
                            size: 3
                        })
                    } else if ('②' === slotSize) {
                        mapping[name].slots.push({
                            size: 2
                        })
                    } else if ('①' === slotSize) {
                        mapping[name].slots.push({
                            size: 1
                        })
                    }
                })
            }

            itemDom(node).find('td').eq(2).find('a').each((index, node) => {
                let skillName = itemDom(node).text()
                let skillLevel = itemDom(node)[0].next.data.replace('+', '')

                mapping[name].skills.push({
                    name: skillName,
                    level: parseInt(skillLevel, 10)
                })
            })
        })
    }

    Helper.saveJSONAsCSV('temp/crawler/gameqb/armors.csv', Object.values(mapping))
}

const fetchJewels = async () => {
    console.log(urls.jewels, 'jewels')

    let mapping = {}

    // Fetch List Page
    let listDom = await Helper.fetchHtmlAsDom(urls.jewels)

    for (let itemIndex = 0; itemIndex < listDom('.has-fixed-layout tbody tr').length; itemIndex++) {
        let itemNode = listDom('.has-fixed-layout tbody tr').eq(itemIndex).find('td').eq(0).find('a').eq(0)

        let name = null
        let slotSize = null
        let skillName = null

        if (Helper.isEmpty(itemNode.attr('href'))) {
            itemNode = listDom('.has-fixed-layout tbody tr').eq(itemIndex).find('td')

            name = itemNode.eq(0).text().trim()
            slotSize = itemNode.eq(1).text().trim()
            skillName = itemNode.eq(2).text().trim()

            console.log('no page', name)
        } else {
            console.log(itemNode.attr('href'), itemNode.text().trim())

            // Fetch Detail Page
            let itemDom = await Helper.fetchHtmlAsDom(itemNode.attr('href'))

            name = itemDom('.has-fixed-layout tbody tr').eq(0).find('td').eq(1).text().trim()
            slotSize = itemDom('.has-fixed-layout tbody tr').eq(1).find('td').eq(1).text().trim()
            skillName = itemDom('.has-fixed-layout tbody tr').eq(2).find('td').eq(1).text().trim()
        }

        if (Helper.isEmpty(mapping[name])) {
            mapping[name] = Helper.deepCopy(defaultJewel)
        }

        mapping[name].name = name
        mapping[name].slot.size = parseInt(slotSize, 10)
        mapping[name].skill.name = skillName
        mapping[name].skill.level = 1
    }

    Helper.saveJSONAsCSV('temp/crawler/gameqb/jewels.csv', Object.values(mapping))
}

const fetchSkills = async () => {
    console.log(urls.skills, 'skills')

    let mapping = {}

    // Fetch List Page
    let listDom = await Helper.fetchHtmlAsDom(urls.skills)

    for (let itemIndex = 0; itemIndex < listDom('.has-fixed-layout tbody tr').length; itemIndex++) {
        let itemNode = listDom('.has-fixed-layout tbody tr').eq(itemIndex).find('td').eq(0).find('a').eq(0)

        console.log(itemNode.attr('href'), itemNode.text().trim())

        // Fetch Detail Page
        let itemDom = await Helper.fetchHtmlAsDom(itemNode.attr('href'))

        let name = itemDom('.post-title-single').text().trim()
        let description = itemDom('.entry-content p').text().trim()

        if (Helper.isEmpty(mapping[name])) {
            mapping[name] = Helper.deepCopy(defaultSkill)
        }

        // Table 1
        let tempNode = itemDom('.wp-block-table .has-fixed-layout').eq(0).find('tbody tr')

        tempNode.each((index, node) => {
            let level = itemDom(node).find('td').eq(0).text().trim()
            let description = itemDom(node).find('td').eq(1).text().trim()

            if (Helper.isEmpty(mapping[name].list)) {
                mapping[name].list = []
            }

            mapping[name].list.push({
                level: parseInt(level, 10),
                description: description
            })
        })
    }

    Helper.saveJSONAsCSV('temp/crawler/gameqb/skills.csv', Object.values(mapping))
}

const fetchPetalaces = async () => {
    console.log(urls.petalaces, 'petalaces')

    let mapping = {}

    // Fetch List Page
    let listDom = await Helper.fetchHtmlAsDom(urls.petalaces)

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

        if (Helper.isEmpty(itemNode.attr('href'))) {
            itemNode = listDom('.has-fixed-layout tbody tr').eq(itemIndex).find('td')

            name = itemNode.eq(0).text().trim()
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
        } else {
            console.log(itemNode.attr('href'), itemNode.text().trim())

            // Fetch Detail Page
            let itemDom = await Helper.fetchHtmlAsDom(itemNode.attr('href'))

            name = itemDom('.post-title-single').text().trim()
            rare = itemDom('.wp-block-table tbody tr').eq(0).find('td').eq(1).text().trim()
            healthIncrement = itemDom('.wp-block-table tbody tr').eq(1).find('td').eq(1).text().trim()
            healthObtain = itemDom('.wp-block-table tbody tr').eq(2).find('td').eq(1).text().trim()
            staminaIncrement = itemDom('.wp-block-table tbody tr').eq(3).find('td').eq(1).text().trim()
            staminaObtain = itemDom('.wp-block-table tbody tr').eq(4).find('td').eq(1).text().trim()
            attackIncrement = itemDom('.wp-block-table tbody tr').eq(5).find('td').eq(1).text().trim()
            attackObtain = itemDom('.wp-block-table tbody tr').eq(6).find('td').eq(1).text().trim()
            defenseIncrement = itemDom('.wp-block-table tbody tr').eq(7).find('td').eq(1).text().trim()
            defenseObtain = itemDom('.wp-block-table tbody tr').eq(8).find('td').eq(1).text().trim()
        }

        if (Helper.isEmpty(mapping[name])) {
            mapping[name] = Helper.deepCopy(defaultPetalace)
        }

        mapping[name].name = name
        mapping[name].rare = Helper.isNotEmpty(rare) ? parseInt(rare, 10) : null
        mapping[name].health.increment = parseInt(healthIncrement, 10)
        mapping[name].health.obtain = parseInt(healthObtain, 10)
        mapping[name].stamina.increment = parseInt(staminaIncrement, 10)
        mapping[name].stamina.obtain = parseInt(staminaObtain, 10)
        mapping[name].attack.increment = parseInt(attackIncrement, 10)
        mapping[name].attack.obtain = parseInt(attackObtain, 10)
        mapping[name].defense.increment = parseInt(defenseIncrement, 10)
        mapping[name].defense.obtain = parseInt(defenseObtain, 10)
    }

    Helper.saveJSONAsCSV('temp/crawler/gameqb/petalaces.csv', Object.values(mapping))
}

function fetchAll() {
    fetchWeapons()
    fetchArmors()
    fetchJewels()
    fetchSkills()
    fetchPetalaces()
}

export default {
    fetchAll,
    fetchWeapons,
    fetchArmors,
    fetchJewels,
    fetchSkills,
    fetchPetalaces
}
