/**
 * Condition Options: Equip List
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { Fragment, useState, useEffect, useMemo } from 'react'

// Load Core
import _ from 'core/lang'
import Helper from 'core/helper'

// Load Libraries
import Misc from 'libraries/misc'
import JewelDataset from 'libraries/dataset/petalace'

// Load Components
import IconButton from 'components/common/iconButton'

// Load States
import States from 'states'

/**
 * Render Functions
 */
const renderJewelOption = (equipType, slotIndex, slotSize, jewelId) => {

    // Get Jewel Item
    let jewelItem = JewelDataset.getItem(jewelId)

    const showModal = () => {
        States.setter.showModal('jewelSelector', {
            id: (Helper.isNotEmpty(jewelItem)) ? jewelItem.id : null,
            size: slotSize,

            // Bypass
            bypass: {
                target: 'requiredConditions',
                equipType: equipType,
                idIndex: slotIndex,
            }
        })
    }

    const removeItem = () => {
        States.setter.setPlayerEquipJewel(equipType, slotIndex, null)
    }

    return (
        <Fragment key={`${equipType}:${slotIndex}`}>
            <div className="col-3 mhrc-name">
                <span>{_('slot')}: {slotIndex + 1} [{slotSize}]</span>
            </div>
            <div className="col-9 mhrc-value">
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
            </div>
        </Fragment>
    )
}

const renderEquipItem = (equipType, requiredEquipData) => {
    if ('petalace' === equipType) {
        return false
    }

    let equipItem = Misc.getEquipItem(equipType, requiredEquipData)

    const showModal = () => {
        States.setter.showModal(Misc.equipTypeToDatasetType(equipType) + 'Selector', {
            id: (Helper.isNotEmpty(equipItem)) ? equipItem.id : null,
            type: equipType,

            // Bypass
            bypass: {
                target: 'requiredConditions',
                equipType: equipType
            }
        })
    }

    const removeItem = () => {
        States.setter.setRequiredConditionsEquip(equipType, null)
    }

    if (Helper.isEmpty(equipItem)) {
        return (
            <div key={equipType} className="col-12 mhrc-content">
                <div className="col-12 mhrc-name">
                    <span>{_(equipType)}</span>

                    <div className="mhrc-icons_bundle">
                        {'weapon' === equipType || 'charm' === equipType ? (
                            <IconButton
                                iconName="wrench" altName={_('customEquip')}
                                onClick={() => {
                                    States.setter.setRequiredConditionsEquip(equipType, 'custom')
                                }} />
                        ) : false}
                        {'charm' !== equipType ? (
                            <IconButton iconName="plus" altName={_('add')} onClick={showModal} />
                        ) : false}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div key={equipItem.id} className="col-12 mhrc-content">
            <div className="col-12 mhrc-name">
                <span>{_(equipType)}: {_(equipItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {'weapon' === equipType || 'charm' === equipType ? (
                        <IconButton
                            iconName="wrench" altName={_('customEquip')}
                            onClick={() => {
                                States.setter.setRequiredConditionsEquip(equipType, 'custom')
                            }} />
                    ) : false}
                    {'charm' !== equipType ? (
                        <IconButton iconName="exchange" altName={_('change')} onClick={showModal} />
                    ) : false}
                    <IconButton iconName="times" altName={_('clean')} onClick={removeItem} />
                </div>
            </div>

            {(Helper.isNotEmpty(equipItem.slots) && 0 !== equipItem.slots.length) ? (
                <div className="col-12 mhrc-content">
                    {equipItem.slots.map((slotData, slotIndex) => {
                        return renderJewelOption(
                            equipType,
                            slotIndex,
                            slotData.size,
                            Helper.isNotEmpty(requiredEquipData.jewelIds[slotIndex])
                                ? requiredEquipData.jewelIds[slotIndex] : null
                        )
                    })}
                </div>
            ) : false}

        </div>
    )
}

export default function EquipList (props) {

    /**
     * Hooks
     */
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateRequiredConditions(States.getter.getRequiredConditions())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return useMemo(() => {
        Helper.debug('Component: ConditionOptions -> EquipList')

        if (Helper.isEmpty(stateRequiredConditions.equips)) {
            return false
        }

        return (
            <div className="mhrc-item mhrc-item-3-step">
                <div className="col-12 mhrc-name">
                    <span>{_('equip')}</span>
                </div>

                {Object.keys(stateRequiredConditions.equips).map((equipType) => {
                    return renderEquipItem(equipType, stateRequiredConditions.equips[equipType])
                })}
            </div>
        )
    }, [stateRequiredConditions])
}
