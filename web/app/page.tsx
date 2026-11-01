"use client";

import ProductCard from "@/components/productCard";
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
 
        Homepage

      </main>
    </div>
  );
}
