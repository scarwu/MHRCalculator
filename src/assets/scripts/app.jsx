/**
 * Main Module
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Libraries
import React, { useState, useEffect, useCallback } from 'react'

// Load Core Libraries
import Status from 'core/status'
import Helper from 'core/helper'

// Load Custom Libraries
import _ from 'libraries/lang'

// Load Components
import IconButton from 'components/common/iconButton'
import IconSelector from 'components/common/iconSelector'
import ConditionOptions from 'components/conditionOptions'
import CandidateBundles from 'components/candidateBundles'
import PlayerEquipBlock from 'components/playerEquipBlock'
import PlayerStatusBlock from 'components/playerStatusBlock'

// Load State Control
import CommonState from 'states/common'

// Load Config & Constant
import Config from 'config'
import Constant from 'constant'

if ('production' === Config.env) {
    if (Config.buildTime !== Status.get('sys:buildTime')) {
        CommonState.setter.showModal('changeLog')
    }

    Status.set('sys:buildTime', Config.buildTime)
}

/**
 * Variables
 */
const langList = Object.keys(Constant.langs).map((lang) => {
    return { key: lang, value: Constant.langs[lang] }
})

/**
 * Handle Functions
 */
const handleBundleExport = () => {
    let equips = Helper.deepCopy(CommonState.getter.getCurrentEquips())
    let hash = Helper.base64Encode(JSON.stringify(equips))

    let protocol = window.location.protocol
    let hostname = window.location.hostname
    let pathname = window.location.pathname

    window.open(`${protocol}//${hostname}${pathname}#/${hash}`, '_blank')
}

const handleOpenReadme = () => {
    window.open('https://scar.tw/article/2018/05/02/mhw-calculator-readme/','_blank')
}

export default function App(props) {

    /**
     * Hooks
     */
    const [stateLang, setLang] = useState(Status.get('sys:lang'))

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {

        // Restore Equips from Url to State
        if (Helper.isNotEmpty(props.match.params.hash)) {
            CommonState.setter.replaceCurrentEquips(
                JSON.parse(Helper.base64Decode(props.match.params.hash))
            )
        }
    }, [])

    /**
     * Handle Functions
     */
    const handleLangChange = useCallback((event) => {
        Status.set('sys:lang', event.target.value)
        setLang(event.target.value)
    }, [])

    /**
     * Render Functions
     */
    return (
        <div key={stateLang} id="mhrc-app" className="container-fluid">
            <div className="mhrc-header">
                <a className="mhrc-title" href="./">
                    <h1>{_('title')}</h1>
                </a>

                <div className="mhrc-icons_bundle">
                    <IconButton
                        iconName="link" altName={_('exportBundle')}
                        onClick={handleBundleExport} />
                    <IconButton
                        iconName="info" altName={_('changeLog')}
                        onClick={() => {CommonState.setter.showModal('changeLog')}} />
                    <IconButton
                        iconName="question" altName={_('readme')}
                        onClick={handleOpenReadme} />
                    <IconSelector
                        iconName="globe"
                        defaultValue={stateLang} options={langList}
                        onChange={handleLangChange} />
                </div>
            </div>

            <div className="row mhrc-container">
                {/* <ConditionOptions />
                <CandidateBundles /> */}
                <PlayerEquipBlock />
                {/* <PlayerStatusBlock /> */}
            </div>

            <div className="row mhrc-footer">
                <div className="col-12">
                    <span>Copyright (c) Scar Wu</span>
                </div>

                <div className="col-12">
                    <a href="//scar.tw" target="_blank">
                        <span>Blog</span>
                    </a>
                    &nbsp;|&nbsp;
                    <a href="https://github.com/scarwu/MHRCalculator" target="_blank">
                        <span>Github</span>
                    </a>
                </div>
            </div>
        </div>
    )
}
