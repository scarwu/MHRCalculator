/**
 * Helper
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Libraries
import MD5 from 'md5'
import * as fs from 'fs'
import * as http from 'http'

function isEmpty(variable) {
    return (undefined === variable || null === variable)
}

function isNotEmpty(variable) {
    return (undefined !== variable && null !== variable)
}

function deepCopy(data) {
    return JSON.parse(JSON.stringify(data))
}

function jsonHash(data) {
    return MD5(JSON.stringify(data))
}

function jsonHash(data) {
    return MD5(JSON.stringify(data))
}

function loadJSON(path) {
    return JSON.parse(fs.readFileSync(path))
}

function saveJSON(path, data) {
    return fs.writeFileSync(path, JSON.stringify(data))
}

function fetchHtml(url) {
    let html = http.request(url)

    return html
}

function loadJSON(path) {
    return null
}

function saveJSON(path, data) {
    return null
}

export default {
    isEmpty,
    isNotEmpty,
    deepCopy,
    jsonHash,
    fetchHtml,
    loadJSON,
    saveJSON
}
