import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "../../ui/button";
import { PublicUser } from "@/types";
import LogoutBtn from "@/components/Buttons/LogoutBtn";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AccountSettings = ({ userData }: { userData: PublicUser}) => {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDialogClose = () => {
        setIsDialogOpen(false);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 rounded-full bg-gray-800/50 px-3 py-1.5 transition-all hover:bg-gray-700/60">
                    <i className="fas fa-user-astronaut text-lg text-purple-400" />
                    <span className="text-sm font-medium text-gray-200 max-w-[120px] truncate">
                        {userData.username}
                    </span>
                    <i className="fas fa-chevron-down text-xs text-gray-400" />
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700 text-gray-100">
                <DialogHeader>
                    <DialogTitle className="text-gray-100">
                        Account Settings
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2 mt-5 mb-3">
                        <h3>
                            <span className="text-sm text-gray-400">
                                Username:{" "}
                            </span>
                            <span className="text-lg font-semibold">
                                {userData.username}
                            </span>
                        </h3>
                        <p className="text-sm text-gray-400">
                            Email: {userData.email}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full bg-gray-700/50 border-gray-600 hover:bg-gray-600/50"
                            onClick={() => {
                                router.push("/profile");
                                handleDialogClose();
                            }}
                        >
                            View Profile
                        </Button>
                        <LogoutBtn />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AccountSettings;