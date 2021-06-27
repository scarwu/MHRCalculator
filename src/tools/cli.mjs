#!/usr/bin/env node
/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
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

// Check Task
let taskName = process.argv[2]

if (Helper.isEmpty(taskName)) {
    console.log('Tasks:')

    Object.keys(taskMapping).forEach((taskName) => {
        console.log(`    ${taskName}`)
    })

    process.exit()
} else if (Helper.isEmpty(taskMapping[taskName])) {
    console.log(`Task "${taskName}" not found`)

    process.exit()
}

// Check Action
let actionName = process.argv[3]

if (Helper.isEmpty(actionName)) {
    console.log('Actions:')

    Object.keys(taskMapping[taskName]).forEach((actionName) => {
        console.log(`    ${actionName}`)
    })

    process.exit()
} else if (Helper.isEmpty(taskMapping[taskName][actionName])) {
    console.log(`Task "${taskName}" Action "${actionName}" not found`)

    process.exit()
}

// Run CLI
taskMapping[taskName][actionName]()
