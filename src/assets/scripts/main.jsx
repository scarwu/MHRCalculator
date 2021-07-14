/**
 * Bootstrap
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Route } from 'react-router-dom'
import * as Sentry from '@sentry/browser'

// Load Config
import Config from 'config'

// Load App
import App from 'app'

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
    </Router>
), document.getElementById('mhrc'))
