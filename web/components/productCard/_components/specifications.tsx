import type { Listing } from "@/utils/strapi/listings";

type WheelSpecificationsProps = {
    specs: NonNullable<Listing["wheelSpecifications"]>;
    condition: Listing["condition"];
    quantity: number;
};

export default function WheelSpecifications ({specs, condition, quantity}: WheelSpecificationsProps) {

    const pcd = specs.pcd_bolt_pattern;
    const PCD = pcd ? `${pcd.bolts}x${pcd.spacing}` : "—";
    const conditionLabels: Record<Listing["condition"], string> = {
        "new": "New",
        "used": "Used",
        "refurbished": "Refurbished",
        "damaged": "Damaged"
    };

    return (
        <ul className="grid grid-cols-2 gap-2 w-full">
            <li className="flex flex-col"> 
                <span className="uppercase font-bold text-[11px]"> PCD </span>
                <span className="text-sm"> {PCD} </span> 
            </li> 
            <li className="flex flex-col"> 
                <span className="uppercase font-bold text-[11px]"> Size </span>
                <span className="text-sm"> {quantity} x {`${specs.diameter}"`} </span> 
            </li> 
            <li className="flex flex-col"> 
                <span className="uppercase font-bold text-[11px]"> Condition </span>
                <span className="text-sm"> {conditionLabels[condition]} </span> 
            </li> 
            <li className="flex flex-col"> 
                <span className="uppercase font-bold text-[11px]"> Width / Offset </span>
                <span className="text-sm"> {specs.width}J / ET{specs.offset} </span> 
            </li> 
        </ul>  
    );
}
