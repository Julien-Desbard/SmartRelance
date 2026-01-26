import { Button } from "@/components/ui/button";

export default function DemoZone() {
	return (
		<div>
			<a href="/facture_demo.pdf" download>
				<Button className="text-lg">Télécharger une facture de test</Button>
			</a>
		</div>
	);
}
