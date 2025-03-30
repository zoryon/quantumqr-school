import BackBtn from "@/components/Buttons/BackBtn";
import PaintMarkdown from "@/components/PaintMarkdown";

const TermOfServicesPage = () => {
    const apiPath = "/api/policies?type=terms-of-service";

    return (
        <div className="mx-auto max-w-2xl p-4">
            <BackBtn />
            <PaintMarkdown apiPath={apiPath} />
        </div>
    );
}

export default TermOfServicesPage;