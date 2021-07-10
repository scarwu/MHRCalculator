/**
 * Sharpness Bar
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useMemo } from 'react'

// Load Core
import Helper from 'core/helper'

export default function SharpnessBar (props) {
    const {data} = props

    return useMemo(() => {
        Helper.debug('Component: Common -> SharpnessBar')

        return (
            <div className="mhrc-sharpness_bar">
                <div className="mhrc-steps">
                    {['red', 'orange', 'yellow', 'green', 'blue', 'white', 'purple'].map((step) => {
                        return (
                            <div key={step} className="mhrc-step" style={{
                                width: (data.steps[step] / 4) + '%'
                            }}></div>
                        )
                    })}
                </div>

                <div className="mhrc-mask" style={{
                    width: ((400 - data.value) / 4) + '%'
                }}></div>
            </div>
        )
    }, [data])
}
