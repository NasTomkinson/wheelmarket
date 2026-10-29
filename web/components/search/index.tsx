"use client";

import { useState } from "react"

export default function Search () {

    const [advancedSearch, setAdvancedSearch] = useState<boolean>(false)

    function switchSearchModes () {
        setAdvancedSearch(prev => !prev)
    }

    return (
        <div className="search">

            { advancedSearch && (
                <ul className="flex items-center gap-4">
                    <li className="flex flex-col"> 
                        <label className="text-sm italic font-bold" > Size </label>
                        <select> 
                            <option> 5 x 112 </option>
                            <option> 5 x 120 </option>
                        </select>
                    </li>
                    <li className="flex flex-col"> 
                        <label className="text-sm italic font-bold" > Offset (ET) </label>
                        <select> 
                            <option> +35 </option>
                            <option> +38 </option>
                        </select>
                    </li>
                    <li className="flex flex-col"> 
                        <label className="text-sm italic font-bold" > J </label>
                        <select> 
                            <option> 8J </option>
                            <option> 8.5J </option>
                        </select>
                    </li>
                </ul> 
            )}
            
            { !advancedSearch && (
                <input type="text" />
            )}

            
            <button className="text-sm italic font-bold" onClick={() => switchSearchModes()}> 
                { advancedSearch ? 'Basic Search' : 'Advanced Search'}
            </button>
        </div>
    )
}