/**
 * Helper
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Libraries
import md5 from 'md5'
import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'
import * as cheerio  from 'cheerio'

function isEmpty(variable) {
    return (undefined === variable || null === variable)
}

function isNotEmpty(variable) {
    return (undefined !== variable && null !== variable)
}

function isObject(value) {
    return 'object' === typeof value && false === Array.isArray(value)
}

function isArray(value) {
    return 'object' === typeof value && true === Array.isArray(value)
}

function isFunction(value) {
    return 'function' === typeof value
}

function isString(value) {
    return 'string' === typeof value
}

function isNumber(value) {
    return 'number' === typeof value
}

function isBool(value) {
    return 'boolean' === typeof value
}

function checkType(value) {
    if (true === isEmpty(value)) {
        return null
    }

    if (true === isObject(value)) {
        return 'object'
    }

    if (true === isArray(value)) {
        return 'array'
    }

    if (true === isFunction(value)) {
        return 'function'
    }

    if (true === isString(value)) {
        return 'string'
    }

    if (true === isNumber(value)) {
        return 'number'
    }

    if (true === isBool(value)) {
        return 'boolean'
    }
}

function deepCopy(data) {
    return JSON.parse(JSON.stringify(data))
}

function jsonHash(data) {
    return md5(JSON.stringify(data))
}

function fetchHtmlAsDom(url) {
    let cacheRoot = `${global.root}/temp/htmlCache`
    let cacheName = md5(url)
    let cachePath = `${cacheRoot}/${cacheName}`

    if (false === fs.existsSync(cacheRoot)) {
        fs.mkdirSync(cacheRoot, {
            recursive: true
        })
    }

    // Load From Cache
    if (true === fs.existsSync(cachePath)) {
        return cheerio.load(fs.readFileSync(cachePath))
    }

    let urlObject = new URL(url)

    return new Promise((resolve, reject) => {
        let handleResponse = (res) => {
            const { statusCode } = res

            if (statusCode !== 200) {
                reject()
            }

            res.setEncoding('utf8')

            let html = ''

            res.on('data', (chunk) => {
                html += chunk
            })

            res.on('end', () => {

                // Save To Cache
                fs.writeFileSync(cachePath, html)

                resolve(cheerio.load(html))
            })
        }

        let handleError = (err) => {
            reject(err)
        }

        let handler = ('https:' === urlObject.protocol) ? https : http

        handler.get(url, handleResponse).on('error', handleError)
    })
}

function loadJSON(path) {
    return JSON.parse(fs.readFileSync(`${global.root}/${path}`))
}

function saveJSON(path, data) {
    fs.writeFileSync(`${global.root}/${path}`, JSON.stringify(data))

    return true
}

function loadCSV(path) {
    return fs.readFileSync(`${global.root}/${path}`).split('\n').map((row) => {
        return row.split(',')
    })
}

function saveCSV(path, data) {
    fs.writeFileSync(`${global.root}/${path}`, data.map((row) => {
        return row.join(',')
    }).join('\n'))

    return true
}

function loadCSVAsJSON(path) {
    let data = loadCSV(`${global.root}/${path}`)

    return data
}

function saveJSONAsCSV(path, data) {
    saveCSV(`${global.root}/${path}`, data)

    return true
}

export default {
    isEmpty,
    isNotEmpty,
    isObject,
    isArray,
    isFunction,
    isString,
    isNumber,
    isBool,
    checkType,
    deepCopy,
    jsonHash,
    fetchHtmlAsDom,
    loadJSON,
    saveJSON,
    loadCSV,
    saveCSV,
    loadCSVAsJSON,
    saveJSONAsCSV
}
