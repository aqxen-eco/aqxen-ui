import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom'

import { button, ButtonVariants } from '@/styles/button'

interface LinkProps extends RouterLinkProps, ButtonVariants {}

export function Link({ size, variant, className, children, ...restProps }: LinkProps) {
  return (
    <RouterLink className={button({ size, variant, class: className })} {...restProps}>
      {children}
    </RouterLink>
  )
}
