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
import Misc from 'libraries/misc'
import JewelDataset from 'libraries/dataset/jewel'
import SkillDataset from 'libraries/dataset/skill'

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

const getValue = (value, defaultValue = '') => {
    if (Helper.isEmpty(value)) {
        return defaultValue
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

const handleRefreshCustomDataset = (majorData) => {
    if ('playerEquips' === majorData.target) {
        States.setter.setPlayerEquipCustomDataset('weapon', majorData.custom)
    }

    if ('requiredConditions' === majorData.target) {
        States.setter.setRequiredConditionsEquipCustomDataset('weapon', majorData.custom)
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

        if ('requiredConditions' === target) {
            States.setter.setRequiredConditionsEquipJewel(equipType, slotIndex, null)
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

export default function CustomWeapon (props) {
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
            majorData = Helper.deepCopy(statePlayerEquips.weapon)
            minorData = Helper.deepCopy(stateRequiredConditions.equips.weapon)
        }

        if ('requiredConditions' === target) {
            majorData = Helper.deepCopy(stateRequiredConditions.equips.weapon)
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
        Helper.debug('Component: EquipsDisplayer -> CustomWeapon')

        if (Helper.isEmpty(stateMajorData)) {
            return false
        }

        let isNotRequire = true

        if ('playerEquips' === stateMajorData.target) {
            if (('weapon' === stateMajorData.type || 'charm' === stateMajorData.type)
                && ('customWeapon' === stateMajorData.id || 'customCharm' === stateMajorData.id)
                && ('customWeapon' === stateMinorData.id || 'customCharm' === stateMinorData.id)
            ) {
                isNotRequire = Helper.jsonHash({
                    id: stateMajorData.id,
                    jewelIds: stateMajorData.jewelIds,
                    custom: stateMajorData.custom
                }) !== Helper.jsonHash({
                    id: stateMinorData.id,
                    jewelIds: stateMinorData.jewelIds,
                    custom: stateMinorData.custom
                })
            } else {
                isNotRequire = Helper.jsonHash({
                    id: stateMajorData.id,
                    jewelIds: stateMajorData.jewelIds
                }) !== Helper.jsonHash({
                    id: stateMinorData.id,
                    jewelIds: stateMinorData.jewelIds
                })
            }
        }

        const showModal = () => {
            States.setter.showModal('weaponSelector', {
                target: stateMajorData.target,
                equipType: 'weapon',

                // Filter
                type: 'weapon'
            })
        }

        const removeItem = () => {
            if ('playerEquips' === stateMajorData.target) {
                States.setter.setPlayerEquip('weapon', null)
            }

            if ('requiredConditions' === stateMajorData.target) {
                States.setter.setRequiredConditionsEquip('weapon', null)
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
        let equipExtendItem = Misc.getEquipExtendItem('weapon', stateMajorData)

        return (
            <div key="customWeapon" className={classNames.join(' ')}>
                <div className="col-12 mhrc-name">
                    <span>{_('customWeapon')}</span>

                    <div className="mhrc-icons_bundle">
                        {('playerEquips' === stateMajorData.target && isNotRequire) ? (
                            <IconButton
                                iconName="arrow-left" altName={_('include')}
                                onClick={() => {
                                    States.setter.replaceRequiredConditionsEquipData('weapon', stateMajorData)
                                }} />
                        ) : false}
                        <IconButton iconName="exchange" altName={_('change')} onClick={showModal} />
                        <IconButton iconName="times" altName={_('clean')} onClick={removeItem} />
                    </div>
                </div>

                {'playerEquips' === stateMajorData.target ? (
                    <Fragment>
                        <div className="col-12 mhrc-content">
                            <div className="col-3 mhrc-name">
                                <span>{_('type')}</span>
                            </div>
                            <div className="col-9 mhrc-value">
                                <BasicSelector
                                    defaultValue={getValue(stateMajorData.custom.type, 'none')}
                                    options={getTypeList()}
                                    onChange={(event) => {
                                        stateMajorData.custom.type = ('none' !== event.target.value)
                                            ? event.target.value : null

                                        handleRefreshCustomDataset(stateMajorData)
                                    }} />
                            </div>

                            <div className="col-3 mhrc-name">
                                <span>{_('rare')}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                <BasicSelector
                                    defaultValue={getValue(stateMajorData.custom.rare, 'none')}
                                    options={getRareList()}
                                    onChange={(event) => {
                                        stateMajorData.custom.rare = ('none' !== event.target.value)
                                            ? parseInt(event.target.value, 10) : null

                                        handleRefreshCustomDataset(stateMajorData)
                                    }} />
                            </div>

                            <div className="col-3 mhrc-name">
                                <span>{_('attack')}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                <BasicInput
                                    key={stateMajorData.custom.attack}
                                    type="number"
                                    defaultValue={getValue(stateMajorData.custom.attack, '')}
                                    onChange={(event) => {
                                        stateMajorData.custom.attack = ('' !== event.target.value)
                                            ? parseInt(event.target.value, 10) : 0

                                        handleRefreshCustomDataset(stateMajorData)
                                    }} />
                            </div>

                            <div className="col-3 mhrc-name">
                                <span>{_('sharpness')}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                {(-1 === ['lightBowgun', 'heavyBowgun', 'bow'].indexOf(stateMajorData.custom.type)) ? (
                                    <BasicSelector
                                        defaultValue={getSharpnessStep(stateMajorData.custom.sharpness)}
                                        options={getSharpnessList()} onChange={(event) => {
                                            let targetStep = ('none' !== event.target.value)
                                                ? event.target.value : null

                                            Object.keys(stateMajorData.custom.sharpness.steps).forEach((step) => {
                                                stateMajorData.custom.sharpness.steps[step] = (step === targetStep)
                                                    ? 400 : 0
                                            })

                                            handleRefreshCustomDataset(stateMajorData)
                                        }} />
                                ) : false}
                            </div>

                            <div className="col-3 mhrc-name">
                                <span>{_('criticalRate')}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                <BasicInput
                                    key={stateMajorData.custom.criticalRate}
                                    type="number"
                                    defaultValue={getValue(stateMajorData.custom.criticalRate, '')}
                                    onChange={(event) => {
                                        stateMajorData.custom.criticalRate = ('' !== event.target.value)
                                            ? parseInt(event.target.value, 10) : 0

                                        handleRefreshCustomDataset(stateMajorData)
                                    }} />
                            </div>

                            <div className="col-3 mhrc-name">
                                <span>{_('defense')}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                <BasicInput
                                    key={stateMajorData.custom.defense}
                                    type="number"
                                    defaultValue={getValue(stateMajorData.custom.defense, '')}
                                    onChange={(event) => {
                                        stateMajorData.custom.defense = ('' !== event.target.value)
                                            ? parseInt(event.target.value, 10) : 0

                                        handleRefreshCustomDataset(stateMajorData)
                                    }} />
                            </div>
                        </div>

                        <div className="col-12 mhrc-content">
                            <div className="col-3 mhrc-name">
                                <span>{_('element')}: 1</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                <BasicSelector
                                    defaultValue={getValue(stateMajorData.custom.element.attack.type, 'none')}
                                    options={getAttackElementList()}
                                    onChange={(event) => {
                                        stateMajorData.custom.element.attack.type = ('none' !== event.target.value)
                                            ? event.target.value : null

                                        handleRefreshCustomDataset(stateMajorData)
                                    }} />
                            </div>
                            <div className="col-6 mhrc-value">
                                {Helper.isNotEmpty(stateMajorData.custom.element.attack.type) ? (
                                    <BasicInput
                                        key={stateMajorData.custom.element.attack.value}
                                        type="number"
                                        defaultValue={getValue(stateMajorData.custom.element.attack.value, '')}
                                        onChange={(event) => {
                                            stateMajorData.custom.element.attack.value = ('' !== event.target.value)
                                                ? parseInt(event.target.value, 10) : null

                                            handleRefreshCustomDataset(stateMajorData)
                                        }} />
                                ) : false}
                            </div>

                            <div className="col-3 mhrc-name">
                                <span>{_('element')}: 2</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                <BasicSelector
                                    defaultValue={getValue(stateMajorData.custom.element.status.type, 'none')}
                                    options={getStatusElementList()}
                                    onChange={(event) => {
                                        stateMajorData.custom.element.status.type = ('none' !== event.target.value)
                                            ? event.target.value : null

                                        handleRefreshCustomDataset(stateMajorData)
                                    }} />
                            </div>
                            <div className="col-6 mhrc-value">
                                {Helper.isNotEmpty(stateMajorData.custom.element.status.type) ? (
                                    <BasicInput
                                        key={stateMajorData.custom.element.status.value}
                                        type="number"
                                        defaultValue={getValue(stateMajorData.custom.element.status.value, '')}
                                        onChange={(event) => {
                                            stateMajorData.custom.element.status.value = ('' !== event.target.value)
                                                ? parseInt(event.target.value, 10) : null

                                            handleRefreshCustomDataset(stateMajorData)
                                        }} />
                                ) : false}
                            </div>
                        </div>
                    </Fragment>
                ) : false}

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
                                                States.setter.setPlayerEquipJewel('weapon', slotIndex, null)
                                            }

                                            if ('requiredConditions' === stateMajorData.target) {
                                                States.setter.setRequiredConditionsEquipJewel('weapon', slotIndex, null)
                                            }

                                            handleRefreshCustomDataset(stateMajorData)
                                        }} />
                                </div>
                                <div className="col-6 mhrc-value">
                                    {Helper.isNotEmpty(stateMajorData.custom.slots[slotIndex].size) ? (
                                        renderJewelOption(
                                            stateMajorData.target,
                                            'weapon',
                                            slotIndex,
                                            slotData.size,
                                            Helper.isNotEmpty(stateMajorData.jewelIds[slotIndex])
                                                ? stateMajorData.jewelIds[slotIndex] : null
                                        )
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
