import React, { FC, ReactNode } from 'react'

export interface CarouselItemProps {
  children: ReactNode,
  className: string
}

const CarouselItem: FC<CarouselItemProps> = ({ children, className }) => (
  <li className={className}>
    {children}
  </li>
)

export default CarouselItem