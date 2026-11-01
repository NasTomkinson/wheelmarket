import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules";
import { getStrapiMediaUrl } from "@/utils/helpers";
import type { ListingImage } from "@/utils/strapi/listings";
import Image from 'next/image'

export default function CardGallery({ slides }: { slides: ListingImage[] }) {
  
    return (
        <Swiper
            modules={[Pagination]}
            spaceBetween={0}
            slidesPerView={1} 
            loop={true}
            pagination={{ clickable: true }}
            > 
            {slides.map((image) => {
                return (
                    <SwiperSlide key={image.documentId}>
                        <Image  
                            className="w-full h-full object-cover"
                            src={getStrapiMediaUrl(image.url)}
                            alt={image.alternativeText ?? "Wheel listing image"}
                            width={400}
                            height={200} 
                        /> 
                    </SwiperSlide>
                )
            })}
        </Swiper>
    );
}
