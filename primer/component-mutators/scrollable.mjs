import { Component } from '../components/component.mjs';
import { getSearchableItemBank } from '../managers/searchable-item-bank.mjs';
import { addEventListener, isFunction, isInteger, isNotNumber, noop } from '../utils/utils.mjs';
import { addMutator } from './utils.mjs';

const componentFuncs = {
    scrollUp: function (value = 1) {
        this.scrollBySmooth(0, -value);
    },
    scrollDown: function (value = 1) {
        this.scrollBySmooth(0, value);
    },
    scrollSmooth: function (x = 0, y = 0) {
        const {
            timeout,
        } = this.scrollable;

        if (timeout) {
            cancelAnimationFrame(timeout);
            this.scrollable.timeout = undefined;
        } else {
            this.scrollable.currentX = 0;
            this.scrollable.currentY = 0;
        }

        this.scrollable.x = x;
        this.scrollable.y = y;
        this.scrollable.currentX = Math.abs(x);
        this.scrollable.currentY = Math.abs(y);
        this.scrollable.totalX = Math.abs(this.scrollable.currentX);
        this.scrollable.totalY = Math.abs(this.scrollable.currentY);

        requestAnimationFrame(this._scrollStep);
    },
    scrollBySmooth: function (x = 0, y = 0) {
        const {
            timeout,
        } = this.scrollable;

        if (timeout) {
            cancelAnimationFrame(timeout);
            this.scrollable.timeout = undefined;
        } else {
            this.scrollable.currentX = 0;
            this.scrollable.currentY = 0;
        }

        this.scrollable.x = x;
        this.scrollable.y = y;
        this.scrollable.currentX += Math.abs(x);
        this.scrollable.currentY += Math.abs(y);
        this.scrollable.totalX = Math.abs(this.scrollable.currentX);
        this.scrollable.totalY = Math.abs(this.scrollable.currentY);

        requestAnimationFrame(this._scrollStep);
    },
    _scrollStep: function (timestamp) {
        if (!this.scrollable.timestampPrev) {
            this.scrollable.timestampPrev = timestamp;
            requestAnimationFrame(this._scrollStep);
            return;
        }

        const {
            speed,
            x,
            y,
            totalX,
            totalY,
            timestampPrev,
            timeout,
        } = this.scrollable;

        const delta = (timestamp / timestampPrev) / (1000 / 60);

        const scaledSpeedY = speed * (totalY / 1000);

        const stepsY = totalY / (scaledSpeedY * delta);
        let sizeY = totalY / stepsY;
        if (isNotNumber(sizeY)) {
            sizeY = 0;
        }
        this.scrollable.currentY -= sizeY;
        if (y < 0) sizeY *= -1;

        if (sizeY == 0) {
            return;
        }

        this.scrollBy(0, sizeY);
        this.onScroll();

        if (this.scrollable.currentY <= 0) {
            this.scrollable.startTime = undefined;
            this.scrollable.timestampPrev = undefined;
            this.scrollable.currentX = 0;
            this.scrollable.currentY = 0;
            this.scrollable.totalX = 0;
            this.scrollable.totalX = 0;
            cancelAnimationFrame(timeout);
            this.scrollable.timeout = undefined;
            return;
        }

        this.scrollable.timestampPrev = timestamp;
        this.scrollable.timeout = requestAnimationFrame(this._scrollStep);
    },
    // () => {}
    onScroll: noop,
}

const componentData = {
    id: 'scrollable',
    timeout: undefined,
    speed: 2000,
    currentX: 0,
    currentY: 0,
    totalX: 0,
    totalY: 0,
    startPosition: 0,
    endPosition: 0,
    timestampPrev: undefined,
}

/**
 * Currently limited to the Y-Axis.
 * 
 * @param {Component} component 
 * @param {*} settings 
 * @returns 
 */
export function scrollable(component, settings) {
    if (component.isScrollable) {
        return;
    }

    component.isScrollable = true;

    addMutator(component, componentData, componentFuncs, settings);
}
