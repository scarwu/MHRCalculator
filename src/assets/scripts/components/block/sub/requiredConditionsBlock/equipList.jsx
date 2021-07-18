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
import JewelDataset from 'libraries/dataset/jewel'

// Load Components
import IconButton from 'components/common/iconButton'
import CustomWeapon from 'components/common/customWeapon'
import CustomCharm from 'components/common/customCharm'

// Load States
import States from 'states'

/**
 * Render Functions
 */
const renderEquipItem = (equipType, requiredEquipData) => {
    if ('petalace' === equipType) {
        return false
    }

    let equipItem = Misc.getEquipItem(equipType, requiredEquipData)

    const showModal = () => {
        States.setter.showModal(Misc.equipTypeToDatasetType(equipType) + 'Selector', {
            target: 'requiredConditions',
            equipType: equipType
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
                                    States.setter.setRequiredConditionsEquip(equipType, 'custom' + Helper.ucfirst(equipType))
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
                                States.setter.setRequiredConditionsEquip(equipType, 'custom' + Helper.ucfirst(equipType))
                            }} />
                    ) : false}
                    {'charm' !== equipType ? (
                        <IconButton iconName="exchange" altName={_('change')} onClick={showModal} />
                    ) : false}
                    <IconButton iconName="times" altName={_('clean')} onClick={removeItem} />
                </div>
            </div>
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
                    if ('weapon' === Misc.equipTypeToDatasetType(equipType)
                        && 'customWeapon' === stateRequiredConditions.equips[equipType].id
                    ) {
                        return (
                            <CustomWeapon key="customWeapon" target="requiredConditions" />
                        )
                    }

                    if ('charm' === Misc.equipTypeToDatasetType(equipType)
                        && 'customCharm' === stateRequiredConditions.equips[equipType].id
                    ) {
                        return (
                            <CustomCharm key="customCharm" target="requiredConditions" />
                        )
                    }

                    return renderEquipItem(equipType, stateRequiredConditions.equips[equipType])
                })}
            </div>
        )
    }, [stateRequiredConditions])
}
