"use client";
import { useDropzone } from "react-dropzone";
import { useUploadThing } from "@/utils/uploadthing";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";

export default function DropZone() {
	const [isDragging, setIsDragging] = useState(false);

	// Monitoring drag & drop on the page
	const handleDragEnter = (e: DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};
	const handleDragLeave = (e: DragEvent) => {
		if (e.relatedTarget === null) {
			setIsDragging(false);
		}
	};
	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	useEffect(() => {
		window.addEventListener("dragenter", handleDragEnter);
		window.addEventListener("dragover", handleDragOver);
		window.addEventListener("dragleave", handleDragLeave);
		window.addEventListener("drop", handleDrop);

		return () => {
			window.removeEventListener("dragenter", handleDragEnter);
			window.removeEventListener("dragover", handleDragOver);
			window.removeEventListener("dragleave", handleDragLeave);
			window.removeEventListener("drop", handleDrop);
		};
	}, []);

	// Setting upLoadthing
	const { startUpload, isUploading } = useUploadThing("pdfUploader", {
		onClientUploadComplete: (res) => {
			console.log("PDF uploadé:", res[0].ufsUrl);
		},
		onUploadError: (error) => {
			console.error("Erreur:", error.message);
		},
	});

	const { getRootProps, getInputProps } = useDropzone({
		accept: { "application/pdf": [".pdf"] },
		maxFiles: 1,
		onDrop: (files) => {
			startUpload(files);
		},
	});

	const baseStyle =
		"flex flex-col items-center text-center py-12 px-24 w-3xl border-2 rounded-lg transition duration-200 ";
	const normalStyle =
		"bg-gray-900 border-gray-800 border-dashed hover:border-[#06D6A0] hover:bg-[#06D6A0]/3 hover:-translate-y-1";
	const draggingStyle =
		"border-dashed border-[#06D6A0] bg-[#06D6A0]/3 -translate-y-1";
	const uploadingStyle =
		"border-solid border-[#06D6A0] bg-[#06D6A0]/3 -translate-y-1";

	let titre = "Glissez votre facture PDF ici";
	let sousTitre = "Ou cliquez pour parcourir";

	if (isUploading) {
		titre = "Upload en cours...";
		sousTitre = "";
	} else if (isDragging) {
		titre = "On glisse...";
		sousTitre = "...et on relâche ICI";
	}

	return (
		<div
			{...getRootProps()}
			className={`${baseStyle} ${isDragging ? draggingStyle : isUploading ? uploadingStyle : normalStyle}`}
		>
			<input {...getInputProps()} />
			<Upload
				size={100}
				className="p-6 mb-10 bg-[#06D6A0]/10 rounded-xl text-[#06D6A0]"
			/>
			<div className="flex flex-col items-center gap-2">
				<p className="text-2xl tracking-wide">{titre}</p>
				{sousTitre && (
					<p className="text-lg text-[#8b949e] tracking-wide">{sousTitre}</p>
				)}
			</div>
		</div>
	);
}
