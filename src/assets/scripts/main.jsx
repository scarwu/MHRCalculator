/**
 * Bootstrap
 *
 * @package     MHW Calculator
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
import ConditionItemSelector from 'components/modal/conditionItemSelector'
import EquipItemSelector from 'components/modal/equipItemSelector'
import BundleItemSelector from 'components/modal/bundleItemSelector'

// Set Sentry Endpoint
if ('production' === Config.env) {
    Sentry.configureScope((scope) => {
        scope.setLevel('error')
    })
    Sentry.init({
        dsn: 'https://b1176b2a7c654e8c97eb25fb599eb307@o235065.ingest.sentry.io/5849529',
        release: Config.buildTime
    })
}

// Mounting
ReactDOM.render((
    <Router key="router">
        <Route exact path="/:hash?" component={App} />

        <Changelog />
        <AlgorithmSetting />
        <ConditionItemSelector />
        <EquipItemSelector />
        <BundleItemSelector />
    </Router>
), document.getElementById('mhwc'))
