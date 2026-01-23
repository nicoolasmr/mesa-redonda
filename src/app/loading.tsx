import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <div className="relative flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute h-10 w-10 border-4 border-primary/20 rounded-full"></div>
            </div>
            <p className="mt-4 text-muted-foreground font-medium animate-pulse">
                Carregando...
            </p>
        </div>
    );
}
