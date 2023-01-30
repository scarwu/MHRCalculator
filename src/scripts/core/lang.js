/**
 * Lnaguage
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Constant
import Constant from '@/scripts/constant'

// Load Core
import Status from '@/scripts/core/status'
import Helper from '@/scripts/core/helper'

// Load Langs
import zhTWUI from '@/scripts/langs/zhTW/ui.json'
import zhTWDataset from '@/scripts/langs/zhTW/dataset.json'
import jaJPUI from '@/scripts/langs/jaJP/ui.json'
import jaJPDataset from '@/scripts/langs/jaJP/dataset.json'
import enUSUI from '@/scripts/langs/enUS/ui.json'
import enUSDataset from '@/scripts/langs/enUS/dataset.json'

let langs = {
    zhTW: Object.assign({}, zhTWUI, zhTWDataset),
    jaJP: Object.assign({}, jaJPUI, jaJPDataset),
    enUS: Object.assign({}, enUSUI, enUSDataset)
}

let defaultLang = Constant.defaultLang
let browserLnag = navigator.language.replace('-', '')
let currentLang = Status.get('sys:lang')

// Decide Current Lang
currentLang = Helper.isNotEmpty(Constant.langs[currentLang])
    ? currentLang : (
        Helper.isNotEmpty(Constant.langs[browserLnag])
            ? browserLnag : defaultLang
    )

// Set Status
Status.set('sys:lang', currentLang)

function getExistLang (key) {
    for (let lang in langs) {
        if (Helper.isNotEmpty(langs[lang][key])) {
            return langs[lang][key]
        }
    }

    return null
}

export default (key) => {
    currentLang = Status.get('sys:lang')

    if (Helper.isNotEmpty(langs[currentLang]) && Helper.isNotEmpty(langs[currentLang][key])) {
        return langs[currentLang][key]
    }

    if (Helper.isNotEmpty(langs[browserLnag]) && Helper.isNotEmpty(langs[browserLnag][key])) {
        return langs[browserLnag][key]
    }

    if (Helper.isNotEmpty(langs[defaultLang]) && Helper.isNotEmpty(langs[defaultLang][key])) {
        return langs[defaultLang][key]
    }

    return getExistLang(key)
}
