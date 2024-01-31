import React, { useEffect, useRef, useState } from "react";
import { ChatCircleText } from "@phosphor-icons/react";


const MoreQuestion = ({ content, sendMessage }) => {
    //storing parsed follow-up options
    const [followUp, setFollowUp] = useState([]);
    //for scrolling
    const messagesEndReff = useRef(null);
    // Scroll into view when followUp changes
    useEffect(() => {
        setTimeout(() => {
            messagesEndReff.current?.scrollIntoView({ behavior: "smooth" });
        }, 0);
    }, [followUp]);



    //extract questions
    useEffect(() => {
        if (content[0] === "{" && content[content.length - 1] === "}") {
            try {
                const parsed = JSON.parse(content);
                setFollowUp(parsed.follow_up || []);
            } catch (error) {
                console.log("error parsing json", error);
            }
        }
    }, [content]);



    const handleFollowUpClick = (text, e) => {
        e.preventDefault();
        sendMessage(text);
    };

    return (
        <>
            {followUp.length > 0 && (
                <div className="text-md font-bold my-4 w-60 flex px-2  py-1 bg-zinc-950 rounded-md">
                    <ChatCircleText size={25} className="text-orange-600 " />
                    <span className="px-2">Related Questions</span>
                </div>
            )}

            {followUp.map((text, index) => (
                <div key={index} className="w-full my-3">
                    <a href="#"  className="more-question w-auto  p-2 bg-zinc-950 rounded-lg " onClick={(e) => handleFollowUpClick(text, e)}>
                        <span>{text}</span>
                    </a>
                </div>
            ))}

            <div ref={messagesEndReff} />
        </>
    );
};


export default MoreQuestion