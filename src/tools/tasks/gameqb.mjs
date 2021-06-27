/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from '../helper.mjs'

const urls = {
    weapons:    'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/',
    armors:     'https://mhr.gameqb.net/3748/',
    skills:     'https://mhr.gameqb.net/1830/',
    sets:       null,
    jewels:     'https://mhr.gameqb.net/1839/',
    charms:     null,
    petalaces:  'https://mhr.gameqb.net/%e7%b5%90%e8%8a%b1%e7%92%b0/',
    enhances:   null,
}

const fetchWeapons = async () => {

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

            let defense = itemDom(node).find('td').eq(1).text().trim()
            let resistenceFire = itemDom(node).find('td').eq(2).text().trim()
            let resistenceWater = itemDom(node).find('td').eq(3).text().trim()
            let resistenceTunder = itemDom(node).find('td').eq(4).text().trim()
            let resistenceIce = itemDom(node).find('td').eq(5).text().trim()
            let resistenceDragon = itemDom(node).find('td').eq(6).text().trim()

            mapping[name] = {
                serial: serial,
                rare: rare,
                gender: gender,
                name: name,
                defense: parseInt(defense, 10),
                resistence: {
                    fire: parseInt(resistenceFire, 10),
                    water: parseInt(resistenceWater, 10),
                    tunder: parseInt(resistenceTunder, 10),
                    ice: parseInt(resistenceIce, 10),
                    dragon: parseInt(resistenceDragon, 10)
                },
                slots: [
                    {
                        size: null
                    },
                    {
                        size: null
                    },
                    {
                        size: null
                    }
                ],
                skills: [
                    {
                        name: null,
                        level: null
                    },
                    {
                        name: null,
                        level: null
                    },
                    {
                        name: null,
                        level: null
                    },
                    {
                        name: null,
                        level: null
                    }
                ]
            }
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
                        slots[slotIndex] = {
                            size: 3
                        }
                    } else if ('②' === slotSize) {
                        slots[slotIndex] = {
                            size: 2
                        }
                    } else if ('①' === slotSize) {
                        slots[slotIndex] = {
                            size: 1
                        }
                    }
                })
            }

            itemDom(node).find('td').eq(2).find('a').each((index, node) => {
                let skillName = itemDom(node).text()
                let skillLevel = itemDom(node)[0].next.data.replace('+', '')

                skills[index] = {
                    name: skillName,
                    level: parseInt(skillLevel, 10)
                }
            })

            mapping[name].slots = slots
            mapping[name].skills = skills
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

        mapping[name] = {
            name: name,
            slot: {
                size: parseInt(slotSize, 10)
            },
            skill: {
                name: skillName,
                level: 1
            }
        }
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

        mapping[name] = {
            name: name,
            description: description,
            list: []
        }

        // Table 1
        let tempNode = itemDom('.wp-block-table .has-fixed-layout').eq(0).find('tbody tr')

        tempNode.each((index, node) => {
            let level = itemDom(node).find('td').eq(0).text().trim()
            let description = itemDom(node).find('td').eq(1).text().trim()

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

        mapping[name] = {
            name: name,
            rare: Helper.isNotEmpty(rare) ? parseInt(rare, 10) : null,
            health: {
                increment: parseInt(healthIncrement, 10),
                obtain: parseInt(healthObtain, 10)
            },
            stamina: {
                increment: parseInt(staminaIncrement, 10),
                obtain: parseInt(staminaObtain, 10)
            },
            attack: {
                increment: parseInt(attackIncrement, 10),
                obtain: parseInt(attackObtain, 10)
            },
            defense: {
                increment: parseInt(defenseIncrement, 10),
                obtain: parseInt(defenseObtain, 10)
            }
        }
    }

    Helper.saveJSONAsCSV('temp/crawler/gameqb/petalaces.csv', Object.values(mapping))
}

export default {
    fetchWeapons,
    fetchArmors,
    fetchJewels,
    fetchSkills,
    fetchPetalaces
}
