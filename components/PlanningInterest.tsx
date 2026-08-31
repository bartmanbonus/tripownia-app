"use client";
import { useState } from "react";
import { BellRing, CheckCircle2 } from "lucide-react";

export default function PlanningInterest(){
 const [period,setPeriod]=useState("Lato 2027");
 const [airport,setAirport]=useState("Warszawa");
 const [budget,setBudget]=useState("3000");
 const [saved,setSaved]=useState(false);
 function save(){
   const item={period,airport,budget,createdAt:new Date().toISOString()};
   const old=JSON.parse(localStorage.getItem("tripownia-plans")||"[]");
   localStorage.setItem("tripownia-plans",JSON.stringify([...old,item]));
   setSaved(true);
 }
 return <div className="planning-interest">
   <div><BellRing size={25}/><h2>Zapisz plan podróży</h2><p>Na tym etapie zapisujemy go w Twojej przeglądarce. Gdy uruchomimy konta i alerty cenowe, ten moduł będzie bazą do prawdziwych powiadomień.</p></div>
   <div className="planning-fields">
    <label>Kiedy?<select value={period} onChange={e=>setPeriod(e.target.value)}><option>Sylwester 2026/27</option><option>Ferie 2027</option><option>Majówka 2027</option><option>Lato 2027</option></select></label>
    <label>Skąd?<select value={airport} onChange={e=>setAirport(e.target.value)}><option>Warszawa</option><option>Kraków</option><option>Katowice</option><option>Gdańsk</option><option>Wrocław</option><option>Poznań</option></select></label>
    <label>Budżet / os.<input value={budget} onChange={e=>setBudget(e.target.value.replace(/\D/g,""))} inputMode="numeric"/></label>
    <button onClick={save}>{saved?<><CheckCircle2 size={17}/> Plan zapisany</>:<>Zapisz zainteresowanie</>}</button>
   </div>
 </div>
}
