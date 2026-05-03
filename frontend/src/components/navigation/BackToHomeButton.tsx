import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function BackToHomeButton() {
  return (
    <Button asChild variant="outline">
      <Link to="/">Retour à l’accueil</Link>
    </Button>
  );
}

export default BackToHomeButton;
