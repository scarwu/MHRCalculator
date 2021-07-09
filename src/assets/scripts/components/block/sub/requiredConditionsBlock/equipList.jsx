/**
 * Condition Options: Equip List
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useState, useEffect, useMemo } from 'react'

// Load Core
import _ from 'core/lang'
import Helper from 'core/helper'

// Load Libraries
import Misc from 'libraries/misc'
import WeaponDataset from 'libraries/dataset/weapon'
import ArmorDataset from 'libraries/dataset/armor'
import PetalaceDataset from 'libraries/dataset/petalace'
// import CharmDataset from 'libraries/dataset/charm'

// Load Components
import IconButton from 'components/common/iconButton'

// Load States
import States from 'states'

/**
 * Render Functions
 */
const renderEquipItem = (equipType, requiredEquipData) => {
    if (Helper.isEmpty(requiredEquipData)) {
        return false
    }

    let equipItem = null

    if ('weapon' === equipType) {
        if ('customWeapon' === requiredEquipData.id) {
            return (
                <div key={requiredEquipData.id} className="col-12 mhrc-content">
                    <div className="col-4 mhrc-name">
                        <span>{_(equipType)}</span>
                    </div>
                    <div className="col-8 mhrc-value">
                        <span>{_('customWeapon')}: {_(requiredEquipData.customWeapon.type)}</span>

                        <div className="mhrc-icons_bundle">
                            <IconButton
                                iconName="times" altName={_('clean')}
                                onClick={() => {States.setter.setRequiredConditions.equips(equipType, null)}} />
                        </div>
                    </div>
                </div>
            )
        }

        equipItem = WeaponDataset.getItem(requiredEquipData.id)
    } else if ('helm' === equipType
        || 'chest' === equipType
        || 'arm' === equipType
        || 'waist' === equipType
        || 'leg' === equipType
    ) {
        equipItem = ArmorDataset.getItem(requiredEquipData.id)
    } else if ('petalace' === equipType) {
        equipItem = PetalaceDataset.getItem(requiredEquipData.id)
    } else if('charm' === equipType) {
        // equipItem = CharmDataset.getItem(requiredEquipData.id)
    } else {
        return false
    }

    if (Helper.isEmpty(equipItem)) {
        return false
    }

    return (
        <div key={equipItem.id} className="col-12 mhrc-content">
            <div className="col-4 mhrc-name">
                <span>{_(equipType)}</span>
            </div>
            <div className="col-8 mhrc-value">
                <span>{_(equipItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {
                            States.setter.setRequiredConditionsEquip(equipType, null)
                        }} />
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
                    return renderEquipItem(equipType, stateRequiredConditions.equips[equipType])
                })}
            </div>
        )
    }, [stateRequiredConditions])
}
