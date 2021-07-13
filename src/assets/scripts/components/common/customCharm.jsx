/**
 * Equips Dispayler: Custom Weapon
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core
import _ from 'core/lang'
import Helper from 'core/helper'

// Load Libraries
import JewelDataset from 'libraries/dataset/jewel'
import SkillDataset from 'libraries/dataset/skill'
// import SetDataset from 'libraries/dataset/set'

// Load Components
import IconButton from 'components/common/iconButton'
import BasicSelector from 'components/common/basicSelector'
import BasicInput from 'components/common/basicInput'

// Load States
import States from 'states'

const getSlotSizeList = () => {
    return [
        { key: 'none',  value: _('none') },
        { key: 1,       value: 1 },
        { key: 2,       value: 2 },
        { key: 3,       value: 3 }
    ]
}

const getSkillList = () => {
    return [
        { key: 'none', value: _('none') },
        ...SkillDataset.getList().map((skillItem) => {
            return { key: skillItem.id, value: _(skillItem.name) }
        })
    ]
}

const getSlotSize = (slot) => {
    if (Helper.isEmpty(slot)) {
        return 'none'
    }

    return slot.size
}

const getSkillId = (skill) => {
    if (Helper.isEmpty(skill)) {
        return 'none'
    }

    return skill.id
}

const getSkillLevel = (skill) => {
    if (Helper.isEmpty(skill)) {
        return 'none'
    }

    return skill.level
}

const handleRefreshCustomDataset = (tempData) => {
    if ('playerEquips' === tempData.target) {
        States.setter.setPlayerEquipCustomDataset('charm', tempData.custom)
    }

    if ('requiredConditions' === tempData.target) {
        States.setter.setRequiredConditionsEquipCustomDataset('charm', tempData.custom)
    }
}

/**
 * Render Functions
 */
const renderJewelOption = (equipType, slotIndex, slotSize, jewelId) => {

    // Get Jewel Item
    let jewelItem = JewelDataset.getItem(jewelId)

    const showModal = () => {
        States.setter.showModal('jewelSelector', {
            target: 'playerEquips',
            equipType: equipType,
            idIndex: slotIndex,

            // filter
            size: slotSize
        })
    }

    const removeItem = () => {
        States.setter.setPlayerEquipJewel(equipType, slotIndex, null)
    }

    return (
        <Fragment key={`${equipType}:${slotIndex}`}>
            {Helper.isNotEmpty(jewelItem) ? (
                <Fragment>
                    <span>[{jewelItem.size}] {_(jewelItem.name)}</span>

                    <div className="mhrc-icons_bundle">
                        <IconButton iconName="exchange" altName={_('change')} onClick={showModal} />
                        <IconButton iconName="times" altName={_('clean')} onClick={removeItem} />
                    </div>
                </Fragment>
            ) : (
                <div className="mhrc-icons_bundle">
                    <IconButton iconName="plus" altName={_('add')} onClick={showModal} />
                </div>
            )}
        </Fragment>
    )
}

export default function CustomCharm (props) {
    const { target } = props

    /**
     * Hooks
     */
    const [statePlayerEquips, updatePlayerEquips] = useState(States.getter.getPlayerEquips())
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())

    const [stateTempData, updateTempData] = useState(null)

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updatePlayerEquips(States.getter.getPlayerEquips())
            updateRequiredConditions(States.getter.getRequiredConditions())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    // Initialize
    useEffect(() => {
        let tempData = null

        if ('playerEquips' === target) {
            tempData = Helper.deepCopy(statePlayerEquips.charm)
        }

        if ('requiredConditions' === target) {
            tempData = Helper.deepCopy(stateRequiredConditions.equips.charm)
        }

        updateTempData(tempData)
    }, [
        target,
        statePlayerEquips,
        stateRequiredConditions
    ])

    return useMemo(() => {
        Helper.debug('Component: EquipsDisplayer -> CustomCharm')

        if (Helper.isEmpty(stateTempData)) {
            return false
        }

        const removeItem = () => {
            if ('playerEquips' === stateTempData.target) {
                States.setter.setPlayerEquip('charm', null)
            }

            if ('requiredConditions' === stateTempData.target) {
                States.setter.setRequiredConditionsEquip('charm', null)
            }
        }

        return (
            <div key="customCharm" className="mhrc-item mhrc-item-3-step">
                <div className="col-12 mhrc-name">
                    <span>{_('customCharm')}</span>
                    <div className="mhrc-icons_bundle">
                        {/* {isNotRequire ? (
                            <IconButton
                                iconName="arrow-left" altName={_('include')}
                                onClick={() => {States.setter.setRequiredEquips(equipType, stateTempData.custom)}} />
                        ) : false} */}
                        <IconButton iconName="times" altName={_('clean')} onClick={removeItem} />
                    </div>
                </div>

                <div className="col-12 mhrc-content">
                    {stateTempData.custom.slots.map((slotData, slotIndex) => {
                        return (
                            <Fragment key={slotIndex}>
                                <div className="col-3 mhrc-name">
                                    <span>{_('slot')}: {slotIndex + 1}</span>
                                </div>
                                <div className="col-3 mhrc-value">
                                    <BasicSelector
                                        defaultValue={getSlotSize(stateTempData.custom.slots[slotIndex])}
                                        options={getSlotSizeList()}
                                        onChange={(event) => {
                                            stateTempData.custom.slots[slotIndex].size = ('none' !== event.target.value)
                                                ? parseInt(event.target.value, 10) : null

                                            handleRefreshCustomDataset(stateTempData)
                                        }} />
                                </div>
                                <div className="col-6 mhrc-value">
                                    {('none' !== getSlotSize(stateTempData.custom.slots[slotIndex])) ? (
                                        renderJewelOption(
                                            'charm',
                                            slotIndex,
                                            slotData.size,
                                            Helper.isNotEmpty(stateTempData.jewelIds[slotIndex])
                                                ? stateTempData.jewelIds[slotIndex] : null
                                        )
                                    ) : false}
                                </div>
                            </Fragment>
                        )
                    })}
                </div>

                <div className="col-12 mhrc-content">
                    {stateTempData.custom.skills.map((skillData, skillIndex) => {
                        return (
                            <Fragment>
                                <div className="col-3 mhrc-name">
                                    <span>{_('skill')}: {skillIndex + 1}</span>
                                </div>
                                <div className="col-6 mhrc-value">
                                    <BasicSelector
                                        defaultValue={getSkillId(stateTempData.custom.skills[skillIndex])}
                                        options={getSkillList()}
                                        onChange={(event) => {
                                            stateTempData.custom.skills[skillIndex].id = ('none' !== event.target.value)
                                                ? event.target.value : null

                                            handleRefreshCustomDataset(stateTempData)
                                        }} />
                                </div>
                                <div className="col-3 mhrc-value">
                                    <BasicSelector
                                        defaultValue={getSkillLevel(stateTempData.custom.skills[skillIndex])}
                                        options={getSkillList()}
                                        onChange={(event) => {
                                            stateTempData.custom.skills[skillIndex].level = ('none' !== event.target.value)
                                                ? parseInt(event.target.value, 10) : null

                                            handleRefreshCustomDataset(stateTempData)
                                        }} />
                                </div>
                            </Fragment>
                        )
                    })}
                </div>
            </div>
        )
    }, [ stateTempData ])
}
