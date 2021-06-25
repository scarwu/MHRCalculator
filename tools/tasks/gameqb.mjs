/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from '../helper.mjs'

let urls = {
    weapons:    'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/',
    armors:     'https://mhr.gameqb.net/3748/',
    skills:     'https://mhr.gameqb.net/1830/',
    sets:       null,
    jewels:     'https://mhr.gameqb.net/1839/',
    charms:     null,
    petalaces:  'https://mhr.gameqb.net/%e7%b5%90%e8%8a%b1%e7%92%b0/',
    enhances:   null,
}

function index () {
    console.log('Actions:')
    console.log('   run')
}

async function run () {

    // Armors
    let $ = await Helper.fetchHtmlAsDom(urls.armors)

    $('.entry-content a').each((index, node) => {
        console.log(node.attribs.title, node.attribs.href)
    })

    // Skills

}

export default {
    index,
    run
}
