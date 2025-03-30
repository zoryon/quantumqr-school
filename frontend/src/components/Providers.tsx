import { QrCreatorProvider } from "@/hooks/use-qrcode-creator";
import { QrCodeListProvider } from "@/hooks/use-qrcode-list";

const Providers = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <QrCodeListProvider>
            <QrCreatorProvider>
                {children}
            </QrCreatorProvider>
        </QrCodeListProvider>
    );
}

export default Providers;