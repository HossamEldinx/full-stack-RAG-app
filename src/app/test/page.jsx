/* eslint-disable react/display-name */
"use client";
"use strict";

import React, { useEffect, useRef, useState, memo } from "react";
import { createClient } from "@supabase/supabase-js";
import { SourceLink, InputBox, MessageCreation, MoreQuestion , Headers } from "@/components"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


const SUPABASE_URL = "";
const SUPABASE_ANON_KEY ="";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



export default function Home() {

    const messagesEndRef = useRef(null);
    const [inputValue, setInputValue] = useState("");
    const [messageHistory, setMessageHistory] = useState([]);


    useEffect(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 0);
    }, [messageHistory]);



    useEffect(() => {
        
        const handleInserts = (payload) => {
            setMessageHistory((prevMessages) => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                const isSameType = lastMessage?.payload?.type === "Markdown" && payload.new.payload.type === "Markdown";
                return isSameType ? [...prevMessages.slice(0, -1), payload.new] : [...prevMessages, payload.new];
            });
        };
        supabase
            .channel("chat_history")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_history" }, handleInserts)
            .subscribe();

      supabase
            .from("chat_history")
            .select("*")
            .order("created_at", { ascending: true })
            .then(({ data: chat_history, error }) =>
                error ? console.log("error", error) : setMessageHistory(chat_history)
            );
    }, []);



  
    const sendMessage = (messageToSend) => {
        const message = messageToSend || inputValue;
        const body = JSON.stringify({ message: message });
        setInputValue("");
        fetch("/api/rag", {
            method: "POST",
            body,
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("data", data);
            })
            .catch((err) => console.log("err", err));
    };


    return (
        <div className="flex h-screen">

            <div className="flex-grow h-screen flex flex-col justify-between mx-auto max-w-4xl px-4 chat-area">

                { messageHistory && messageHistory.map((message, index) => (
                    <div key={index}>
                        <MessageHandler key={index} message={message.payload} sendMessage={sendMessage} />
                    </div>
                ))}

                <InputBox inputValue={inputValue} setInputValue={setInputValue} sendMessage={sendMessage} />

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}







// render the html 
const Markdown = ({ content }) => (
    <ReactMarkdown
        className="prose mt-1 w-full break-words prose-p:leading-relaxed  py-3 px-3 mark-down"
        remarkPlugins={[remarkGfm]}
        components={{
            a: ({ node, ...props }) => <a {...props} style={{ color: "#27afcf", fontWeight: "bold" }} />,
        }}
    >
        
        {content}
    </ReactMarkdown>
);


const ContentRender = ({ content }) => {
    return <div className="text-3xl font-bold my-4 w-full">{content}</div>;
};


const MessageHandler = memo(({ message, sendMessage }) => {
    const COMPONENT_MAP = {
        ContentRender,
        SourceLink,
        MessageCreation,
        Headers,
        Markdown,
        MoreQuestion,
    };
    const Component = COMPONENT_MAP[message.type];
    return Component ? <Component content={message.content} sendMessage={sendMessage} /> : null;
});
