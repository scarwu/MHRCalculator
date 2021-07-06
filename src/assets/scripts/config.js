/**
 * Config
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

export const env = process.env.ENV || 'development'
export const buildTime = process.env.BUILD_TIME || (new Date()).getTime().toString()
export const sentryDsn = 'https://b1176b2a7c654e8c97eb25fb599eb307@o235065.ingest.sentry.io/5849529'

export default {
    env,
    buildTime,
    sentryDsn
}
