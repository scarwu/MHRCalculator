/**
 * Player Equip Selector Modal
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useState, useEffect, useCallback, useRef, createRef } from 'react'
import md5 from 'md5'

// Load Core
import _ from 'core/lang'
import Helper from 'core/helper'

// Load Libraries
import WeaponDataset from 'libraries/dataset/weapon'
import ArmorDataset from 'libraries/dataset/armor'
// import CharmDataset from 'libraries/dataset/charm'

// Load Components
import IconButton from 'components/common/iconButton'
import BasicInput from 'components/common/basicInput'

// Load States
import States from 'states'

export default function PlayerEquipSelectorModal(props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('playerEquipSelector'))
    const [stateReservedBundles, updateReservedBundles] = useState(States.getter.getReservedBundles())
    const [stateCurrentEquips, updateCurrentEquips] = useState(States.getter.getCurrentEquips())
    const refModal = useRef()
    const refName = useRef()
    const refNameList = useRef(stateReservedBundles.map(() => createRef()))

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('playerEquipSelector'))
            updateReservedBundles(States.getter.getReservedBundles())
            updateCurrentEquips(States.getter.getCurrentEquips())

            refNameList.current = States.getter.getReservedBundles().map(() => createRef())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    /**
     * Handle Functions
     */
    const handleFastClose = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideBundleItemSelector()
    }, [])

    const handleBundleSave = useCallback((index) => {
        let name = Helper.isNotEmpty(index)
            ? refNameList.current[index].current.value
            : refName.current.value

        if (0 === name.length) {
            return
        }

        if (Helper.isNotEmpty(index)) {
            States.setter.updateReservedBundleName(index, name)
        } else {
            let customWeapon = null

            if (Helper.isNotEmpty(stateCurrentEquips.weapon)
                && 'customWeapon' === stateCurrentEquips.weapon.id
            ) {
                customWeapon = States.getter.getCustomWeapon()
            }

            States.setter.addReservedBundle({
                id: md5(JSON.stringify(stateCurrentEquips)),
                name: name,
                equips: stateCurrentEquips,
                customWeapon: customWeapon
            })
        }
    }, [stateCurrentEquips])

    const handleBundlePickUp = useCallback((index) => {
        if (Helper.isNotEmpty(stateReservedBundles[index].customWeapon)) {
            States.setter.replaceCustomWeapon(stateReservedBundles[index].customWeapon)
        }

        States.setter.replaceCurrentEquips(stateReservedBundles[index].equips)

        States.setter.hideBundleItemSelector()
    }, [stateReservedBundles])

    /**
     * Render Functions
     */
    let renderDefaultItem = () => {
        if (Helper.isEmpty(stateCurrentEquips.weapon.id)
            && Helper.isEmpty(stateCurrentEquips.helm.id)
            && Helper.isEmpty(stateCurrentEquips.chest.id)
            && Helper.isEmpty(stateCurrentEquips.arm.id)
            && Helper.isEmpty(stateCurrentEquips.waist.id)
            && Helper.isEmpty(stateCurrentEquips.leg.id)
            && Helper.isEmpty(stateCurrentEquips.charm.id)
        ) {
            return false
        }

        let bundleId = md5(JSON.stringify(stateCurrentEquips))

        for (let index in stateReservedBundles) {
            if (bundleId === stateReservedBundles[index].id) {
                return false
            }
        }

        return (
            <div key={bundleId} className="mhrc-item mhrc-item-2-step">
                <div className="col-12 mhrc-name">
                    <BasicInput placeholder={_('inputName')} bypassRef={refName} />

                    <div className="mhrc-icons_bundle">
                        <IconButton
                            iconName="floppy-o" altName={_('save')}
                            onClick={() => {handleBundleSave(null)}} />
                    </div>
                </div>

                <div className="col-12 mhrc-content">
                    {Object.keys(stateCurrentEquips).map((equipType, index) => {
                        if (Helper.isEmpty(stateCurrentEquips[equipType])) {
                            return false
                        }

                        let equipItem = null

                        if ('weapon' === equipType) {
                            if ('customWeapon' === stateCurrentEquips[equipType].id) {
                                equipItem = States.getter.getCustomWeapon()

                                return Helper.isNotEmpty(equipItem) ? (
                                    <div key={equipType} className="col-6 mhrc-value">
                                        <span>{_(equipItem.name)}: {_(equipItem.type)}</span>
                                    </div>
                                ) : false
                            }

                            equipItem = WeaponDataset.getItem(stateCurrentEquips[equipType].id)
                        } else if ('helm' === equipType
                            || 'chest' === equipType
                            || 'arm' === equipType
                            || 'waist' === equipType
                            || 'leg' === equipType
                        ) {
                            equipItem = ArmorDataset.getItem(stateCurrentEquips[equipType].id)
                        } else if ('charm' === equipType) {
                            // equipItem = CharmDataset.getItem(stateCurrentEquips[equipType].id)
                        }

                        return Helper.isNotEmpty(equipItem) ? (
                            <div key={index} className="col-6 mhrc-value">
                                <span>{_(equipItem.name)}</span>
                            </div>
                        ) : false
                    })}
                </div>
            </div>
        )
    }

    let renderItem = (data, index) => {
        return (
            <div key={`${data.id}:${index}`} className="mhrc-item mhrc-item-2-step">
                <div className="col-12 mhrc-name">
                    <BasicInput placeholder={_('inputName')} defaultValue={data.name}
                        bypassRef={refNameList.current[index]} />

                    <div className="mhrc-icons_bundle">
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => {handleBundlePickUp(index)}} />
                        <IconButton
                            iconName="times" altName={_('remove')}
                            onClick={() => {States.setter.removeReservedBundle(index)}} />
                        <IconButton
                            iconName="floppy-o" altName={_('save')}
                            onClick={() => {handleBundleSave(index)}} />
                    </div>
                </div>
                <div className="col-12 mhrc-content">
                    {Object.keys(data.equips).map((equipType, index) => {
                        if (Helper.isEmpty(data.equips[equipType])) {
                            return false
                        }

                        let equipItem = null

                        if ('weapon' === equipType) {
                            if ('customWeapon' === data.equips[equipType].id) {
                                equipItem = data.customWeapon

                                return Helper.isNotEmpty(equipItem) ? (
                                    <div key={equipType} className="col-6 mhrc-value">
                                        <span>{_(equipItem.name)}: {_(equipItem.type)}</span>
                                    </div>
                                ) : false
                            }

                            equipItem = WeaponDataset.getItem(data.equips[equipType].id)
                        } else if ('helm' === equipType
                            || 'chest' === equipType
                            || 'arm' === equipType
                            || 'waist' === equipType
                            || 'leg' === equipType
                        ) {
                            equipItem = ArmorDataset.getItem(data.equips[equipType].id)
                        } else if ('charm' === equipType) {
                            // equipItem = CharmDataset.getItem(data.equips[equipType].id)
                        }

                        return Helper.isNotEmpty(equipItem) ? (
                            <div key={index} className="col-6 mhrc-value">
                                <span>{_(equipItem.name)}</span>
                            </div>
                        ) : false
                    })}
                </div>
            </div>
        )
    }

    return Helper.isNotEmpty(stateModalData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastClose}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <span className="mhrc-title">{_('bundleList')}</span>

                    <div className="mhrc-icons_bundle">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => {
                                States.setter.hideModal('playerEquipSelector')
                            }} />
                    </div>
                </div>
                <div className="mhrc-list">
                    <div className="mhrc-wrapper">
                        {renderDefaultItem()}
                        {stateReservedBundles.map(renderItem)}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}
