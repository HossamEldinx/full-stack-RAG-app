import { ChatTeardropDots } from "@phosphor-icons/react";




const Headers = ({ content }) => {
    return (
        <div className="text-md font-bold my-4 w-40 flex px-2  py-1 bg-zinc-950 rounded-md">
            <ChatTeardropDots size={25} className="text-orange-600 " />
            <span className="px-2">{content}</span>
        </div>
    );
};



export default Headers