import { QrCreatorProvider } from "@/hooks/use-qrcode-creator";
import { QrCodeListProvider } from "@/hooks/use-qrcode-list";
import { UserDataProvider } from "@/hooks/use-user-data";

const Providers = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <UserDataProvider>
            <QrCodeListProvider>
                <QrCreatorProvider>
                    {children}
                </QrCreatorProvider>
            </QrCodeListProvider>
        </UserDataProvider>
    );
}

export default Providers;