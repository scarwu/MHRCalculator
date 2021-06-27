/**
 * Config
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

export default {
    env: process.env.ENV || 'development',
    buildTime: process.env.BUILD_TIME || (new Date()).getTime().toString()
}
