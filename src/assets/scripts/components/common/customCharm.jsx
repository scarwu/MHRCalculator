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

const getRareList = () => {
    return [
        { key: 1,   value: 1 },
        { key: 2,   value: 2 },
        { key: 3,   value: 3 },
        { key: 4,   value: 4 },
        { key: 5,   value: 5 },
        { key: 6,   value: 6 },
        { key: 7,   value: 7 }
    ]
}

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
        ...SkillDataset.getItems().filter((skillInfo) => {
            return skillInfo.from.charm
        }).map((skillInfo) => {
            return { key: skillInfo.id, value: _(skillInfo.name) }
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

const handleRefreshCustomDataset = (tempData) => {
    if ('playerEquips' === tempData.target) {
        States.setter.setPlayerEquipCustomDataset('charm', tempData.custom)
    }

    if ('requiredConditions' === tempData.target) {
        States.setter.setRequiredConditionsEquipCustomDataset('charm', tempData.custom)
    }
}

const handleItemPickUp = (itemId, tempData) => {
    if ('playerEquips' === tempData.target) {
        States.setter.setPlayerEquipJewel('charm', tempData.idIndex, itemId)
    }

    if ('requiredConditions' === tempData.target) {
        States.setter.setRequiredConditionsEquipJewel('charm', tempData.idIndex, itemId)
    }
}

/**
 * Render Functions
 */
const renderJewelOption = (equipType, slotIndex, slotSize, jewelInfo) => {
    let selectorData = {
        equipType: equipType,
        slotIndex: slotIndex,
        slotSize: slotSize,
        jewelId: (Helper.isNotEmpty(jewelInfo)) ? jewelInfo.id : null
    }

    let emptySelectorData = {
        equipType: equipType,
        slotIndex: slotIndex,
        slotSize: slotSize,
        jewelId: null
    }

    if (Helper.isEmpty(jewelInfo)) {
        return (
            <div key={`${equipType}:${slotIndex}:${slotSize}`} className="mhrc-icons_bundle">
                <IconButton
                    iconName="plus" altName={_('add')}
                    onClick={() => {States.setter.showEquipItemSelector(selectorData)}} />
            </div>
        )
    }

    return (
        <Fragment key={`${equipType}:${slotIndex}:${slotSize}`}>
            <span>[{jewelInfo.size}] {_(jewelInfo.name)}</span>
            <div className="mhrc-icons_bundle">
                <IconButton
                    iconName="exchange" altName={_('change')}
                    onClick={() => {States.setter.showEquipItemSelector(selectorData)}} />
                <IconButton
                    iconName="times" altName={_('clean')}
                    onClick={() => {States.setter.setCurrentEquip(emptySelectorData)}} />
            </div>
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
                    {/* {[...Array(stateTempData.custom.slots.length + 1 <= 3
                        ? stateTempData.custom.slots.length + 1 : 3).keys()].map((index) => {
                        return (
                            <Fragment key={index}>
                                <div className="col-3 mhrc-name">
                                    <span>{_('slot')}: {index + 1}</span>
                                </div>
                                <div className="col-3 mhrc-value">
                                    <BasicSelector
                                        defaultValue={getSlotSize(stateTempData.custom.slots[index])}
                                        options={getSlotSizeList()} onChange={(event) => {
                                            let value = ('none' !== event.target.value)
                                                ? parseInt(event.target.value, 10) : null

                                            States.setter.setCustomCharmSlot(index, value)
                                        }} />
                                </div>
                                <div className="col-6 mhrc-value">
                                    {('none' !== getSlotSize(stateTempData.custom.slots[index])) ? (
                                        renderJewelOption(
                                            equipType, index,
                                            getSlotSize(stateTempData.custom.slots[index]),
                                            JewelDataset.getInfo(currentEquip.slotIds[index])
                                        )
                                    ) : false}
                                </div>
                            </Fragment>
                        )
                    })} */}
                </div>

                <div className="col-12 mhrc-content">
                    {/* <div className="col-3 mhrc-name">
                        <span>{_('skill')}</span>
                    </div>
                    <div className="col-9 mhrc-value">
                        <BasicSelector
                            defaultValue={getSkillId(stateTempData.custom.skills[0])}
                            options={getSkillList()} onChange={(event) => {
                                let value = ('none' !== event.target.value)
                                    ? event.target.value : null

                                States.setter.setCustomCharmSkill(0, value)
                            }} />
                    </div> */}
                </div>
            </div>
        )
    }, [ stateTempData ])
}
