/**
 * Bundle Item Selector
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

export default function BundleItemSelector(props) {

    /**
     * Hooks
     */
    const [stateIsShow, updateIsShow] = useState(States.getter.isShowBundleItemSelector())
    const [stateReservedBundles, updateReservedBundles] = useState(States.getter.getReservedBundles())
    const [stateCurrentEquips, updateCurrentEquips] = useState(States.getter.getCurrentEquips())
    const refModal = useRef()
    const refName = useRef()
    const refNameList = useRef(stateReservedBundles.map(() => createRef()))

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribeCommon = States.store.subscribe(() => {
            updateReservedBundles(States.getter.getReservedBundles())
            updateCurrentEquips(States.getter.getCurrentEquips())

            refNameList.current = States.getter.getReservedBundles().map(() => createRef())
        })

        const unsubscribeModal = States.store.subscribe(() => {
            updateIsShow(States.getter.isShowBundleItemSelector())
        })

        return () => {
            unsubscribeCommon()
            unsubscribeModal()
        }
    }, [])

    /**
     * Handle Functions
     */
    const handleFastWindowClose = useCallback((event) => {
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

                        let equipInfo = null

                        if ('weapon' === equipType) {
                            if ('customWeapon' === stateCurrentEquips[equipType].id) {
                                equipInfo = States.getter.getCustomWeapon()

                                return Helper.isNotEmpty(equipInfo) ? (
                                    <div key={equipType} className="col-6 mhrc-value">
                                        <span>{_(equipInfo.name)}: {_(equipInfo.type)}</span>
                                    </div>
                                ) : false
                            }

                            equipInfo = WeaponDataset.getInfo(stateCurrentEquips[equipType].id)
                        } else if ('helm' === equipType
                            || 'chest' === equipType
                            || 'arm' === equipType
                            || 'waist' === equipType
                            || 'leg' === equipType
                        ) {
                            equipInfo = ArmorDataset.getInfo(stateCurrentEquips[equipType].id)
                        } else if ('charm' === equipType) {
                            // equipInfo = CharmDataset.getInfo(stateCurrentEquips[equipType].id)
                        }

                        return Helper.isNotEmpty(equipInfo) ? (
                            <div key={index} className="col-6 mhrc-value">
                                <span>{_(equipInfo.name)}</span>
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

                        let equipInfo = null

                        if ('weapon' === equipType) {
                            if ('customWeapon' === data.equips[equipType].id) {
                                equipInfo = data.customWeapon

                                return Helper.isNotEmpty(equipInfo) ? (
                                    <div key={equipType} className="col-6 mhrc-value">
                                        <span>{_(equipInfo.name)}: {_(equipInfo.type)}</span>
                                    </div>
                                ) : false
                            }

                            equipInfo = WeaponDataset.getInfo(data.equips[equipType].id)
                        } else if ('helm' === equipType
                            || 'chest' === equipType
                            || 'arm' === equipType
                            || 'waist' === equipType
                            || 'leg' === equipType
                        ) {
                            equipInfo = ArmorDataset.getInfo(data.equips[equipType].id)
                        } else if ('charm' === equipType) {
                            // equipInfo = CharmDataset.getInfo(data.equips[equipType].id)
                        }

                        return Helper.isNotEmpty(equipInfo) ? (
                            <div key={index} className="col-6 mhrc-value">
                                <span>{_(equipInfo.name)}</span>
                            </div>
                        ) : false
                    })}
                </div>
            </div>
        )
    }

    return stateIsShow ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastWindowClose}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <span className="mhrc-title">{_('bundleList')}</span>

                    <div className="mhrc-icons_bundle">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={States.setter.hideBundleItemSelector} />
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
