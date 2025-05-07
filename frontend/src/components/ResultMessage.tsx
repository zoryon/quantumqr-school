import { cn } from "@/lib/utils";
import { ResultType } from "@/types";

const ResultMessage = ({ success, message }: Omit<ResultType, "data">) => {
    return message && (
        <p className={cn(
            "text-xs",
            success ? "text-green-600" : "text-red-600"
        )}>
            {message}
        </p>
    );
}

export default ResultMessage;