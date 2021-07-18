/**
 * Armor Selector Modal
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Constant
import Constant from 'constant'

// Load Core
import _ from 'core/lang'
import Helper from 'core/helper'

// Load Libraries
import ArmorDataset from 'libraries/dataset/armor'
import SkillDataset from 'libraries/dataset/skill'

// Load Components
import IconButton from 'components/common/iconButton'
import IconSelector from 'components/common/iconSelector'
import IconInput from 'components/common/iconInput'

// Load States
import States from 'states'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, tempData) => {
    if ('playerEquips' === tempData.target) {
        States.setter.setPlayerEquip(tempData.equipType, itemId)
    }

    if ('requiredConditions' === tempData.target) {
        States.setter.setRequiredConditionsEquip(tempData.equipType, itemId)
    }

    States.setter.showModal('armorSelector', {
        target: tempData.target,
        equipType: tempData.equipType
    })
}

/**
 * Render Functions
 */
const renderArmorItem = (armorItem, tempData) => {
    let classNames = [
        'mhrc-item'
    ]

    if (Helper.isEmpty(tempData.target) || armorItem.id !== tempData.id) {
        classNames.push('mhrc-item-2-step')
    } else {
        classNames.push('mhrc-item-3-step')
    }

    if (Helper.isEmpty(armorItem.maxDefense)) {
        armorItem.maxDefense = '?'
    }

    return (
        <div key={armorItem.id} className={classNames.join(' ')}>
            <div className="col-12 mhrc-name">
                <span>{_(armorItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {Helper.isNotEmpty(tempData.target) ? (
                        (armorItem.id !== tempData.id) ? (
                            <IconButton
                                iconName="check" altName={_('select')}
                                onClick={() => {
                                    handleItemPickUp(armorItem.id, tempData)
                                }} />
                        ) : (
                            <IconButton
                                iconName="times" altName={_('remove')}
                                onClick={() => {
                                    handleItemPickUp(null, tempData)
                                }} />
                        )
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                <div className="col-3 mhrc-name">
                    <span>{_('series')}</span>
                </div>
                <div className="col-9 mhrc-value">
                    <span>{_(armorItem.series)}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{armorItem.minDefense} - {armorItem.maxDefense}</span>
                </div>

                {Constant.resistanceTypes.map((resistanceType) => {
                    return (
                        <Fragment key={resistanceType}>
                            <div className="col-3 mhrc-name">
                                <span>{_('resistance')}: {_(resistanceType)}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                <span>{armorItem.resistance[resistanceType]}</span>
                            </div>
                        </Fragment>
                    )
                })}

                <div className="col-3 mhrc-name">
                    <span>{_('slot')}</span>
                </div>
                <div className="col-9 mhrc-value">
                    {(Helper.isNotEmpty(armorItem.slots) && 0 !== armorItem.slots.length) ? (
                        armorItem.slots.map((slotData, index) => {
                            return (
                                <span key={index}>[{slotData.size}]</span>
                            )
                        })
                    ) : false}
                </div>

                {(Helper.isNotEmpty(armorItem.skills) && 0 !== armorItem.skills.length) ? (
                    armorItem.skills.map((skillData, index) => {
                        let skillItem = SkillDataset.getItem(skillData.id)

                        return Helper.isNotEmpty(skillItem) ? (
                            <Fragment key={index}>
                                <div className="col-12 mhrc-name">
                                    <span>{_(skillItem.name)} Lv.{skillData.level}</span>
                                </div>
                                <div className="col-12 mhrc-value mhrc-description">
                                    <span>{_(skillItem.list[skillData.level - 1].effect)}</span>
                                </div>
                            </Fragment>
                        ) : false
                    })
                ): false}
            </div>
        </div>
    )
}

export default function ArmorSelectorModal (props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('armorSelector'))
    const [statePlayerEquips, updatePlayerEquips] = useState(States.getter.getPlayerEquips())
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())

    const [stateTempData, updateTempData] = useState(null)
    const [stateFilter, updateFilter] = useState({})

    const refModal = useRef()
    const refSearch = useRef()

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('armorSelector'))
            updatePlayerEquips(States.getter.getPlayerEquips())
            updateRequiredConditions(States.getter.getRequiredConditions())
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

        // Set Id
        tempData.id = null

        if (Helper.isNotEmpty(tempData.target)) {
            let equipType = tempData.equipType

            if ('playerEquips' === tempData.target
                && Helper.isNotEmpty(statePlayerEquips[equipType])
            ) {
                tempData.id = statePlayerEquips[equipType].id
            }

            if ('requiredConditions' === tempData.target
                && Helper.isNotEmpty(stateRequiredConditions.equips)
                && Helper.isNotEmpty(stateRequiredConditions.equips[equipType])
            ) {
                tempData.id = stateRequiredConditions.equips[equipType].id
            }
        }

        // Set List
        tempData.list = ArmorDataset.getList()

        let armorItem = ArmorDataset.getItem(tempData.id)

        // Set Type List
        tempData.typeList = Constant.armorTypes.map((type) => {
            return {
                key: type,
                value: _(type)
            }
        })

        // Set Rare List
        tempData.rareList = {}

        tempData.list.forEach((armorItem) => {
            tempData.rareList[armorItem.rare] = armorItem.rare
        })

        tempData.rareList = Object.values(tempData.rareList).reverse().map((rare) => {
            return {
                key: rare,
                value: _('rare') + `: ${rare}`
            }
        })

        // Set Filter
        filter.type = Helper.isNotEmpty(armorItem) ? armorItem.type : null
        filter.rare = (Helper.isNotEmpty(armorItem)) ? armorItem.rare : tempData.rareList[0].key

        if (Helper.isNotEmpty(stateModalData.equipType) && Helper.isEmpty(filter.type)) {
            filter.type = stateModalData.equipType
        }

        if (Helper.isEmpty(filter.type)) {
            filter.type = tempData.typeList[0].key
        }

        window.addEventListener('keydown', handleSearchFocus)

        updateTempData(tempData)
        updateFilter(filter)
    }, [
        stateModalData,
        statePlayerEquips,
        stateRequiredConditions
    ])

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideModal('armorSelector')

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

    const handleTypeChange = useCallback((event) => {
        let type = event.target.value

        if (Helper.isNotEmpty(stateTempData.target)) {
            States.setter.showModal('armorSelector', {
                target: stateTempData.target,
                equipType: type
            })
        }

        updateFilter(Object.assign({}, stateFilter, {
            type: type
        }))
    }, [
        stateTempData,
        stateFilter
    ])

    const handleRareChange = useCallback((event) => {
        let rare = event.target.value

        updateFilter(Object.assign({}, stateFilter, {
            rare: parseInt(rare, 10)
        }))
    }, [stateFilter])

    const getContent = useMemo(() => {
        if (Helper.isEmpty(stateTempData)) {
            return false
        }

        return stateTempData.list.filter((item) => {
            if (item.type !== stateFilter.type) {
                return false
            }

            if (item.rare !== stateFilter.rare) {
                return false
            }

            // Create Text
            let text = _(item.name)
            text += _(item.series)

            if (Helper.isNotEmpty(item.skills)) {
                item.skills.forEach((skillData) => {
                    let skillItem = SkillDataset.getItem(skillData.id)

                    if (Helper.isNotEmpty(skillItem)) {
                        text += _(skillItem.name)
                    }
                })
            }

            // Search Nameword
            if (Helper.isNotEmpty(stateFilter.segment)
                && -1 === text.toLowerCase().search(stateFilter.segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).sort((itemA, itemB) => {
            return _(itemA.id) > _(itemB.id) ? 1 : -1
        }).map((item) => {
            return renderArmorItem(item, stateTempData)
        })
    }, [
        stateTempData,
        stateFilter
    ])

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
                            iconName="filter" defaultValue={stateFilter.type}
                            options={stateTempData.typeList} onChange={handleTypeChange} />
                        <IconSelector
                            iconName="filter" defaultValue={stateFilter.rare}
                            options={stateTempData.rareList} onChange={handleRareChange} />
                    </div>

                    <span className="mhrc-title">{_('armorList')}</span>

                    <div className="mhrc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => { States.setter.hideModal('armorSelector') }} />
                    </div>
                </div>
                <div className="mhrc-list">
                    <div className="mhrc-wrapper">
                        {getContent}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}