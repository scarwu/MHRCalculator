/**
 * Helper
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Libraries
import MD5 from 'md5'
import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'
import * as cheerio  from 'cheerio'
import { resolve } from 'path'

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

function fetchHtmlAsDom(url) {
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
    return JSON.parse(fs.readFileSync(path))
}

function saveJSON(path, data) {
    fs.writeFileSync(path, JSON.stringify(data))

    return true
}

function loadCSV(path) {
    return null
}

function saveCSV(path, data) {

    return true
}

export default {
    isEmpty,
    isNotEmpty,
    deepCopy,
    jsonHash,
    fetchHtmlAsDom,
    loadJSON,
    saveJSON,
    loadCSV,
    saveCSV
}
