import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error = useRouteError();

    return (
        <div className="flex flex-col items-center space-y-8 justify-center h-screen">
            <h1 className="text-4xl font-semibold">Oops!</h1>
            <p className="text-lg font-medium">Sorry, an unexpected error has occurred.</p>
            <p className="text-stone-100 font-light">
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    );
}