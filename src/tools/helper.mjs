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
import * as path from 'path'
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
    if (true === isEmpty(value)) {
        return false
    }

    return 'object' === typeof value && false === Array.isArray(value)
}

function isArray(value) {
    if (true === isEmpty(value)) {
        return false
    }

    return 'object' === typeof value && true === Array.isArray(value)
}

function isFunction(value) {
    if (true === isEmpty(value)) {
        return false
    }

    return 'function' === typeof value
}

function isString(value) {
    if (true === isEmpty(value)) {
        return false
    }

    return 'string' === typeof value
}

function isNumber(value) {
    if (true === isEmpty(value)) {
        return false
    }

    return 'number' === typeof value
}

function isBool(value) {
    if (true === isEmpty(value)) {
        return false
    }

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

function fetchHtml(url) {
    if (isEmpty(url)) {
        return null
    }

    let cacheRoot = `${global.root}/temp/cache/html`
    let cacheName = md5(url)
    let cachePath = `${cacheRoot}/${cacheName}`

    // Load From Cache
    if (true === fs.existsSync(cachePath)) {
        return fs.readFileSync(cachePath)
    }

    // Save To Cache
    function saveCache(html) {
        if (false === fs.existsSync(path.dirname(cachePath))) {
            fs.mkdirSync(path.dirname(cachePath), {
                recursive: true
            })
        }

        fs.writeFileSync(cachePath, html)
    }

    let urlObject = new URL(url)

    return new Promise((resolve, reject) => {
        let handler = ('https:' === urlObject.protocol) ? https : http

        handler.get(url, async (res) => {
            const { statusCode } = res

            if (statusCode !== 200) {
                if (301 === statusCode || 302 === statusCode) {
                    let html = await fetchHtml(res.headers.location)

                    saveCache(html)
                    resolve(html)
                } else {
                    resolve(null)
                }

                return
            }

            res.setEncoding('utf8')

            let html = ''

            res.on('data', (chunk) => {
                html += chunk
            })

            res.on('end', () => {
                saveCache(html)
                resolve(html)
            })
        }).on('error', (err) => {
            reject(err)
        })
    })
}

async function fetchHtmlAsDom(url) {
    let html = await fetchHtml(url)

    if (null === html) {
        return null
    }

    return cheerio.load(html)
}

function loadJSON(subPath) {
    let filePath = `${global.root}/${subPath}`

    return JSON.parse(fs.readFileSync(filePath))
}

function saveJSON(subPath, data) {
    let filePath = `${global.root}/${subPath}`

    if (false === fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), {
            recursive: true
        })
    }

    fs.writeFileSync(filePath, JSON.stringify(data))

    return true
}

function loadCSV(subPath) {
    let filePath = `${global.root}/${subPath}`

    return fs.readFileSync(filePath).split('\n').map((row) => {
        return row.split(',')
    })
}

function saveCSV(subPath, data) {
    let filePath = `${global.root}/${subPath}`

    if (false === fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), {
            recursive: true
        })
    }

    fs.writeFileSync(filePath, data.map((row) => {
        return row.join(',')
    }).join('\n'))

    return true
}

function loadCSVAsJSON(subPath) {
    let data = loadCSV(subPath)

    return data
}

function saveJSONAsCSV(subPath, data) {
    let recursive = (key, value, headers, row) => {
        if (true === isFunction(value)) {
            throw 'is not allowed type'
        }

        if (true === isObject(value)) {
            for (let entry of Object.entries(value)) {
                let subKey = entry[0]
                let subValue = entry[1]

                if ('' !== key) {
                    subKey = `${key}:${subKey}`
                }

                let result = recursive(subKey, subValue, headers, row)

                headers = result.headers
                row = result.row
            }

            return { headers, row }
        }

        if (true === isArray(value)) {
            for (let entry of Object.entries(value)) {
                let subIndex = entry[0]
                let subValue = entry[1]

                if ('' !== key) {
                    subIndex = `${key}[]:${subIndex}`
                }

                let result = recursive(subIndex, subValue, headers, row)

                headers = result.headers
                row = result.row
            }

            return { headers, row }
        }

        if (true === isEmpty(value)
            || true === isString(value)
            || true === isNumber(value)
            || true === isBool(value)
        ) {
            headers[key] = true
            row[key] = value

            return { headers, row }
        }
    }

    // Flat Nested Format as XY Dimension
    let headers = {}
    let rows = []

    data.forEach((item) => {
        let row = {}
        let result = recursive('', item, headers, row)

        headers = result.headers
        row = result.row

        rows.push(row)
    })

    // Convert XY Dimension for CSV Format
    let csv = []

    headers = Object.keys(headers)

    csv.push(headers)

    rows.forEach((row) => {
        csv.push(headers.map((header) => {
            return isNotEmpty(row[header]) ? row[header] : ''
        }))
    })

    saveCSV(subPath, csv)

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
    fetchHtml,
    fetchHtmlAsDom,
    loadJSON,
    saveJSON,
    loadCSV,
    saveCSV,
    loadCSVAsJSON,
    saveJSONAsCSV
}
