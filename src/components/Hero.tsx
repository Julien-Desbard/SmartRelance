import { ReceiptEuro } from "lucide-react";
import DropZone from "@/components/DropeZone";

export default function Hero() {
	return (
		<>
			<div className="w-screen min-h-screen flex flex-col items-center justify-center p-10 bg-linear-to-b from-[#0a0e14] to-[#14181f]">
				{/* Header */}
				<div className="flex items-center mb-10 gap-2.5">
					<div>
						<ReceiptEuro size={40} 
						className="text-[#06d6a0]"/>
					</div>
					<h1 className="font-bold text-4xl bg-linear-to-br from-[#06d6a0] to-[#00b4d8] bg-clip-text text-transparent tracking-wide">SmartRelance</h1>
				</div>
				{/* Hero text */}
				<div>
					<div className="flex flex-col items-center mb-15">
						<h2 className="font-extrabold text-6xl/18 text-center mb-6 tracking-wide">
							Relancez vos clients <br />
							<span className="bg-[linear-gradient(135deg,#06d6a0,#00b4d8)] bg-clip-text text-transparent">Automatiquement</span>
						</h2>
						<p className="text-[#8b949e] text-xl tracking-wide">
							Uploadez vos factures. L&apos;IA relance. Vous encaissez.
						</p>
					</div>
				</div>
				{/* Zone d'upload */}
				<div>
					<DropZone />
				</div>
			</div>
		</>
	);
}
