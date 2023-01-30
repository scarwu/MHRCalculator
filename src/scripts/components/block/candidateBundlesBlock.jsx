/**
 * Candidate Bundles
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { Fragment, useState, useEffect, useCallback } from 'react'

// Load Config
import Config from '@/scripts/config'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'
import Event from '@/scripts/core/event'

// Load Libraries
import Misc from '@/scripts/libraries/misc'

// Load Components
import IconButton from '@/scripts/components/common/iconButton'
import IconTab from '@/scripts/components/common/iconTab'

import QuickSetting from '@/scripts/components/block/sub/candidateBundlesBlock/quickSetting'
import RequiredConditions from '@/scripts/components/block/sub/candidateBundlesBlock/requiredConditions'
import BundleList from '@/scripts/components/block/sub/candidateBundlesBlock/bundleList'

// Load States
import States from '@/scripts/states'

// Variables
let workers = {}

/**
 * Handle Functions
 */
const handleShowAllAlgorithmSetting = () => {
    States.setter.showModal('algorithmSetting', {
        mode: 'all'
    })
}

const handleSwitchDataStore = (index) => {
    States.setter.switchDataStore('candidateBundles', index)
}

const convertTimeFormat = (seconds) => {
    let text = ''

    if (seconds > 3600) {
        let hours = parseInt(seconds / 3600)

        seconds -= hours * 3600
        text += hours + ' ' + _('hour') + ' '
    }

    if (seconds > 60) {
        let minutes = parseInt(seconds / 60)

        seconds -= minutes * 60
        text += minutes + ' ' + _('minute') + ' '
    }

    text += seconds + ' ' + _('second')

    return text
}

export default function CandidateBundlesBlock (props) {

    /**
     * Hooks
     */
    const [stateDataStore, updateDataStore] = useState(States.getter.getDataStore())
    const [stateCandidateBundles, updateCandidateBundles] = useState(States.getter.getCandidateBundles())
    const [stateTasks, updateTasks] = useState({})

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateDataStore(States.getter.getDataStore())
            updateCandidateBundles(States.getter.getCandidateBundles())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    // Worker Callback
    useEffect(() => {
        Event.on('workerCallback', 'tasks', (data) => {
            let tabIndex = data.tabIndex
            let action = data.action
            let payload = data.payload

            switch (action) {
            case 'progress':
                if (Helper.isNotEmpty(payload.bundleCount)) {
                    stateTasks[tabIndex].bundleCount = payload.bundleCount
                }

                if (Helper.isNotEmpty(payload.searchPercent)) {
                    stateTasks[tabIndex].searchPercent = payload.searchPercent
                }

                if (Helper.isNotEmpty(payload.timeRemaining)) {
                    stateTasks[tabIndex].timeRemaining = payload.timeRemaining
                }

                updateTasks(Helper.deepCopy(stateTasks))

                break
            case 'result':
                handleSwitchDataStore(tabIndex)

                States.setter.replaceCandidateBundles(payload.candidateBundles)

                // workers[tabIndex].terminate()
                // workers[tabIndex] = undefined

                stateTasks[tabIndex] = undefined

                updateTasks(Helper.deepCopy(stateTasks))

                break
            default:
                break
            }
        })

        return () => {
            Event.off('workerCallback', 'tasks')
        }
    }, [stateTasks])

    // Search Remaining Timer
    useEffect(() => {
        let tabIndex = stateDataStore.candidateBundles.index

        if (Helper.isEmpty(stateTasks[tabIndex])) {
            return
        }

        let timerId = setInterval(() => {
            if (0 === stateTasks[tabIndex].timeRemaining) {
                return
            }

            stateTasks[tabIndex].timeRemaining--

            updateTasks(Helper.deepCopy(stateTasks))
        }, 1000)

        return () => {
            clearInterval(timerId)
        }
    }, [stateTasks, stateDataStore])

    /**
     * Handle Functions
     */
    const handleCandidateBundlesSearch = useCallback(() => {
        let tabIndex = stateDataStore.candidateBundles.index

        if (Helper.isNotEmpty(stateTasks[tabIndex])) {
            return
        }

        // Get All Data From Store
        let requiredConditions = States.getter.getRequiredConditions()
        let algorithmParams = States.getter.getAlgorithmParams()

        if (Helper.isEmpty(requiredConditions.sets) && Helper.isEmpty(requiredConditions.skills)) {
            return
        }

        if (0 === requiredConditions.sets.length && 0 === requiredConditions.skills.length) {
            return
        }

        stateTasks[tabIndex] = {
            bundleCount: 0,
            searchPercent: 0,
            timeRemaining: 0,
            requiredConditions: requiredConditions
        }

        updateTasks(Helper.deepCopy(stateTasks))

        if (Helper.isEmpty(workers[tabIndex])) {
            workers[tabIndex] = new Worker('assets/scripts/worker.min.js?' + Config.buildTime + '&' + tabIndex)
            workers[tabIndex].onmessage = (event) => {
                Event.trigger('workerCallback', {
                    tabIndex: tabIndex,
                    action: event.data.action,
                    payload: event.data.payload
                })
            }
        }

        workers[tabIndex].postMessage({
            requiredConditions: requiredConditions,
            algorithmParams: algorithmParams
        })
    }, [stateTasks, stateDataStore])

    const handleCandidateBundlesCancel = useCallback(() => {
        let tabIndex = stateDataStore.candidateBundles.index

        workers[tabIndex].terminate()
        workers[tabIndex] = undefined

        stateTasks[tabIndex] = undefined

        updateTasks(Helper.deepCopy(stateTasks))
    }, [stateTasks, stateDataStore])

    let tabIndex = stateDataStore.candidateBundles.index

    return (
        <div className="col mhrc-bundles">
            <div className="mhrc-panel">
                <span className="mhrc-title">{_('candidateBundle')}</span>

                <div className="mhrc-icons_bundle-left">
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[0]) ? 'cog fa-spin' : 'circle-o'}
                        altName={_('tab') + ' 1'}
                        isActive={0 === tabIndex}
                        onClick={() => {handleSwitchDataStore(0)}} />
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[1]) ? 'cog fa-spin' : 'circle-o'}
                        altName={_('tab') + ' 2'}
                        isActive={1 === tabIndex}
                        onClick={() => {handleSwitchDataStore(1)}} />
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[2]) ? 'cog fa-spin' : 'circle-o'}
                        altName={_('tab') + ' 3'}
                        isActive={2 === tabIndex}
                        onClick={() => {handleSwitchDataStore(2)}} />
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[3]) ? 'cog fa-spin' : 'circle-o'}
                        altName={_('tab') + ' 4'}
                        isActive={3 === tabIndex}
                        onClick={() => {handleSwitchDataStore(3)}} />
                </div>

                <div className="mhrc-icons_bundle-right">
                    <IconButton
                        iconName="refresh" altName={_('reset')}
                        onClick={States.setter.cleanCandidateBundles} />
                    <IconButton
                        iconName="cog" altName={_('setting')}
                        onClick={handleShowAllAlgorithmSetting} />
                    <IconButton
                        iconName="search" altName={_('search')}
                        onClick={handleCandidateBundlesSearch} />
                </div>
            </div>

            <div key="list" className="mhrc-list">
                {Helper.isNotEmpty(stateTasks[tabIndex]) ? (
                    <Fragment>
                        <div className="mhrc-item mhrc-item-3-step">
                            <div className="col-12 mhrc-name">
                                <span>{_('searching')} ...</span>
                                <div className="mhrc-icons_bundle">
                                    <IconButton
                                        iconName="times" altName={_('cancel')}
                                        onClick={handleCandidateBundlesCancel} />
                                </div>
                            </div>
                            <div className="col-12 mhrc-content">
                                <div className="col-3 mhrc-name">
                                    <span>{_('bundleCount')}</span>
                                </div>
                                <div className="col-3 mhrc-value">
                                    <span>{stateTasks[tabIndex].bundleCount}</span>
                                </div>
                                <div className="col-3 mhrc-name">
                                    <span>{_('searchPercent')}</span>
                                </div>
                                <div className="col-3 mhrc-value">
                                    <span>{stateTasks[tabIndex].searchPercent} %</span>
                                </div>
                                <div className="col-3 mhrc-name">
                                    <span>{_('timeRemaining')}</span>
                                </div>
                                <div className="col-9 mhrc-value">
                                    <span>{convertTimeFormat(stateTasks[tabIndex].timeRemaining)}</span>
                                </div>
                            </div>
                        </div>
                        <RequiredConditions data={stateTasks[tabIndex].requiredConditions} />
                    </Fragment>
                ) : (
                    Helper.isEmpty(stateCandidateBundles.requiredConditions) ? (
                        <QuickSetting />
                    ) : (
                        <Fragment>
                            <RequiredConditions data={stateCandidateBundles.requiredConditions} />
                            <BundleList />
                        </Fragment>
                    )
                )}
            </div>
        </div>
    )
}
