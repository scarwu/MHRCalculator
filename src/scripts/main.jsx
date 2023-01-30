/**
 * Bootstrap
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import * as Sentry from '@sentry/browser'

// Load Config
import Config from '@/scripts/config'

// Load App
import App from '@/scripts/app'

// Load Styles
import '@/styles/global.sass'
import '@/styles/main.sass'

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
createRoot(document.getElementById('mhrc')).render(
    <HashRouter key="router">
        <Routes>
            <Route exact path="/*" element={<App />} />
        </Routes>
    </HashRouter>
)
