/**
 * Bootstrap
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Libraries
import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Route } from 'react-router-dom'
import * as Sentry from '@sentry/browser'

// Load Config
import Config from 'config'

// Load App
import App from 'app'

// Load Components
import ChangeLogModal from 'components/modal/changeLog'
import AlgorithmSettingModal from 'components/modal/algorithmSetting'
import WeaponSelectorModal from 'components/modal/weaponSelector'
import ArmorSelectorModal from 'components/modal/armorSelector'
import SetSelectorModal from 'components/modal/setSelector'
import PetalaceSelectorModal from 'components/modal/petalaceSelector'
import JewelSelectorModal from 'components/modal/jewelSelector'
import EnhanceSelectorModal from 'components/modal/enhanceSelector'
import SkillSelectorModal from 'components/modal/skillSelector'
import PlayerEquipSelectorModal from 'components/modal/playerEquipSelector'

// Set Sentry Endpoint
if ('production' === Config.env) {
    Sentry.configureScope((scope) => {
        scope.setLevel('error')
    })
    Sentry.init({
        dsn: Config.sentryDsn,
        release: Config.buildTime
    })
}

// Mounting
ReactDOM.render((
    <Router key="router">
        <Route exact path="/:hash?" component={App} />

        <ChangeLogModal />
        {/* <AlgorithmSettingModal />
        <WeaponSelectorModal />
        <ArmorSelectorModal />
        <SetSelectorModal /> */}
        <PetalaceSelectorModal />
        {/* <JewelSelectorModal />
        <EnhanceSelectorModal />
        <SkillSelectorModal />
        <PlayerEquipSelectorModal /> */}
    </Router>
), document.getElementById('mhrc'))
