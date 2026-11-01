import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules";
import { getStrapiMediaUrl } from "@/utils/helpers";
import Image from 'next/image'
 
export default function CardGallery(slides: any) {
  
    return (
        <Swiper
            modules={[Pagination]}
            spaceBetween={0}
            slidesPerView={1} 
            loop={true}
            pagination={{ clickable: true }}
            > 
            {  slides?.slides.map((image, key: number) => { 
                return (
                    <SwiperSlide key={key}> 
                        <Image  
                            className="w-full h-full object-cover"
                            src={getStrapiMediaUrl(image.url)}
                            alt={image.alternativeText}
                            width={400}
                            height={200} 
                        /> 
                    </SwiperSlide>
                )
            })}
        </Swiper>
    )
}