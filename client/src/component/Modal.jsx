import { useRef } from "react";

export const Modal = ({ children, close }) => {
    const modal = useRef();

    // do I need to clean this up after the modal closes?
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.key === "Esc") {
            if (close)
                close();
        }
    });

    const shouldClose = e => {
        if (e.target === modal.current && close)
            close();
    };

    return (
        <div className="modal overflow-x-hidden overflow-y-auto outline-none focus:outline-none
            backdrop-blur-md flex justify-center items-center" onClick={shouldClose} ref={modal}>
            { children }
        </div>
    );
};