import React, { Component } from 'react'
import cn from 'classnames'

import { CarouselItemProps } from './CarouselItem'
import { debounce, scrollTo } from '../utils'

import classes from './Carousel.module.scss'

interface CarouselProps {
  children: CarouselItemProps[],
  scrollDelayMilliseconds?: number,
  scrollDebounceMilliseconds?: number,
  scrollInterval?: number,
  moveToListener?: Function,
  className?: string,
  type: 'menu' | 'carousel',
  style?: object,
  disable?: boolean,
  centerArrows?: boolean
}

type CarouselState = {
  elementWidth: number,
  carouselWidth: number | undefined,
  visibleWidth: number | undefined,
  minimumPosition: number,
  maximumPosition: number | undefined,
  showLeftButton: boolean,
  showRightButton: boolean
}

class Carousel extends Component<CarouselProps, CarouselState> {
  static defaultProps = {
    children: [],
    scrollDelayMilliseconds: 10,
    scrollDebounceMilliseconds: 100,
    scrollInterval: 300,
    type: "carousel"
  }

  state = {
    elementWidth: 0,
    carouselWidth: 0,
    visibleWidth: 0,
    minimumPosition: 0,
    maximumPosition: 0,
    showLeftButton: false,
    showRightButton: false
  }
  carouselElement: HTMLElement | null
  triggerStateUpdate: boolean

  componentDidMount() {
    // Listening to the resize event, to recalculate scroll positions and widths.
    window.addEventListener('resize', this.resizeEvent)
    if (!!this.props.children.length && this.carouselElement?.firstChild) {
      const calculatedState = this.recalculateState()

      this.setState(
        calculatedState
      )

      this.carouselScrollTo(calculatedState.minimumPosition, 'auto')
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeEvent)
  }

  componentDidUpdate(prevProps: CarouselProps) {
    if (this.triggerStateUpdate) {
      this.triggerStateUpdate = false
      this.setState(
        this.recalculateState()
      )
    } else {
      const currChildren = prevProps.children || []
      const nextChildren = this.props.children || []
      if (nextChildren.length !== currChildren.length) {
        this.triggerStateUpdate = true
      }
    }
  }

  moveToClickEvent(direction: string) {
    const {
      moveToListener
    } = this.props
    const {
      visibleWidth,
      // elementWidth
    } = this.state;
    if (moveToListener) {
      moveToListener(direction)
    }
    const newPosition = (this.carouselElement?.scrollLeft || 0) + (
      direction === 'left' ? -visibleWidth : visibleWidth
    )
    // const snappedPosition = newPosition - (
    //   direction === 'left' ? -(newPosition % (elementWidth)) : (newPosition % (elementWidth))
    // )
    this.moveTo(newPosition)
  }

  moveTo(newPosition: number) {
    // Short time-out to deal with the browser needing to recalculate positions
    setTimeout(() => {
      this.carouselScrollTo(newPosition, 'smooth')
    }, this.props.scrollDelayMilliseconds)
  }

  recalculateState():CarouselState  {
    const elementWidth = (this.carouselElement?.firstChild as HTMLElement)?.getBoundingClientRect().width,
      visibleWidth = this.carouselElement?.offsetWidth,
      carouselWidth = this.props.type === 'menu' ? this.carouselElement?.scrollWidth : this.props.children.length * elementWidth,
      lastChildRightEdge = (this.carouselElement?.lastChild as HTMLElement)?.getBoundingClientRect().right,
      visibleRightEdge = this.carouselElement?.getBoundingClientRect().right || 0,
      showLeftButton = !!this.carouselElement?.scrollLeft,
      showRightButton = (visibleRightEdge < lastChildRightEdge),
      minimumPosition = 0,
      maximumPosition = this.carouselElement?.scrollWidth

    return {
      elementWidth,
      carouselWidth,
      visibleWidth,
      minimumPosition,
      maximumPosition,
      showLeftButton,
      showRightButton
    }
  }

  carouselScrollTo(position: number, behavior:ScrollBehavior) {
    if (this.carouselElement) {
      if (typeof this.carouselElement.scrollTo !== 'undefined' &&
          'scrollBehavior' in document.documentElement.style) {
        this.carouselElement.scrollTo({
          left: position,
          behavior
        })
      } else {
        scrollTo(this.carouselElement, position, this.props.scrollInterval)
      }
    }
  }

  resizeEvent = debounce(() => {
      this.setState(
        this.recalculateState()
      )
    }, this.props.scrollDebounceMilliseconds)

  scrollEvent = () => {
    if (!this.props.disable) {
      const {
        maximumPosition,
        minimumPosition,
        visibleWidth
      } = this.state;
      const curPos = this.carouselElement?.scrollLeft || 0

      const hideButtonAfter = (maximumPosition - visibleWidth)
      this.setState({
        showLeftButton: (curPos > minimumPosition),
        showRightButton: (curPos < hideButtonAfter)
      })
    }
  }

  render() {
    const {
      disable,
      className,
      type,
      centerArrows,
      style
    } = this.props;
    const {
      showLeftButton,
      showRightButton
    } = this.state;

    const classNames = cn(classes.carousel, classes[type], {[classes.centerArrows]: centerArrows}, className)
    return (
      <div className={classNames} style={style}>
        {showLeftButton && !disable &&
          <button
            className={classes['left-button']}
            onClick={this.moveToClickEvent.bind(this, 'left')}
          >&lt;</button>
        }
        <ul ref={r => this.carouselElement = r } onScroll={this.scrollEvent}>
          {this.props.children}
        </ul>
        {showRightButton && !disable &&
          <button
            className={classes['right-button']}
            onClick={this.moveToClickEvent.bind(this, 'right')}
          >&gt;</button>
        }
      </div>
    )
  }
}

export default Carousel