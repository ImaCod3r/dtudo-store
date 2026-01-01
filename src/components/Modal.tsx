import { XCircleIcon } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    children: React.ReactNode;
}

function Modal({ isOpen, children }: ModalProps) {

    return (
        <>
            {isOpen && (
                <div className="overlay bg-black/50 fixed inset-0 z-50 flex items-center justify-center">
                    <div className="modal w-[300px] sm:w-[500px] bg-white h-auto p-4 rounded-xl">
                        <button className="modal-close w-full flex justify-end">
                            <XCircleIcon />
                        </button>
                        <div className="modal-body">
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Modal;