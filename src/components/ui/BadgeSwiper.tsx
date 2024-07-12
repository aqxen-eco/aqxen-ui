import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { useEffect } from 'react'
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md'
import Swiper from 'swiper'
import { Navigation, Pagination } from 'swiper/modules'

export function BadgeSwiper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const swiper = new Swiper('.swiper', {
      modules: [Navigation, Pagination],
      pagination: {
        el: '.swiper-pagination',
        dynamicBullets: true,
        clickable: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      slidesPerView: 2,
      breakpoints: {
        768: {
          slidesPerView: 4
        }
      }
    })

    return () => {
      if (swiper.destroy) {
        swiper.destroy()
      }
    }
  }, [])

  return (
    <div className="swiper !px-8">
      {children}
      <div className="swiper-pagination [&_>_.swiper-pagination-bullet]:bg-white"></div>
      <div className="swiper-button-prev !h-10 !w-10 p-1 after:hidden">
        <MdKeyboardArrowLeft className="h-4 w-4 text-white" />
      </div>
      <div className="swiper-button-next !h-10 !w-10 p-1 after:hidden">
        <MdKeyboardArrowRight className="h-4 w-4 text-white" />
      </div>
    </div>
  )
}

export function BadgeSwiperWrapper({ children }: { children: React.ReactNode }) {
  return <div className="swiper-wrapper pb-8">{children}</div>
}

export function BadgeSwiperSlide({ children }: { children: React.ReactNode }) {
  return <div className="swiper-slide">{children}</div>
}
