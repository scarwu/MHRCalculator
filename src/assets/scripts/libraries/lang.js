/**
 * Lnaguage
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Core Libraries
import Status from 'core/status'
import Helper from 'core/helper'

// Load Constant
import Constant from 'constant'

// Load Langs
import zhTWUI from 'langs/zhTW/ui.json'
import zhTWDataset from 'langs/zhTW/dataset.json'
import jaJPUI from 'langs/jaJP/ui.json'
import jaJPDataset from 'langs/jaJP/dataset.json'
import enUSUI from 'langs/enUS/ui.json'
import enUSDataset from 'langs/enUS/dataset.json'

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

    return (Helper.isNotEmpty(langs[currentLang][key]))
        ? langs[currentLang][key] : (Helper.isNotEmpty(langs[defaultLang][key])
            ? langs[defaultLang][key] : getExistLang(key))
}
