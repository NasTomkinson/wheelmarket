import { parseCurrency } from "@/utils/helpers";
import CardGallery from './_components/gallery';
 

export default function ProductCard ({ brand, title, price, images}) {  

    return (
        <div className="flex flex-col justify-start gap-2 border border-neutral-light shadow-xl rounded-xl overflow-hidden backdrop-blur-3xl">
            <div className="aspect-video overflow-hidden">
                { images && (
                    <CardGallery slides={images} />
                )}
                
            </div> 
            <div className="flex flex-col gap-4 p-4">

                <div className="flex flex-row items-end justify-between">
                    <div>
                        { brand && (
                            <span className="uppercase text-sm"> { brand.name } </span>
                        )}
                        { title && (
                            <h3 className="text-xl"> {title} </h3>     
                        )}
                                             
                    </div>
                    <div>
                        <span className="text-xl font-semibold"> { parseCurrency(price) } </span>
                    </div>
                </div>


                <ul className="grid grid-cols-4 w-full">
                    <li className="text-neutral flex flex-col"> 
                        <span className="uppercase text-xs font-semibold"> PCD </span>
                        <span> 5x112 </span> 
                    </li> 
                    <li className="text-neutral flex flex-col"> 
                        <span className="uppercase text-xs font-semibold"> Width </span>
                        <span> 9J </span> 
                    </li> 
                    <li className="text-neutral flex flex-col"> 
                        <span className="uppercase text-xs font-semibold"> Bore (MM)</span>
                        <span> 57.1 </span> 
                    </li> 
                    <li className="text-neutral flex flex-col"> 
                        <span className="uppercase text-xs font-semibold"> Offset </span>
                        <span> ET38 </span> 
                    </li> 
                </ul>
            </div>
        </div>
    )
}