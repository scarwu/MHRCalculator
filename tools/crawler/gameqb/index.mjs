#!/usr/bin/env node
/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from '../../helper.mjs'

let urls = {
    'weapons':      'https://mhr.gameqb.net/%e6%ad%a6%e5%99%a8/',
    'armors':       'https://mhr.gameqb.net/3748/',
    'skills':       'https://mhr.gameqb.net/1830/',
    'jewels':       'https://mhr.gameqb.net/1839/',
    'petalaces':    'https://mhr.gameqb.net/%e7%b5%90%e8%8a%b1%e7%92%b0/'
}

let $ = await Helper.fetchHtmlAsDom(urls.armors)

$('.entry-content a').each((index, node) => {
    console.log(node.attribs.title, node.attribs.href)
})