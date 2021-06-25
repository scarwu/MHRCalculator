/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from '../helper.mjs'

let urls = {
    weapons:    null,
    armors:     'https://game8.jp/mhrise/363845',
    skills:     'https://game8.jp/mhrise/363848',
    sets:       null,
    jewels:     'https://game8.jp/mhrise/363846',
    charms:     null,
    petalaces:  null,
    enhances:   null
}

function index　() {
    console.log('Actions:')
    console.log('   run')
}

async function run　() {

    // Skills
    let $ = await Helper.fetchHtmlAsDom(urls.skills)

    $('.a-table').each((index, table) => {
        $(table).find('tr').each((index, tr) => {
            if (0 === index) {
                return
            }
            if (1 !== index) {
                return
            }

            console.log(
                tr.find('td').eq(0).text()
            )
        })
    })

}

export default {
    index,
    run
}
