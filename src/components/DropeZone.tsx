"use client";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

export default function DropZone() {
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: { "application/pdf": [".pdf"] },
		maxFiles: 1,
		onDrop: (files) => {
			console.log(files[0]);
		},
	});

	return (
		<div
			{...getRootProps()}
			className={
				isDragActive
					? "flex flex-col items-center text-center py-12 px-24 w-3xl  border-2  border-solid rounded-lg border-[#06D6A0]  bg-[#06D6A0]/3 transition duration-200 -translate-y-1"
					: "flex flex-col items-center text-center py-12 px-24 w-3xl bg-gray-900 border-2 border-gray-800 border-dashed rounded-lg hover:border-[#06D6A0]  hover:bg-[#06D6A0]/3 transition duration-200 hover:-translate-y-1"
			}
		>
			<input {...getInputProps()} />
			<Upload
				size={100}
				className="p-6 mb-10 bg-[#06D6A0]/10 rounded-xl text-[#06D6A0]"
			/>
			<div className="flex flex-col items-center gap-2">
				{isDragActive ? (
					<div>
						<p className="text-2xl tracking-wide">On glisse...</p>
						<p className="text-lg text-[#8b949e] tracking-wide">
							...et on relâche
						</p>
					</div>
				) : (
					<div>
						<p className="text-2xl tracking-wide">
							Glissez votre facture PDF ici
						</p>
						<p className="text-lg text-[#8b949e] tracking-wide">
							Ou cliquez pour parcourir
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
