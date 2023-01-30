/**
 * Basic Input
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useMemo } from 'react'

// Load Core
import Helper from '@/scripts/core/helper'

export default function BasicInput (props) {
    const {type, defaultValue, placeholder, onChange, bypassRef} = props

    let currentType = (Helper.isEmpty(type) || '' === type) ? 'text' : type

    return useMemo(() => {
        Helper.debug('Component: Common -> BasicInput')

        return (
            <div className="mhrc-basic_input">
                <input className="mhrc-input"
                    type={currentType}
                    ref={bypassRef}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    onChange={onChange} />
            </div>
        )
    }, [defaultValue, placeholder, onChange, bypassRef])
}
