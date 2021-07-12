/**
 * Main Module
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useState, useEffect, useCallback } from 'react'

// Load Config & Constant
import Config from 'config'
import Constant from 'constant'

// Load Core
import _ from 'core/lang'
import Status from 'core/status'
import Helper from 'core/helper'

// Load States
import States from 'states'

// Load Components
import IconButton from 'components/common/iconButton'
import IconSelector from 'components/common/iconSelector'

import RequiredConditionsBlock from 'components/block/requiredConditionsBlock'
import CandidateBundlesBlock from 'components/block/candidateBundlesBlock'
import PlayerEquipsBlock from 'components/block/playerEquipsBlock'
import PlayerStatusBlock from 'components/block/playerStatusBlock'

import ChangeLogModal from 'components/modal/changeLog'
import AlgorithmSettingModal from 'components/modal/algorithmSetting'
import WeaponSelectorModal from 'components/modal/weaponSelector'
import ArmorSelectorModal from 'components/modal/armorSelector'
import SetSelectorModal from 'components/modal/setSelector'
import PetalaceSelectorModal from 'components/modal/petalaceSelector'
import JewelSelectorModal from 'components/modal/jewelSelector'
import EnhanceSelectorModal from 'components/modal/enhanceSelector'
import SkillSelectorModal from 'components/modal/skillSelector'

if ('production' === Config.env) {
    if (Config.buildTime !== Status.get('sys:buildTime')) {
        States.setter.showModal('changeLog')
    }

    Status.set('sys:buildTime', Config.buildTime)
}

/**
 * Variables
 */
const langList = Object.keys(Constant.langs).map((lang) => {
    return {
        key: lang,
        value: Constant.langs[lang]
    }
})

/**
 * Handle Functions
 */
const handlePlayerEquipsExport = () => {
    let equips = Helper.deepCopy(States.getter.getPlayerEquips())
    let hash = Helper.base64Encode(JSON.stringify(equips))

    let protocol = window.location.protocol
    let hostname = window.location.hostname
    let pathname = window.location.pathname

    window.open(`${protocol}//${hostname}${pathname}#/${hash}`, '_blank')
}

const handleOpenReadme = () => {
    window.open('https://scar.tw/article/2018/05/02/mhw-calculator-readme/','_blank')
}

export default function App (props) {

    /**
     * Hooks
     */
    const [stateLang, setLang] = useState(Status.get('sys:lang'))

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {

        // Restore Equips from Url to State
        if (Helper.isNotEmpty(props.match.params.hash)) {
            let playerEquips = JSON.parse(Helper.base64Decode(props.match.params.hash))

            // TODO: need verify

            States.setter.replacePlayerEquips(playerEquips)
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
                        onClick={handlePlayerEquipsExport} />
                    <IconButton
                        iconName="info" altName={_('changeLog')}
                        onClick={() => { States.setter.showModal('changeLog') }} />
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
                <RequiredConditionsBlock />
                <CandidateBundlesBlock />
                <PlayerEquipsBlock />
                <PlayerStatusBlock />
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

            <ChangeLogModal />
            <AlgorithmSettingModal />
            <WeaponSelectorModal />
            <ArmorSelectorModal />
            <SetSelectorModal />
            <JewelSelectorModal />
            <PetalaceSelectorModal />
            <EnhanceSelectorModal />
            <SkillSelectorModal />
        </div>
    )
}
