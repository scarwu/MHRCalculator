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

// Load Custom Libraries
import JewelDataset from 'libraries/dataset/jewel'

// Load Components
import IconButton from 'components/common/iconButton'
import BasicSelector from 'components/common/basicSelector'
import BasicInput from 'components/common/basicInput'

// Load States
import States from 'states'

const getTypeList = () => {
    return [
        { key: 'greatSword',        value: _('greatSword') },
        { key: 'longSword',         value: _('longSword') },
        { key: 'swordAndShield',    value: _('swordAndShield') },
        { key: 'dualBlades',        value: _('dualBlades') },
        { key: 'hammer',            value: _('hammer') },
        { key: 'huntingHorn',       value: _('huntingHorn') },
        { key: 'lance',             value: _('lance') },
        { key: 'gunlance',          value: _('gunlance') },
        { key: 'switchAxe',         value: _('switchAxe') },
        { key: 'chargeBlade',       value: _('chargeBlade') },
        { key: 'insectGlaive',      value: _('insectGlaive') },
        { key: 'lightBowgun',       value: _('lightBowgun') },
        { key: 'heavyBowgun',       value: _('heavyBowgun') },
        { key: 'bow',               value: _('bow') }
    ]
}

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

const getSharpnessList = () => {
    return [
        { key: 'red',       value: _('red') },
        { key: 'orange',    value: _('orange') },
        { key: 'yellow',    value: _('yellow') },
        { key: 'green',     value: _('green') },
        { key: 'blue',      value: _('blue') },
        { key: 'white',     value: _('white') }
    ]
}

const getAttackElementList = () => {
    return [
        { key: 'none',      value: _('none') },
        { key: 'fire',      value: _('fire') },
        { key: 'water',     value: _('water') },
        { key: 'thunder',   value: _('thunder') },
        { key: 'ice',       value: _('ice') },
        { key: 'dragon',    value: _('dragon') }
    ]
}

const getStatusElementList = () => {
    return [
        { key: 'none',      value: _('none') },
        { key: 'poison',    value: _('poison') },
        { key: 'paralysis', value: _('paralysis') },
        { key: 'sleep',     value: _('sleep') },
        { key: 'blast',     value: _('blast') }
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

const getValue = (value) => {
    if (Helper.isEmpty(value)) {
        return 'none'
    }

    return value
}

const getSharpnessStep = (sharpness) => {
    if (Helper.isEmpty(sharpness)) {
        return 'none'
    }

    for (let step in sharpness.steps) {
        if (0 < sharpness.steps[step]) {
            return step
        }
    }
}

const getElementType = (element) => {
    if (Helper.isEmpty(element)) {
        return 'none'
    }

    return element.type
}

const getSlotSize = (slot) => {
    if (Helper.isEmpty(slot)) {
        return 'none'
    }

    return slot.size
}

const handleRefreshCustomDataset = (tempData) => {
    if ('playerEquips' === tempData.target) {
        States.setter.setPlayerEquipCustomDataset('weapon', tempData.custom)
    }

    if ('requiredConditions' === tempData.target) {
        States.setter.setRequiredConditionsEquipCustomDataset('weapon', tempData.custom)
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

export default function CustomWeapon (props) {
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
            tempData = Helper.deepCopy(statePlayerEquips.weapon)
        }

        if ('requiredConditions' === target) {
            tempData = Helper.deepCopy(stateRequiredConditions.equips.weapon)
        }

        // Set Target
        tempData.target = target

        updateTempData(tempData)
    }, [
        target,
        statePlayerEquips,
        stateRequiredConditions
    ])

    return useMemo(() => {
        Helper.debug('Component: EquipsDisplayer -> CustomWeapon')

        if (Helper.isEmpty(stateTempData)) {
            return false
        }

        // let currentEquip = stateCurrentEquips[equipType]
        // let requiredEquip = Helper.isNotEmpty(stateRequiredEquips[equipType])
        //     ? stateRequiredEquips[equipType] : null

        // let emptySelectorData = {
        //     equipType: equipType,
        //     equipId: null
        // }

        // let isNotRequire = true

        // if (Helper.isNotEmpty(requiredEquip)) {
        //     if ('weapon' === equipType) {
        //         isNotRequire = Helper.jsonHash({
        //             customWeapon: stateTempData.custom,
        //             enhances: currentEquip.enhances
        //         }) !== Helper.jsonHash({
        //             customWeapon: requiredEquip.customWeapon,
        //             enhances: requiredEquip.enhances
        //         })
        //     } else {
        //         isNotRequire = currentEquip.id !== requiredEquip.id
        //     }
        // }
        const showModal = () => {
            States.setter.showModal('weaponSelector', {
                target: stateTempData.target,
                equipType: 'weapon',

                // Filter
                type: 'weapon'
            })
        }

        const removeItem = () => {
            if ('playerEquips' === stateTempData.target) {
                States.setter.setPlayerEquip('weapon', null)
            }

            if ('requiredConditions' === stateTempData.target) {
                States.setter.setRequiredConditionsEquip('weapon', null)
            }
        }

        return (
            <div key="customWeapon" className="mhrc-item mhrc-item-3-step">
                <div className="col-12 mhrc-name">
                    <span>{_('customWeapon')}</span>

                    <div className="mhrc-icons_bundle">
                        {/* {isNotRequire ? (
                            <IconButton
                                iconName="arrow-left" altName={_('include')}
                                onClick={() => {States.setter.setRequiredEquips(equipType, stateTempData.custom)}} />
                        ) : false} */}
                        <IconButton iconName="exchange" altName={_('change')} onClick={showModal} />
                        <IconButton iconName="times" altName={_('clean')} onClick={removeItem} />
                    </div>
                </div>

                <div className="col-12 mhrc-content">
                    <div className="col-3 mhrc-name">
                        <span>{_('type')}</span>
                    </div>
                    <div className="col-9 mhrc-value">
                        <BasicSelector
                            defaultValue={getValue(stateTempData.custom.type)}
                            options={getTypeList()}
                            onChange={(event) => {
                                stateTempData.custom.type = ('none' !== event.target.value)
                                    ? event.target.value : null

                                handleRefreshCustomDataset(stateTempData)
                            }} />
                    </div>

                    <div className="col-3 mhrc-name">
                        <span>{_('rare')}</span>
                    </div>
                    <div className="col-3 mhrc-value">
                        <BasicSelector
                            defaultValue={getValue(stateTempData.custom.rare)}
                            options={getRareList()}
                            onChange={(event) => {
                                stateTempData.custom.rare = ('none' !== event.target.value)
                                    ? parseInt(event.target.value, 10) : null

                                handleRefreshCustomDataset(stateTempData)
                            }} />
                    </div>

                    <div className="col-3 mhrc-name">
                        <span>{_('attack')}</span>
                    </div>
                    <div className="col-3 mhrc-value">
                        <BasicInput
                            key={stateTempData.custom.attack}
                            defaultValue={stateTempData.custom.attack}
                            onChange={(event) => {
                                stateTempData.custom.attack = ('' !== event.target.value)
                                    ? parseInt(event.target.value, 10) : 0

                                handleRefreshCustomDataset(stateTempData)
                            }} />
                    </div>

                    <div className="col-3 mhrc-name">
                        <span>{_('sharpness')}</span>
                    </div>
                    <div className="col-3 mhrc-value">
                        {(-1 === ['lightBowgun', 'heavyBowgun', 'bow'].indexOf(stateTempData.custom.type)) ? (
                            <BasicSelector
                                defaultValue={getSharpnessStep(stateTempData.custom.sharpness)}
                                options={getSharpnessList()} onChange={(event) => {
                                    let targetStep = ('none' !== event.target.value)
                                        ? event.target.value : null

                                    Object.keys(stateTempData.custom.sharpness.steps).forEach((step) => {
                                        stateTempData.custom.sharpness.steps[step] = (step === targetStep)
                                            ? 400 : 0
                                    })

                                    handleRefreshCustomDataset(stateTempData)
                                }} />
                        ) : false}
                    </div>

                    <div className="col-3 mhrc-name">
                        <span>{_('criticalRate')}</span>
                    </div>
                    <div className="col-3 mhrc-value">
                        <BasicInput
                            key={stateTempData.custom.criticalRate}
                            defaultValue={stateTempData.custom.criticalRate}
                            onChange={(event) => {
                                stateTempData.custom.criticalRate = ('' !== event.target.value)
                                    ? parseInt(event.target.value, 10) : 0

                                handleRefreshCustomDataset(stateTempData)
                            }} />
                    </div>

                    <div className="col-3 mhrc-name">
                        <span>{_('defense')}</span>
                    </div>
                    <div className="col-3 mhrc-value">
                        <BasicInput
                            key={stateTempData.custom.defense}
                            defaultValue={stateTempData.custom.defense}
                            onChange={(event) => {
                                stateTempData.custom.defense = ('' !== event.target.value)
                                    ? parseInt(event.target.value, 10) : 0

                                handleRefreshCustomDataset(stateTempData)
                            }} />
                    </div>
                </div>

                <div className="col-12 mhrc-content">
                    <div className="col-3 mhrc-name">
                        <span>{_('element')}: 1</span>
                    </div>
                    <div className="col-3 mhrc-value">
                        <BasicSelector
                            defaultValue={getElementType(stateTempData.custom.element.attack.type)}
                            options={getAttackElementList()}
                            onChange={(event) => {
                                stateTempData.custom.element.attack.type = ('' !== event.target.value)
                                    ? event.target.value : null

                                handleRefreshCustomDataset(stateTempData)
                            }} />
                    </div>
                    <div className="col-6 mhrc-value">
                        {('none' !== getElementType(stateTempData.custom.element.attack)) ? (
                            <BasicInput
                                key={stateTempData.custom.element.attack.minValue}
                                defaultValue={stateTempData.custom.element.attack.minValue}
                                onChange={(event) => {
                                    stateTempData.custom.element.attack.value = ('' !== event.target.value)
                                        ? parseInt(event.target.value, 10) : 0

                                    handleRefreshCustomDataset(stateTempData)
                                }} />
                        ) : false}
                    </div>

                    <div className="col-3 mhrc-name">
                        <span>{_('element')}: 2</span>
                    </div>
                    <div className="col-3 mhrc-value">
                        <BasicSelector
                            defaultValue={getElementType(stateTempData.custom.element.status.type)}
                            options={getStatusElementList()}
                            onChange={(event) => {
                                stateTempData.custom.element.status.type = ('' !== event.target.value)
                                    ? event.target.value : null

                                handleRefreshCustomDataset(stateTempData)
                            }} />
                    </div>
                    <div className="col-6 mhrc-value">
                        {('none' !== getElementType(stateTempData.custom.element.status)) ? (
                            <BasicInput
                                key={stateTempData.custom.element.status.minValue}
                                defaultValue={stateTempData.custom.element.status.minValue}
                                onChange={(event) => {
                                    stateTempData.custom.element.status.value = ('' !== event.target.value)
                                        ? parseInt(event.target.value, 10) : 0

                                    handleRefreshCustomDataset(stateTempData)
                                }} />
                        ) : false}
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
                                            'weapon',
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
            </div>
        )
    }, [ stateTempData ])
}
