/**
 * Algorithm Setting Modal
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'

// Load Core
import _ from 'core/lang'
import Helper from 'core/helper'

// Load Components
import IconButton from 'components/common/iconButton'
import IconSelector from 'components/common/iconSelector'
import IconInput from 'components/common/iconInput'
import BasicSelector from 'components/common/basicSelector'
import BasicInput from 'components/common/basicInput'

import ArmorFactors from 'components/modal/sub/algorithmSetting/armorFactors'
import JewelFactors from 'components/modal/sub/algorithmSetting/jewelFactors'

// Load States
import States from 'states'

/**
 * Variables
 */
const getSortList = () => {
    return [
        { key: 'complex',       value: _('complexSort') },
        { key: 'amount',        value: _('amountSort') },
        { key: 'defense',       value: _('defenseSort') },
        { key: 'fire',          value: _('fireSort') },
        { key: 'water',         value: _('waterSort') },
        { key: 'thunder',       value: _('thunderSort') },
        { key: 'ice',           value: _('iceSort') },
        { key: 'dragon',        value: _('dragonSort') }
    ]
}

const getOrderList = () => {
    return [
        { key: 'desc',          value: _('desc') },
        { key: 'asc',           value: _('asc') }
    ]
}

const getModeList = () => {
    return [
        { key: 'all',                   value: _('all') },
        { key: 'armorFactor',           value: _('armorFactor') },
        { key: 'jewelFactor',           value: _('jewelFactor') },
        { key: 'byRequiredConditions',  value: _('byRequiredConditions') }
    ]
}

// const armorRareList = [ 5, 6, 7, 8, 9, 10, 11, 12 ]
// const jewelSizeList = [ 1, 2, 3, 4 ]

const armorRareList = [ 1, 2, 3, 4, 5, 6, 7 ]
const jewelSizeList = [ 1, 2, 3 ]

/**
 * Handler Functions
 */
const handleLimitChange = (event) => {
    if ('' === event.target.value) {
        return
    }

    let limit = parseInt(event.target.value)

    limit = (false === isNaN(limit)) ? limit : 1

    event.target.value = limit

    States.setter.setAlgorithmParamsLimit(limit)
}

const handleSortChange = (event) => {
    States.setter.setAlgorithmParamsSort(event.target.value)
}

const handleOrderChange = (event) => {
    States.setter.setAlgorithmParamsOrder(event.target.value)
}

export default function AlgorithmSettingModal (props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('algorithmSetting'))
    const [stateAlgorithmParams, updateAlgorithmParams] = useState(States.getter.getAlgorithmParams())

    const [stateTempData, updateTempData] = useState(null)
    const [stateFilter, updateFilter] = useState({})

    const refModal = useRef()
    const refSearch = useRef()

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('algorithmSetting'))
            updateAlgorithmParams(States.getter.getAlgorithmParams())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    // Initialize
    useEffect(() => {
        if (Helper.isEmpty(stateModalData)) {
            updateTempData(null)

            window.removeEventListener('keydown', handleSearchFocus)

            return
        }

        let tempData = Helper.deepCopy(stateModalData)
        let filter = {}

        // Set filter
        filter.mode = 'all'

        window.addEventListener('keydown', handleSearchFocus)

        updateTempData(tempData)
        updateFilter(filter)
    }, [stateModalData])

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideModal('algorithmSetting')

        updateFilter({})
    }, [])

    const handleSearchFocus = useCallback((event) => {
        if ('f' !== event.key || true !== event.ctrlKey) {
            return
        }

        event.preventDefault()

        refSearch.current.focus()
    }, [])

    const handleSegmentInput = useCallback((event) => {
        let segment = event.target.value

        updateFilter(Object.assign({}, stateFilter, {
            segment: (0 !== segment.length)
                ? segment.replace(/([.?*+^$[\]\\(){}|-])/g, '').trim() : null
        }))
    }, [stateFilter])

    const handleModeChange = useCallback((event) => {
        let mode = event.target.value

        updateFilter(Object.assign({}, stateFilter, {
            mode: mode
        }))
    }, [stateFilter])

    /**
     * Render Functions
     */
    return Helper.isNotEmpty(stateTempData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <div className="mhrc-icons_bundle-left">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                            bypassRef={refSearch} defaultValue={stateFilter.segment}
                            onChange={handleSegmentInput} />
                        <IconSelector
                            iconName="globe" defaultValue={stateFilter.mode}
                            options={getModeList()} onChange={handleModeChange} />
                    </div>

                    <strong>{_('algorithmSetting')}</strong>

                    <div className="mhrc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => {
                                States.setter.hideModal('algorithmSetting')
                            }} />
                    </div>
                </div>

                <div className="mhrc-list">
                    <div className="mhrc-wrapper">
                        <div className="mhrc-item mhrc-item-2-step">
                            <div className="col-12 mhrc-name">
                                <span>{_('strategy')}</span>
                            </div>

                            <div className="col-12 mhrc-content">
                                <div className="col-6 mhrc-name">
                                    <span>{_('resultLimit')}</span>
                                </div>
                                <div className="col-6 mhrc-value">
                                    <BasicInput
                                        iconName="list-alt"
                                        defaultValue={stateAlgorithmParams.limit}
                                        onChange={handleLimitChange} />
                                </div>

                                <div className="col-6 mhrc-name">
                                    <span>{_('sortBy')}</span>
                                </div>
                                <div className="col-6 mhrc-value">
                                    <BasicSelector
                                        iconName="sort-amount-desc"
                                        defaultValue={stateAlgorithmParams.sort}
                                        options={getSortList()} onChange={handleSortChange} />
                                </div>

                                <div className="col-6 mhrc-name">
                                    <span>{_('sortOrder')}</span>
                                </div>
                                <div className="col-6 mhrc-value">
                                    <BasicSelector
                                        iconName="sort-amount-desc"
                                        defaultValue={stateAlgorithmParams.order}
                                        options={getOrderList()} onChange={handleOrderChange} />
                                </div>
                            </div>
                        </div>

                        {'all' === stateFilter.mode || 'armorFactor' === stateFilter.mode || 'byRequiredConditions' === stateFilter.mode ? (
                            <div className="mhrc-item mhrc-item-2-step">
                                <div className="col-12 mhrc-name">
                                    <span>{_('armorFactor')}</span>
                                </div>
                                <div className="col-12 mhrc-content">
                                    {armorRareList.map((rare) => {
                                        return (
                                            <div key={rare} className="col-6 mhrc-value">
                                                <span>{_('rare') + `: ${rare}`}</span>
                                                <div className="mhrc-icons_bundle">
                                                    {stateAlgorithmParams.usingFactor['armor:rare:' + rare] ? (
                                                        <IconButton
                                                            iconName="star" altName={_('exclude')}
                                                            onClick={() => {States.setter.setAlgorithmParamsUsingFactor('armor:rare:' + rare, false)}} />
                                                    ) : (
                                                        <IconButton
                                                            iconName="star-o" altName={_('include')}
                                                            onClick={() => {States.setter.setAlgorithmParamsUsingFactor('armor:rare:' + rare, true)}} />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : false}

                        {'all' === stateFilter.mode || 'jewelFactor' === stateFilter.mode || 'byRequiredConditions' === stateFilter.mode ? (
                            <div className="mhrc-item mhrc-item-2-step">
                                <div className="col-12 mhrc-name">
                                    <span>{_('jewelFactor')}</span>
                                </div>
                                <div className="col-12 mhrc-content">
                                    {jewelSizeList.map((size) => {
                                        return (
                                            <div key={size} className="col-6 mhrc-value">
                                                <span>{_('size') + `: ${size}`}</span>
                                                <div className="mhrc-icons_bundle">
                                                    {stateAlgorithmParams.usingFactor['jewel:size:' + size] ? (
                                                        <IconButton
                                                            iconName="star" altName={_('exclude')}
                                                            onClick={() => {States.setter.setAlgorithmParamsUsingFactor('jewel:size:' + size, false)}} />
                                                    ) : (
                                                        <IconButton
                                                            iconName="star-o" altName={_('include')}
                                                            onClick={() => {States.setter.setAlgorithmParamsUsingFactor('jewel:size:' + size, true)}} />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : false}

                        {'all' === stateFilter.mode || 'armorFactor' === stateFilter.mode || 'byRequiredConditions' === stateFilter.mode
                            ? <ArmorFactors segment={stateFilter.segment}
                                byRequiredConditions={'byRequiredConditions' === stateFilter.mode} />
                            : false}
                        {'all' === stateFilter.mode || 'jewelFactor' === stateFilter.mode || 'byRequiredConditions' === stateFilter.mode
                            ? <JewelFactors segment={stateFilter.segment}
                                byRequiredConditions={'byRequiredConditions' === stateFilter.mode} />
                            : false}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}
