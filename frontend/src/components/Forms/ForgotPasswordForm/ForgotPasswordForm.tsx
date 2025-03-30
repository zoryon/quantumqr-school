
import ResetPasswordForm from "./ResetPasswordForm";
import SendResetEmailForm from "./SendResetEmailForm";

const ForgotPasswordForm = ({ token }: { token?: string }) => {
    return (
        token ? (
            <ResetPasswordForm token={token} />
        ) : (
            <SendResetEmailForm />
        )
    );
}

export default ForgotPasswordForm;