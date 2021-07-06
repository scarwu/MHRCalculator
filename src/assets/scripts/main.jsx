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
import Changelog from 'components/modal/changelog'
import AlgorithmSetting from 'components/modal/algorithmSetting'
import WeaponItemSelector from 'components/modal/selector/weaponItem'
import ArmorItemSelector from 'components/modal/selector/armorItem'
import SetItemSelector from 'components/modal/selector/setItem'
import PetalaceItemSelector from 'components/modal/selector/petalaceItem'
import JewelItemSelector from 'components/modal/selector/jewelItem'
import EnhanceItemSelector from 'components/modal/selector/enhanceItem'
import SkillItemSelector from 'components/modal/selector/skillItem'
import playerEquipmentSelector from 'components/modal/selector/playerEquipment'

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

        <Changelog />
        <AlgorithmSetting />
        <WeaponItemSelector />
        <ArmorItemSelector />
        <SetItemSelector />
        <PetalaceItemSelector />
        <JewelItemSelector />
        <EnhanceItemSelector />
        <SkillItemSelector />
        <playerEquipmentSelector />
    </Router>
), document.getElementById('mhrc'))
