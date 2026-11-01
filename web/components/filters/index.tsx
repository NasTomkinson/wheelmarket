"use client";

import { useEffect, useState } from "react";
import Search from "../search";

export default function Filters () {

    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {

        async function getVehicles() {
            const res = await fetch("/api/vehicles", {
                method: "GET",
            })

            const resp = await res.json()

            console.log("resp", resp.data)
            setVehicles(resp.data)
        }

        getVehicles()
    }, [])

    return (
        <div className="flex flex-row justify-start items-center bg-transparent backdrop-blur-2xl border border-neutral-light px-4 py-3 rounded-xl"> 
            <div className="flex flex-col justify-start">
                <label className="font-semibold text-sm"> Filter by car </label>  
                <Search />                 
            </div>

             
            
        </div>
    )
}