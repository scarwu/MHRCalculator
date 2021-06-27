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

const fetchArmors = async () => {
    console.log(urls.armors, 'armors')

    let mapping = {}

    // Fetch List Page
    let listDom = await Helper.fetchHtmlAsDom(urls.armors)

    for (let serialIndex = 0; serialIndex < listDom('.entry-content a').length; serialIndex++) {
        let serialNode = listDom('.entry-content a').eq(serialIndex)

        console.log(serialNode.attr('href'), serialNode.text())

        let tableNode = null

        // Fetch Detail Page
        let armorDom = await Helper.fetchHtmlAsDom(serialNode.attr('href'))

        // Title
        let serial = armorDom('.post-title-single').text().trim()

        // Table 1
        tableNode = armorDom('.wp-block-table .has-fixed-layout').eq(0).find('tbody tr')

        let rare = parseInt(tableNode.eq(0).find('td').eq(0).text().trim())
        let gender = tableNode.eq(0).find('td').eq(1).text().trim()

        // Table 2
        tableNode = armorDom('.wp-block-table .has-fixed-layout').eq(1).find('tbody tr')
        tableNode.each((index, node) => {
            let name = armorDom(node).find('td').eq(0).text().trim()

            if ('合計' === name) {
                return
            }

            mapping[name] = {
                serial: serial,
                rare: rare,
                gender: gender,
                name: name,
                defense: parseInt(armorDom(node).find('td').eq(1).text().trim(), 10),
                resistence: {
                    fire: parseInt(armorDom(node).find('td').eq(2).text().trim(), 10),
                    water: parseInt(armorDom(node).find('td').eq(3).text().trim(), 10),
                    tunder: parseInt(armorDom(node).find('td').eq(4).text().trim(), 10),
                    ice: parseInt(armorDom(node).find('td').eq(5).text().trim(), 10),
                    dragon: parseInt(armorDom(node).find('td').eq(6).text().trim(), 10)
                },
                slots: null,
                skills: null
            }
        })

        // Table 3
        tableNode = armorDom('.wp-block-table .has-fixed-layout').eq(2).find('tbody tr')
        tableNode.each((index, node) => {
            let name = armorDom(node).find('td').eq(0).text().trim()

            if ('合計' === name) {
                return
            }

            let slots = []
            let skills = []

            if ('-' !== armorDom(node).find('td').eq(1).text().trim()) {
                armorDom(node).find('td').eq(1).text().trim().split('').forEach((slotSize) => {
                    if ('③' === slotSize) {
                        slots.push({
                            size: 3
                        })
                    } else if ('②' === slotSize) {
                        slots.push({
                            size: 2
                        })
                    } else if ('①' === slotSize) {
                        slots.push({
                            size: 1
                        })
                    }
                })
            }

            armorDom(node).find('td').eq(2).find('a').each((index, node) => {
                skills.push({
                    name: armorDom(node).text(),
                    level: parseInt(armorDom(node)[0].next.data.replace('+', ''), 10)
                })
            })

            mapping[name].slots = slots
            mapping[name].skills = skills
        })
    }

    Helper.saveJSONAsCSV('gameqb/armor.csv', Object.values(mapping))
}

const fetchSkills = async () => {
    let listDom = await Helper.fetchHtmlAsDom(urls.skills)

}

export default {
    fetchArmors,
    fetchSkills
}
