/**
 * Basic Input
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Libraries
import React, { useMemo } from 'react'

// Load Core Libraries
import Helper from 'core/helper'

export default function BasicInput(props) {
    const {defaultValue, placeholder, onChange, bypassRef} = props

    return useMemo(() => {
        Helper.debug('Component: Common -> BasicInput')

        return (
            <div className="mhrc-basic_input">
                <input className="mhrc-input" type="text" ref={bypassRef}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    onBlur={onChange}
                    onKeyPress={(event) => {
                        if (13 === event.charCode) {
                            onChange(event)
                        }
                    }} />
            </div>
        )
    }, [defaultValue, placeholder, onChange, bypassRef])
}
