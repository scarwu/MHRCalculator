#!/usr/bin/env node
/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import * as path from 'path'

// Set Root to Global
global.root = path.dirname(process.argv[1])

import Helper from './helper.mjs'
import Game8Task from './tasks/game8.mjs'
import GameqbTask from './tasks/gameqb.mjs'

let taskMapping = {
    game8: Game8Task,
    gameqb: GameqbTask
}

let taskName = process.argv[2]
let actionName = process.argv[3]

if (Helper.isEmpty(taskName)) {
    console.log('Tasks:')

    Object.keys(taskMapping).forEach((taskName) => {
        console.log(`    ${taskName}`)
    })

    process.exit()
}

if (Helper.isEmpty(taskMapping[taskName])) {
    console.log(`Task "${taskName}" not found`)

    process.exit()
}

if (Helper.isEmpty(actionName)) {
    taskMapping[taskName].index()

    process.exit()
}

if (Helper.isEmpty(taskMapping[taskName][actionName])) {
    console.log(`Task "${taskName}" Action "${actionName}" not found`)

    process.exit()
}

taskMapping[taskName][actionName]()
