import BackBtn from "@/components/Buttons/BackBtn";
import PaintMarkdown from "@/components/PaintMarkdown";

const PrivacyPolicyPage = () => {
    const apiPath = "/api/policies?type=privacy-policy";
    return (
        <div className="mx-auto max-w-2xl p-4">
            <BackBtn />
            <PaintMarkdown apiPath={apiPath} />
        </div>
    );
}

export default PrivacyPolicyPage;