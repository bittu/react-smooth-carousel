
export const raf = (cb: FrameRequestCallback): number => window.requestAnimationFrame(cb) || window.setTimeout(cb, frameRateMilli)

const frameRateMilli: number = Number(1000 / 60)

export function easeInOutQuad(time: number, start: number, change: number, duration: number): number {
  let timeDMilli = time
  timeDMilli /= duration / 2
  if (timeDMilli < 1) {
    return change / 2 * timeDMilli * timeDMilli + start
  }
  timeDMilli--
  return -change / 2 * (timeDMilli * (timeDMilli - 2) - 1) + start
}

export function scrollTo(element: HTMLElement, to: number, duration: number = 300, direction: string = 'scrollLeft', callback?: Function) {
  const start = element[direction]
  const change = to - start
  const frameRate = frameRateMilli
  const framesLength = Math.ceil(duration / frameRate)
  const frames = [...Array(framesLength)].map((_, index) =>
    easeInOutQuad(frameRate * index, start, change, duration))
  let currentTimeMilli = 0

  const animateScroll = () => {
    currentTimeMilli += frameRate
    if (duration === 0) {
      element[direction] = to
      callback && callback()
    } else if (currentTimeMilli < duration) {
      element[direction] = frames.shift()
      raf(animateScroll)
    } else {
      callback && callback()
    }
  }
  animateScroll()
}

export function debounce(func: Function, wait?: number, immediate?: boolean) {
	let timeout: number | undefined;
	return function(this: any, ...args: any[]) {
		const context = this//, args = arguments;
		const later = () => {
			timeout = undefined;
			if (!immediate) { func.apply(context, args); }
		};
		const callNow = immediate && !timeout;
		window.clearTimeout(timeout);
		timeout = window.setTimeout(later, wait);
		if (callNow) { func.apply(context, args); }
	}
}