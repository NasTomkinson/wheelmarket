"use client";

import { useEffect, useState } from "react";

export default function Home() {
  
  // Store PCD Options
  const [PCDs, setPCDs] = useState([])

  // GET PCD Options
  useEffect(() => {

    async function getPCD(){

      const PCDResp = await fetch("/api/configuration", {
        method: "GET"
      })

      const PCDData = await PCDResp.json()
  
      setPCDs(PCDData.data)
    }

    getPCD() 
  }, [])

  return (
    <div className=" ">
      <main> 
        <div className="container py-4 flex flex-row items-center gap-4"> 
          {PCDs.length > 0 && (
            <div className="flex flex-col justify-start"> 
              <label className="text-slate-600 font-semibold text-sm italic"> PCD / Bolt Pattern </label>
              <select className="flex flex-col justify-center border-2 font-semibold rounded p-2 tracking-widest"> 
                { PCDs.map((PCD, index) => {
                  return (
                    <option key={index} className=""> {PCD?.bolts}x{PCD?.spacing}</option>
                  )
                })}
              </select>
            </div>
          )}

          <div className="flex flex-col justify-start"> 
            <label className="text-slate-600 font-semibold text-sm italic"> Width (J) </label>
            <select className="flex flex-col justify-center border-2  font-semibold rounded p-2 tracking-widest"> 
              <option  className=""> 8J </option>
              <option  className=""> 8.5J </option>
              <option  className=""> 9J </option>
              <option  className=""> 9.5J </option>
              <option  className=""> 10J </option>
            </select>
          </div>

          <div className="flex flex-col justify-start"> 
            <label className="text-slate-600 font-semibold text-sm italic"> Size (inch) </label>
            <select className="flex flex-col justify-center border-2  font-semibold rounded p-2 tracking-widest"> 
              <option  className=""> 14 </option>
              <option  className=""> 15 </option>
              <option  className=""> 16 </option>
              <option  className=""> 17 </option>
              <option  className=""> 18 </option>
              <option  className="" selected > 19 </option>
              <option  className=""> 20 </option>
              <option  className=""> 21 </option>
              <option  className=""> 22 </option>
              <option  className=""> 23 </option>
            </select>
          </div>
          
          <div className="flex flex-col justify-start"> 
            <label className="text-slate-600 font-semibold text-sm italic"> Size (inch) </label>
            <input type="checkbox" />
          </div>
        </div>
      </main>
    </div>
  );
}
