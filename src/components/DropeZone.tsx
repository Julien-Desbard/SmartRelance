import { Upload } from "lucide-react";

export default function DropZone() {
	return (
		<div className="flex flex-col items-center text-center py-12 px-24 w-3xl bg-gray-900 border-2 border-gray-800 border-dashed rounded-lg hover:border-[#06D6A0]  hover:bg-[#06D6A0]/3 transition duration-200 hover:-translate-y-1">
			<Upload
      size={100} 
      className="p-6 mb-10 bg-[#06D6A0]/10 rounded-xl text-[#06D6A0]"/>
			<p className="text-2xl tracking-wide">Glissez votre facture PDF ici</p>
			<p className="text-lg text-[#8b949e] tracking-wide">Ou cliquez pour parcourir</p>
		</div>
	);
}
