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
import Misc from 'libraries/misc'
import JewelDataset from 'libraries/dataset/jewel'
import SkillDataset from 'libraries/dataset/skill'

// Load Components
import IconButton from 'components/common/iconButton'
import BasicSelector from 'components/common/basicSelector'

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

const getSkillLevelList = (currentLevel) => {
    let list = [
        { key: 'none', value: _('none') }
    ]

    for (let level = 1; level <= currentLevel; level++) {
        list.push({
            key: level,
            value: 'Lv.' + level
        })
    }

    return list
}

const getValue = (value, defaultValue = '') => {
    if (Helper.isEmpty(value)) {
        return defaultValue
    }

    return value
}

const handleRefreshCustomDataset = (majorData) => {
    if ('playerEquips' === majorData.target) {
        States.setter.setPlayerEquipCustomDataset('charm', majorData.custom)
    }

    if ('requiredConditions' === majorData.target) {
        States.setter.setRequiredConditionsEquipCustomDataset('charm', majorData.custom)
    }
}

/**
 * Render Functions
 */
const renderJewelOption = (target, equipType, slotIndex, slotSize, jewelId) => {

    // Get Jewel Item
    let jewelItem = JewelDataset.getItem(jewelId)

    const showModal = () => {
        States.setter.showModal('jewelSelector', {
            target: target,
            equipType: equipType,
            idIndex: slotIndex,

            // filter
            size: slotSize
        })
    }

    const removeItem = () => {
        if ('playerEquips' === target) {
            States.setter.setPlayerEquipJewel(equipType, slotIndex, null)
        }
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

    const [stateMajorData, updateMajorData] = useState(null)
    const [stateMinorData, updateMinorData] = useState(null)

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
        let majorData = null
        let minorData = null

        if ('playerEquips' === target) {
            majorData = Helper.deepCopy(statePlayerEquips.charm)
            minorData = Helper.deepCopy(stateRequiredConditions.equips.charm)
        }

        if ('requiredConditions' === target) {
            majorData = Helper.deepCopy(stateRequiredConditions.equips.charm)
        }

        // Set Target
        majorData.target = target

        updateMajorData(majorData)
        updateMinorData(minorData)
    }, [
        target,
        statePlayerEquips,
        stateRequiredConditions
    ])

    return useMemo(() => {
        Helper.debug('Component: EquipsDisplayer -> CustomCharm')

        if (Helper.isEmpty(stateMajorData)) {
            return false
        }

        let isNotRequire = false

        if ('playerEquips' === stateMajorData.target) {
            if (Helper.isNotEmpty(stateMajorData.id)) {
                isNotRequire = Helper.jsonHash({
                    id: stateMajorData.id,
                    custom: stateMajorData.custom
                }) !== Helper.jsonHash({
                    id: stateMinorData.id,
                    custom: stateMinorData.custom
                })
            }
        }

        const removeItem = () => {
            if ('playerEquips' === stateMajorData.target) {
                States.setter.setPlayerEquip('charm', null)
            }

            if ('requiredConditions' === stateMajorData.target) {
                States.setter.setRequiredConditionsEquip('charm', null)
            }
        }

        // Set Class Names
        let classNames = [
            'mhrc-item'
        ]

        if ('playerEquips' === stateMajorData.target) {
            classNames.push('mhrc-item-3-step')
        }

        if ('requiredConditions' === stateMajorData.target) {
            classNames.push('mhrc-content')
        }

        // Get Equip Extend Item
        let equipExtendItem = Misc.getEquipExtendItem('charm', stateMajorData)

        return (
            <div key="customCharm" className={classNames.join(' ')}>
                <div className="col-12 mhrc-name">
                    <span>{_('customCharm')}</span>
                    <div className="mhrc-icons_bundle">
                        {('playerEquips' === stateMajorData.target && isNotRequire) ? (
                            <IconButton
                                iconName="arrow-left" altName={_('include')}
                                onClick={() => {
                                    States.setter.replaceRequiredConditionsEquipData('charm', stateMajorData)
                                }} />
                        ) : false}
                        <IconButton iconName="times" altName={_('clean')} onClick={removeItem} />
                    </div>
                </div>

                <div className="col-12 mhrc-content">
                    {stateMajorData.custom.slots.map((slotData, slotIndex) => {
                        return (
                            <Fragment key={slotIndex}>
                                <div className="col-3 mhrc-name">
                                    <span>{_('slot')}: {slotIndex + 1}</span>
                                </div>
                                <div className="col-3 mhrc-value">
                                    <BasicSelector
                                        defaultValue={getValue(stateMajorData.custom.slots[slotIndex].size, 'none')}
                                        options={getSlotSizeList()}
                                        onChange={(event) => {
                                            stateMajorData.custom.slots[slotIndex].size = ('none' !== event.target.value)
                                                ? parseInt(event.target.value, 10) : null

                                            // Clean Jewel
                                            if ('playerEquips' === stateMajorData.target) {
                                                States.setter.setPlayerEquipJewel('charm', slotIndex, null)
                                            }

                                            handleRefreshCustomDataset(stateMajorData)
                                        }} />
                                </div>

                                {('playerEquips' === stateMajorData.target) ? (
                                    <div className="col-6 mhrc-value">
                                        {Helper.isNotEmpty(stateMajorData.custom.slots[slotIndex].size) ? (
                                            renderJewelOption(
                                                stateMajorData.target,
                                                'charm',
                                                slotIndex,
                                                slotData.size,
                                                Helper.isNotEmpty(stateMajorData.jewelIds[slotIndex])
                                                    ? stateMajorData.jewelIds[slotIndex] : null
                                            )
                                        ) : false}
                                    </div>
                                ) : false}
                            </Fragment>
                        )
                    })}
                </div>

                <div className="col-12 mhrc-content">
                    {stateMajorData.custom.skills.map((skillData, skillIndex) => {
                        let skillItem = SkillDataset.getItem(skillData.id)
                        let skillLevel = Helper.isNotEmpty(skillItem) ? skillItem.list.length : null

                        return (
                            <Fragment key={skillIndex}>
                                <div className="col-3 mhrc-name">
                                    <span>{_('skill')}: {skillIndex + 1}</span>
                                </div>
                                <div className="col-6 mhrc-value">
                                    <BasicSelector
                                        defaultValue={getValue(stateMajorData.custom.skills[skillIndex].id, 'none')}
                                        options={getSkillList()}
                                        onChange={(event) => {
                                            stateMajorData.custom.skills[skillIndex].id = ('none' !== event.target.value)
                                                ? event.target.value : null

                                            handleRefreshCustomDataset(stateMajorData)
                                        }} />
                                </div>
                                <div className="col-3 mhrc-value">
                                    {Helper.isNotEmpty(stateMajorData.custom.skills[skillIndex].id) ? (
                                        <BasicSelector
                                            defaultValue={getValue(stateMajorData.custom.skills[skillIndex].level, 'none')}
                                            options={getSkillLevelList(skillLevel)}
                                            onChange={(event) => {
                                                stateMajorData.custom.skills[skillIndex].level = ('none' !== event.target.value)
                                                    ? parseInt(event.target.value, 10) : null

                                                handleRefreshCustomDataset(stateMajorData)
                                            }} />
                                    ) : false}
                                </div>
                            </Fragment>
                        )
                    })}
                </div>

                {('playerEquips' === stateMajorData.target
                    && Helper.isNotEmpty(equipExtendItem.skills)
                    && 0 !== equipExtendItem.skills.length
                ) ? (
                    <div className="col-12 mhrc-content">
                        <div className="col-12 mhrc-name">
                            <span>{_('skill')}</span>
                        </div>
                        <div className="col-12 mhrc-content">
                            {equipExtendItem.skills.sort((skillDataA, skillDataB) => {
                                return skillDataB.level - skillDataA.level
                            }).map((skillData) => {
                                let skillItem = SkillDataset.getItem(skillData.id)

                                return (Helper.isNotEmpty(skillItem)) ? (
                                    <div key={skillItem.id} className="col-6 mhrc-value">
                                        <span>{_(skillItem.name)} Lv.{skillData.level}</span>
                                    </div>
                                ) : false
                            })}
                        </div>
                    </div>
                ) : false}
            </div>
        )
    }, [
        stateMajorData,
        stateMinorData
    ])
}
