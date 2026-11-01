"use client";

import Filters from "@/components/filters";
import ProductCard from "@/components/productCard";
import { useEffect, useState } from "react";

export default function Search() {
  
  // Store PCD Options
  const [results, setResults] = useState([])

  // GET PCD Options
  useEffect(() => {

    async function getListings(){

      const PCDResp = await fetch("/api/search", {
        method: "GET"
      })

      const PCDData = await PCDResp.json()
  
      setResults(PCDData.data)
    }

    getListings() 
  }, [])

  return (
    <div className=" ">
      <main>   
        <section className="container my-4"> 
          <Filters />
        </section>
        <section className="container grid grid-cols-4 gap-4 mt-12">
          { results && results.length > 0 && results.map(result => (
            <ProductCard key={result?.id} {...result} />    
          ))} 
        </section> 
      </main>
    </div>
  );
}
