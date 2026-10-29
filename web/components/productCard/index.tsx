export default function ProductCard () {
    return (
        <div className="flex flex-col justify-start gap-2 border border-neutral-light shadow-xl rounded-xl overflow-hidden backdrop-blur-3xl">
            <div className="aspect-video overflow-hidden">
                <img className="w-full h-full object-cover" src="https://www.bolawheels.co.uk/wp-content/uploads/2023/02/B19-MBR-1775-6-aspect-ratio-852-480.jpg" alt="Sample Image" />
            </div> 
            <div className="flex flex-col gap-4 p-4">

                <div className="flex flex-row items-end justify-between">
                    <div>
                        <span className="uppercase text-sm"> Brand </span>
                        <h3 className="text-xl"> Wheel Title </h3>                          
                    </div>
                    <div>
                        <span className="text-xl font-semibold"> £000.00 </span>
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