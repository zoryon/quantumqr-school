import LoadingSpinner from "./LoadingSpinner";

const LoadingScreen = () => {
    return (
        <div className="w-full h-[88vh] flex justify-center items-center">
            <LoadingSpinner />
        </div>
    );
}

export default LoadingScreen;