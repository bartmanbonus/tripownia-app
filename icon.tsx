import { ImageResponse } from "next/og";
export const size={width:64,height:64}; export const contentType="image/png";
export default function Icon(){return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#ff4d27",color:"white",fontSize:36,fontWeight:900,borderRadius:16}}>T</div>,{...size})}
