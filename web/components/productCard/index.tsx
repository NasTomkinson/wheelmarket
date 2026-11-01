import { parseCurrency } from "@/utils/helpers";
import type { Listing } from "@/utils/strapi/listings";
import CardGallery from './_components/gallery';
import WheelSpecifications from './_components/specifications';
import { Icon } from "@/components/icon";

type ProductCardProps = Pick<
    Listing,
    "brand" | "title" | "price" | "images" | "wheelSpecifications" | "condition" | "quantity" | "seller" | "tyresIncluded"
>;

export default function ProductCard ({ brand, title, price, images, wheelSpecifications, condition, quantity, seller, tyresIncluded}: ProductCardProps) {

    return (
        <div className="flex flex-col justify-start gap-2  rounded-xl overflow-hidden backdrop-blur-3xl border border-neutral-light">
            <div className="aspect-video overflow-hidden">
                { images && images.length > 0 && (
                    <CardGallery slides={images} />
                )}
            </div>
            <div className="flex flex-col gap-2 px-4 py-2">
                <div className="flex flex-col justify-center items-start">
                    <div className="w-full uppercase text-sm font-semibold flex flex-row justify-between items-center gap-2">
                        { brand && (
                            <span> { brand.name } </span>
                        )}
                    </div>


                    <div className="flex flex-row gap-4 flex-nowrap w-full">
                        <span className=""> { parseCurrency(price) } </span>

                        { title && (
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap"> {title} </span>
                        )}
                    </div>
                </div>
                <div className="border-y border-neutral-light py-2">
                    { wheelSpecifications && (
                        <WheelSpecifications specs={wheelSpecifications} condition={condition} quantity={quantity} />
                    )}
                </div>

                <div className="flex flex-row justify-between items-center"> 
                    {seller?.location && (
                        <div className="flex flex-row items-center gap-1">
                            <Icon name="mdi:map-marker-outline" className="w-4 h-4" />
                            <p className="text-sm"> {seller.location}</p>
                        </div>
                    )} 
                    <div className="flex flex-row items-center gap-1 rounded-full border border-neutral-light px-2 py-1"> 
                        <p className="text-sm"> {tyresIncluded ? "Tyres included" : "Alloys only"} </p>
                    </div> 
                </div>

            </div>
        </div>
    );
}
