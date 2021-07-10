/**
 * Weapon Selector Modal
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
import WeaponDataset from 'libraries/dataset/weapon'
import EnhanceDataset from 'libraries/dataset/enhance'
import SkillDataset from 'libraries/dataset/skill'

// Load Components
import IconButton from 'components/common/iconButton'
import IconSelector from 'components/common/iconSelector'
import IconInput from 'components/common/iconInput'
import SharpnessBar from 'components/common/sharpnessBar'

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

    States.setter.hideModal('weaponSelector')
}

/**
 * Render Functions
 */
const renderWeaponItem = (weaponItem, tempData) => {
    if (Helper.isNotEmpty(weaponItem.element.attack)
        && Helper.isEmpty(weaponItem.element.attack.maxValue)
    ) {
        weaponItem.element.attack.maxValue = '?'
    }

    if (Helper.isNotEmpty(weaponItem.element.status)
        && Helper.isEmpty(weaponItem.element.status.maxValue)
    ) {
        weaponItem.element.status.maxValue = '?'
    }

    return (
        <div key={weaponItem.id} className="mhrc-item mhrc-item-2-step">
            <div className="col-12 mhrc-name">
                <span>{_(weaponItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {(Helper.isNotEmpty(tempData.target) && weaponItem.id !== tempData.id) ? (
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => {
                                handleItemPickUp(weaponItem.id, tempData)
                            }} />
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                <div className="col-3 mhrc-name">
                    <span>{_('series')}</span>
                </div>
                <div className="col-9 mhrc-value">
                    <span>{_(weaponItem.series)}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('attack')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{weaponItem.attack}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('criticalRate')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{weaponItem.criticalRate}</span>
                </div>

                {Helper.isNotEmpty(weaponItem.sharpness) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_('sharpness')}</span>
                        </div>
                        <div className="col-9 mhrc-value mhrc-sharpness">
                            <SharpnessBar data={{
                                value: weaponItem.sharpness.minValue,
                                steps: weaponItem.sharpness.steps
                            }} />
                            <SharpnessBar data={{
                                value: weaponItem.sharpness.maxValue,
                                steps: weaponItem.sharpness.steps
                            }} />
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhrc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{weaponItem.defense}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('slot')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    {(Helper.isNotEmpty(weaponItem.slots) && 0 !== weaponItem.slots.length) ? (
                        weaponItem.slots.map((slotData, index) => {
                            return (
                                <span key={index}>[{slotData.size}]</span>
                            )
                        })
                    ) : false}
                </div>

                {Helper.isNotEmpty(weaponItem.element.attack) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_(weaponItem.element.attack.type)}</span>
                        </div>
                        <div className="col-3 mhrc-value">
                            <span>{weaponItem.element.attack.minValue} - {weaponItem.element.attack.maxValue}</span>
                        </div>
                    </Fragment>
                ) : false}

                {Helper.isNotEmpty(weaponItem.element.status) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_(weaponItem.element.status.type)}</span>
                        </div>
                        <div className="col-3 mhrc-value">
                            <span>{weaponItem.element.status.minValue} - {weaponItem.element.status.maxValue}</span>
                        </div>
                    </Fragment>
                ) : false}
            </div>
        </div>
    )
}

export default function WeaponSelectorModal (props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('weaponSelector'))
    const [statePlayerEquips, updatePlayerEquips] = useState(States.getter.getPlayerEquips())
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())

    const [stateTempData, updateTempData] = useState(null)
    const refModal = useRef()

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
        tempData.list = WeaponDataset.getList()

        let weaponItem = WeaponDataset.getItem(tempData.id)

        // Set Type
        tempData.typeList = Constant.weaponTypes.map((type) => {
            return {
                key: type,
                value: _(type)
            }
        })

        if (Helper.isEmpty(tempData.type)) {
            tempData.type = Helper.isNotEmpty(weaponItem) ? weaponItem.type : tempData.typeList[0].key
        }

        // Set Rare
        tempData.rareList = {}

        tempData.list.forEach((weaponItem) => {
            tempData.rareList[weaponItem.rare] = weaponItem.rare
        })

        tempData.rareList = Object.values(tempData.rareList).reverse().map((rare) => {
            return {
                key: rare,
                value: _('rare') + `: ${rare}`
            }
        })

        if (Helper.isEmpty(tempData.rare)) {
            tempData.rare = (Helper.isNotEmpty(weaponItem)) ? weaponItem.rare : tempData.rareList[0].key
        }

        updateTempData(tempData)
    }, [
        stateModalData,
        statePlayerEquips,
        stateRequiredConditions
    ])

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('weaponSelector'))
            updatePlayerEquips(States.getter.getPlayerEquips())
            updateRequiredConditions(States.getter.getRequiredConditions())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideModal('weaponSelector')
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
            // equipType: type,
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
            text += _(item.type)

            if (Helper.isNotEmpty(item.element)
                && Helper.isNotEmpty(item.element.attack)
            ) {
                text += _(item.element.attack.type)
            }

            if (Helper.isNotEmpty(item.element)
                && Helper.isNotEmpty(item.element.status)
            ) {
                text += _(item.element.status.type)
            }

            // item.skills.forEach((skillData) => {
            //     let skillItem = SkillDataset.getItem(skillData.id)

            //     if (Helper.isNotEmpty(skillItem)) {
            //         text += _(skillItem.name)
            //     }
            // })

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
            return renderWeaponItem(item, stateTempData)
        })
    }, [stateTempData])

    return Helper.isNotEmpty(stateTempData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <span className="mhrc-title">{_('weaponList')}</span>

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
                            onClick={() => {
                                States.setter.hideModal('weaponSelector')
                            }} />
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