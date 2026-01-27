"use client";

import { UploadDropzone } from "@/utils/uploadthing";

export default function DropZoneBis() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<UploadDropzone
				endpoint="pdfUploader"
				onClientUploadComplete={(res) => {
					const fileUrl = res[0].ufsUrl;
					console.log("PDF uploadé:", fileUrl);
				}}
				onUploadError={(error) => {
					console.error("Erreur:", error.message);
				}}
			/>
		</main>
	);
}
