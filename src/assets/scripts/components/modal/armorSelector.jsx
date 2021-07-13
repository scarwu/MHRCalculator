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

    States.setter.hideModal('armorSelector')
}

/**
 * Render Functions
 */
const renderArmorItem = (armorItem, tempData) => {
    if (Helper.isEmpty(armorItem.maxDefense)) {
        armorItem.maxDefense = '?'
    }

    return (
        <div key={armorItem.id} className="mhrc-item mhrc-item-2-step">
            <div className="col-12 mhrc-name">
                <span>{_(armorItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {(Helper.isNotEmpty(tempData.target) && armorItem.id !== tempData.id) ? (
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => {
                                handleItemPickUp(armorItem.id, tempData)
                            }} />
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
    const refModal = useRef()

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

            return
        }

        let tempData = Helper.deepCopy(stateModalData)

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

        // Set Type
        tempData.typeList = Constant.armorTypes.map((type) => {
            return {
                key: type,
                value: _(type)
            }
        })

        if (Helper.isEmpty(tempData.type) || 'armor' === tempData.type) {
            tempData.type = Helper.isNotEmpty(armorItem) ? armorItem.type : tempData.typeList[0].key
        }

        // Set Rare
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

        if (Helper.isEmpty(tempData.rare)) {
            tempData.rare = (Helper.isNotEmpty(armorItem)) ? armorItem.rare : tempData.rareList[0].key
        }

        updateTempData(tempData)
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
    }, [])

    const handleSegmentInput = useCallback((event) => {
        let segment = event.target.value

        updateTempData(Object.assign({}, stateTempData, {
            segment: (0 !== segment.length)
                ? segment.replace(/([.?*+^$[\]\\(){}|-])/g, '').trim() : null
        }))
    }, [stateTempData])

    const handleTypeChange = useCallback((event) => {
        let type = event.target.value

        updateTempData(Object.assign({}, stateTempData, {
            equipType: type,
            type: type
        }))
    }, [stateTempData])

    const handleRareChange = useCallback((event) => {
        let rare = event.target.value

        updateTempData(Object.assign({}, stateTempData, {
            rare: parseInt(rare, 10)
        }))
    }, [stateTempData])

    const getContent = useMemo(() => {
        if (Helper.isEmpty(stateTempData)) {
            return false
        }

        return stateTempData.list.filter((item) => {
            if (item.type !== stateTempData.type) {
                return false
            }

            if (item.rare !== stateTempData.rare) {
                return false
            }

            // Create Text
            let text = _(item.name)
            text += _(item.series)

            item.skills.forEach((skillData) => {
                let skillItem = SkillDataset.getItem(skillData.id)

                if (Helper.isNotEmpty(skillItem)) {
                    text += _(skillItem.name)
                }
            })

            // Search Nameword
            if (Helper.isNotEmpty(stateTempData.segment)
                && -1 === text.toLowerCase().search(stateTempData.segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).sort((itemA, itemB) => {
            return _(itemA.id) > _(itemB.id) ? 1 : -1
        }).map((item) => {
            return renderArmorItem(item, stateTempData)
        })
    }, [stateTempData])

    return Helper.isNotEmpty(stateTempData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <span className="mhrc-title">{_('armorList')}</span>

                    <div className="mhrc-icons_bundle">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                            defaultValue={stateTempData.segment} onChange={handleSegmentInput} />
                        <IconSelector
                            iconName="filter" defaultValue={stateTempData.type}
                            options={stateTempData.typeList} onChange={handleTypeChange} />
                        <IconSelector
                            iconName="filter" defaultValue={stateTempData.rare}
                            options={stateTempData.rareList} onChange={handleRareChange} />
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