import { Component } from '../components/component.mjs';
import { clamp, isNumber, noop } from '../utils/utils.mjs';
import { addMutator } from './utils.mjs';

const componentFuncs = {
    scrollUp: function (value = 1) {
        const {
            scrollY,
        } = this.simulatedScrollable;

        this.scrollToSmooth(0, scrollY - value);
    },
    scrollDown: function (value = 1) {
        const {
            scrollY,
        } = this.simulatedScrollable;

        this.scrollToSmooth(0, scrollY + value);
    },
    scrollToSmooth: function (x = 0, y = 0) {
        const {
            timeout,
            smoothTargetX,
            smoothTargetY,
            scrollX,
            scrollY,
        } = this.simulatedScrollable;

        if (timeout) {
            cancelAnimationFrame(timeout);
            this.simulatedScrollable.timeout = undefined;
            this.simulatedScrollable.timestampPrev = undefined;
        } else {
            this.simulatedScrollable.smoothCurrentX = 0;
            this.simulatedScrollable.smoothCurrentY = 0;
        }

        this.simulatedScrollable.dirY = scrollY - y;
        this.simulatedScrollable.smoothStartY = scrollY;
        this.simulatedScrollable.smoothTargetX = x;
        this.simulatedScrollable.smoothTargetY = y;

        this.simulatedScrollable.timeout = requestAnimationFrame(this._scrollStepSmooth);
    },
    scrollBySmooth: function (x = 0, y = 0) {
        const {
            timeout,
            scrollX,
            scrollY,
        } = this.simulatedScrollable;

        this.scrollToSmooth(scrollX + x, scrollY + y);
        return;
    },
    _scrollStepSmooth: function (timestamp) {
        if (!this.simulatedScrollable.timestampPrev) {
            this.simulatedScrollable.timestampPrev = timestamp;
            requestAnimationFrame(this._scrollStepSmooth);
            return;
        }

        const {
            speed,
            x,
            y,
            scrollY,
            smoothTargetX,
            smoothStartY,
            smoothTargetY,
            timestampPrev,
            timeout,
            marginY,
            manualMarginControl,
        } = this.simulatedScrollable;
        // let speed = 1;

        if (!y) {
            this.simulatedScrollable.y = 0;
        }

        const delta = (timestamp - timestampPrev) / 1000;

        const diffY = smoothStartY - smoothTargetY;

        let change = diffY * speed * delta;
        change *= -1;

        let newY = scrollY + change;
        let hasReachedEnd = false;
        // Scrolling down
        if (smoothStartY > smoothTargetY) {
            if (newY <= smoothTargetY) {
                newY = smoothTargetY;
                hasReachedEnd = true;
            }
        } else if (smoothStartY < smoothTargetY) {
            if (newY >= smoothTargetY) {
                newY = smoothTargetY;
                hasReachedEnd = true;
            }
        }
        else if (newY == smoothTargetY) {
            hasReachedEnd = true;
        }

        // this.setMarginY(marginY - change, true);
        this._setScrollY(newY);
        this.onScroll(0, this.simulatedScrollable.scrollY);

        if (hasReachedEnd) {
            this.simulatedScrollable.startTime = undefined;
            this.simulatedScrollable.timestampPrev = undefined;
            this.simulatedScrollable.smoothCurrentX = 0;
            this.simulatedScrollable.smoothCurrentY = 0;
            this.simulatedScrollable.smoothTargetX = 0;
            this.simulatedScrollable.smoothTargetX = 0;
            this.simulatedScrollable.smoothStartY = 0;
            cancelAnimationFrame(timeout);
            this.simulatedScrollable.timeout = undefined;
            return;
        }

        this.simulatedScrollable.timestampPrev = timestamp;
        this.simulatedScrollable.timeout = requestAnimationFrame(this._scrollStepSmooth);
    },
    _setScrollY: function (newScrollY) {
        const {
            min,
            max,
        } = simulatedScrollable;

        if (isNumber(min) && newScrollY < min) {
            newScrollY = min;
        }

        if (isNumber(max) && newScrollY > max) {
            newScrollY = max;
        }

        this.simulatedScrollable.scrollYPrev = this.simulatedScrollable.scrollY || 0;
        this.simulatedScrollable.scrollY = newScrollY;

        this._updateMarginY();
    },
    _updateMarginY: function () {
        const {
            scrollYPrev,
            scrollY,
            marginY,
        } = this.simulatedScrollable;

        const diff = scrollY - scrollYPrev;

        this.simulatedScrollable.marginY += diff;
    },
    setScrollY: function (value) {
        this.simulatedScrollable.scrollY = value;
    },
    setMarginY: function (value, updateScrollY = false) {
        const diff = this.simulatedScrollable.marginY - value;
        let newScrollY = this.simulatedScrollable.scrollY + diff;

        const {
            min, max,
        } = this.simulatedScrollable;

        let clampDiff = newScrollY - clamp(newScrollY, min, max);
        newScrollY -= clampDiff;

        if (newScrollY == this.simulatedScrollable.scrollY) {
            return;
        }

        this.simulatedScrollable.marginY = value + clampDiff;
        if (updateScrollY) {
            this.setScrollY(newScrollY);
        }
    },
    setScrollYMinMax: function (min, max) {
        this.simulatedScrollable.min = min;
        this.simulatedScrollable.max = max;
    },
    onScroll: noop,
}

const componentData = {
    id: 'simulatedScrollable',
    timeout: undefined,
    speed: 10,
    smoothCurrentX: 0,
    smoothCurrentY: 0,
    smoothTargetX: 0,
    smoothTargetY: 0,
    marginY: 0,
    // Keeps track of the total scroll, based on marginY.
    scrollY: 0,
    scrollYMin: undefined,
    scrollYMax: undefined,
    startPosition: 0,
    endPosition: 0,
    timestampPrev: undefined,
    manualMarginControl: true,
    x: 0,
    y: 0,
    dirY: 0,
}

/**
 * The purpose is to allow content to be "scrolled" beyond existing bounds.
 * 
 * This is useful for lazy-loaded content or partially rendered content.
 * 
 * Currently limited to the Y-Axis.
 * 
 * Requires:
 * - position: 'absolute'
 * 
 * @param {Component} component 
 * @param {*} settings 
 */
export function simulatedScrollable(component, settings) {
    if (component.isSimulatedScrollable) {
        return;
    }

    component.isSimulatedScrollable = true;

    addMutator(component, componentData, componentFuncs, settings);

    component.style.setProperty('top', '0px');
}
